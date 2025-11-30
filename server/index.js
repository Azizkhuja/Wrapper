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
        // Always delete and re-download to ensure latest version (crucial for bypassing YouTube blocks)
        if (fs.existsSync(ytDlpBinaryPath)) {
            fs.unlinkSync(ytDlpBinaryPath);
        }

        console.log('Downloading latest yt-dlp binary...');
        await YTDlpWrap.downloadFromGithub(ytDlpBinaryPath);
        console.log('Downloaded yt-dlp binary');

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

const cookiesPath = path.join(__dirname, 'cookies.txt');
const ensureCookies = () => {
    if (process.env.YOUTUBE_COOKIES) {
        try {
            let cookiesContent = process.env.YOUTUBE_COOKIES;
            // Fix potential newline issues from env var pasting (common in some dashboards)
            if (cookiesContent.includes('\\n')) {
                cookiesContent = cookiesContent.replace(/\\n/g, '\n');
            }

            // Basic validation
            if (cookiesContent.trim().startsWith('[') || cookiesContent.trim().startsWith('{')) {
                console.warn('WARNING: YOUTUBE_COOKIES appears to be in JSON format. yt-dlp requires Netscape format (cookies.txt).');
            }

            fs.writeFileSync(cookiesPath, cookiesContent);
            console.log('Cookies file created. Length:', cookiesContent.length);
            console.log('First line:', cookiesContent.split('\n')[0]);
        } catch (err) {
            console.error('Error creating cookies file:', err);
        }
    } else {
        console.log('No YOUTUBE_COOKIES environment variable found');
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

        const args = [
            videoURL,
            '--dump-json'
        ];

        if (fs.existsSync(cookiesPath)) {
            args.push('--cookies', cookiesPath);
        }
        args.push('--extractor-args', 'youtube:player_client=tv');


        const metadata = await ytDlpWrap.execPromise(args);

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
        const args = [
            videoURL,
            '--dump-json'
        ];
        if (fs.existsSync(cookiesPath)) {
            args.push('--cookies', cookiesPath);
        }
        args.push('--extractor-args', 'youtube:player_client=tv');

        const metadata = await ytDlpWrap.execPromise(args);
        const info = JSON.parse(metadata);
        const title = info.title.replace(/[^\w\s]/gi, '');

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        res.header('Content-Type', 'video/mp4');

        // Try multiple format strategies
        // 1. Try pre-merged mp4 with audio+video (usually 720p or lower)
        // 2. If not found, fall back to best available (may need ffmpeg, but yt-dlp will handle it)
        const formatOptions = 'best[ext=mp4][acodec!=none][vcodec!=none]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best';

        const streamArgs = [
            videoURL,
            '-f', formatOptions,
            '--merge-output-format', 'mp4',
            '--ffmpeg-location', ffmpegPath,
            '-o', '-'
        ];

        if (fs.existsSync(cookiesPath)) {
            streamArgs.push('--cookies', cookiesPath);
        }
        streamArgs.push('--extractor-args', 'youtube:player_client=tv');

        const stream = ytDlpWrap.execStream(streamArgs);

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
ensureCookies();
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

