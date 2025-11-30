const express = require('express');
const cors = require('cors');
const YTDlpWrap = require('yt-dlp-wrap').default;
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const app = express();
app.use(cors());

const ytDlpBinaryPath = path.join(__dirname, 'yt-dlp');
const ytDlpWrap = new YTDlpWrap(ytDlpBinaryPath);

// Ensure binary exists and permissions are set
const ensureBinary = async () => {
    try {
        if (!fs.existsSync(ytDlpBinaryPath)) {
            console.log('Downloading yt-dlp binary...');
            await YTDlpWrap.downloadFromGithub(ytDlpBinaryPath);
            console.log('Downloaded yt-dlp binary');
        }
        // Ensure executable permissions
        try {
            fs.chmodSync(ytDlpBinaryPath, '755');
        } catch (e) {
            console.log('Error setting permissions:', e);
        }
    } catch (err) {
        console.error('Error in ensureBinary:', err);
    }
};

app.get('/', (req, res) => {
    res.send('Server is running and healthy!');
});

app.get('/info', async (req, res) => {
    try {
        const videoURL = req.query.url;
        console.log('Received info request for:', videoURL);
        if (!videoURL) {
            return res.status(400).json({ error: 'No URL provided' });
        }

        const metadata = await ytDlpWrap.execPromise([
            videoURL,
            '--dump-json'
        ]);

        const info = JSON.parse(metadata);

        res.json({
            title: info.title,
            thumbnail: info.thumbnail,
            duration: info.duration_string
        });
    } catch (error) {
        console.error('Error fetching info:', error);
        // Return detailed error for debugging
        res.status(500).json({
            error: 'Failed to fetch video info',
            details: error.message,
            stderr: error.stderr
        });
    }
});

app.get('/download', async (req, res) => {
    try {
        const videoURL = req.query.url;
        if (!videoURL) {
            return res.status(400).json({ error: 'No URL provided' });
        }

        // Get title first for filename
        const metadata = await ytDlpWrap.execPromise([
            videoURL,
            '--dump-json'
        ]);
        const info = JSON.parse(metadata);
        const title = info.title.replace(/[^\w\s]/gi, '');

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        res.header('Content-Type', 'video/mp4');

        // Try multiple format strategies
        // 1. Try pre-merged mp4 with audio+video (usually 720p or lower)
        // 2. If not found, fall back to best available (may need ffmpeg, but yt-dlp will handle it)
        const formatOptions = 'best[ext=mp4][acodec!=none][vcodec!=none]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best';

        const stream = ytDlpWrap.execStream([
            videoURL,
            '-f', formatOptions,
            '--merge-output-format', 'mp4',
            '--ffmpeg-location', ffmpegPath,
            '-o', '-'
        ]);

        stream.pipe(res);

        stream.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).send('Download failed');
            }
        });

    } catch (error) {
        console.error('Error downloading video:', error);
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Failed to download video',
                details: error.message
            });
        }
    }
});

const PORT = process.env.PORT || 4000;
// Initialize binary then start server
ensureBinary().then(() => {
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.log('Uncaught Exception:', error);
});

