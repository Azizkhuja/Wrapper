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
const { exec } = require('child_process');

// Ensure binary exists and permissions are set
const ensureBinary = async () => {
    try {
        const tempPath = ytDlpBinaryPath + '.new';
        console.log('Attempting to download latest yt-dlp binary...');

        try {
            // Try downloading to temp file first
            await YTDlpWrap.downloadFromGithub(tempPath);
            console.log('Downloaded to temp path');

            // If successful, rename to actual path
            if (fs.existsSync(ytDlpBinaryPath)) {
                fs.unlinkSync(ytDlpBinaryPath);
            }
            fs.renameSync(tempPath, ytDlpBinaryPath);
            console.log('Updated yt-dlp binary successfully');
        } catch (downloadError) {
            console.error('Standard download failed:', downloadError.message);

            // Fallback to curl if standard download fails
            console.log('Trying fallback download with curl...');
            await new Promise((resolve, reject) => {
                exec(`curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o "${ytDlpBinaryPath}"`, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Curl failed:', stderr);
                        reject(error);
                    } else {
                        console.log('Curl download successful');
                        resolve();
                    }
                });
            });
        }

        // Verify binary exists
        if (!fs.existsSync(ytDlpBinaryPath)) {
            throw new Error('Binary not found after download attempts');
        }

        // Ensure executable permissions
        try {
            fs.chmodSync(ytDlpBinaryPath, '755');
        } catch (e) {
            console.log('Error setting permissions:', e);
        }
    } catch (err) {
        console.error('CRITICAL ERROR in ensureBinary:', err);
        // Don't exit process, but log heavily. 
        // If binary is missing, requests will fail, but maybe it exists from previous run?
        if (fs.existsSync(ytDlpBinaryPath)) {
            console.log('Recovered: Using existing binary despite update failure');
        } else {
            console.error('FATAL: No yt-dlp binary available');
        }
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

            // Force Netscape header if missing
            if (!cookiesContent.startsWith('# Netscape HTTP Cookie File')) {
                cookiesContent = '# Netscape HTTP Cookie File\n' + cookiesContent;
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
            '--dump-json',
            '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ];

        if (fs.existsSync(cookiesPath)) {
            args.push('--cookies', cookiesPath);
        }


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
            '--dump-json',
            '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ];

        if (fs.existsSync(cookiesPath)) {
            args.push('--cookies', cookiesPath);
        }

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
        streamArgs.push('--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

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

