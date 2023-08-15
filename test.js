const express = require('express');
const app = express();
const path = require('path');
const ytdl = require('ytdl-core');
const { spawn } = require('child_process')

let playing = false;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to fetch video info from YouTube URL
app.get('/stream', async (req, res) => {
    try {
        const videoUrl = req.query.url;
        streamYouTubeAudio(videoUrl);
        
        res.json(playing);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching video info.' });
    }
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const streamYouTubeAudio = async (url) => {
    if (playing) {
        return;
    }
    try {
        const audioStream = ytdl(url, { filter: 'audioonly' });

        const mpv = spawn('mpv', ['-']);
        playing = true;
        audioStream.pipe(mpv.stdin);

        mpv.on('close', (code) => {
            console.log(`aplay process exited with code ${code}`);
            playing = false;
        });
    } catch (error) {
        console.error('Error streaming audio:', error);
        playing = false;
    }
};

