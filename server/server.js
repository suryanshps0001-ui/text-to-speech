require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");
const rateLimit = require("express-rate-limit");

const SpeechHistory = require("./models/SpeechHistory");

const app = express();

const ttsLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use(cors());
app.use(express.json());

const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY
});

const audioFolder = path.join(__dirname, "audio");

if (!fs.existsSync(audioFolder)) {
    fs.mkdirSync(audioFolder);
}

app.use("/audio", express.static(audioFolder));

app.use(express.static(path.join(__dirname, "../client")));

const abusiveWords = [
    "fuck",
    "fucking",
    "shit",
    "bitch",
    "asshole",
    "bastard"
];

const supportedLanguages = [
    "en-US",
    "hi-IN"
];

function splitText(text) {
    const pattern = new RegExp(
        "\\b(" + abusiveWords.join("|") + ")\\b",
        "gi"
    );

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: "speech",
                text: text.substring(
                    lastIndex,
                    match.index
                )
            });
        }

        parts.push({
            type: "beep",
            text: match[0]
        });

        lastIndex =
            match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push({
            type: "speech",
            text: text.substring(lastIndex)
        });
    }

    return parts;
}

function runFFmpeg(inputFiles, outputFile) {
    return new Promise((resolve, reject) => {
        const listFile =
            path.join(
                audioFolder,
                `concat-${Date.now()}.txt`
            );

        const content =
            inputFiles
                .map(function (file) {
                    return `file '${file.replace(/\\/g, "/")}'`;
                })
                .join("\n");

        fs.writeFileSync(
            listFile,
            content
        );

        execFile(
            "ffmpeg",
            [
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                listFile,
                "-c:a",
                "libmp3lame",
                "-y",
                outputFile
            ],
            function (error, stdout, stderr) {
                if (fs.existsSync(listFile)) {
                    fs.unlinkSync(listFile);
                }

                if (error) {
                    console.log(
                        "FFmpeg Error:"
                    );

                    console.log(
                        stderr
                    );

                    reject(error);
                    return;
                }

                resolve();
            }
        );
    });
}

async function generateElevenLabsAudio(
    text,
    voice
) {
    const audio =
        await client.textToSpeech.convert(
            voice,
            {
                text: text,
                modelId:
                    "eleven_multilingual_v2"
            }
        );

    const chunks = [];

    for await (const chunk of audio) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}

app.get("/api/health", function (req, res) {
    res.json({
        success: true,
        message: "Server is running"
    });
});

app.get("/api/test-route", function (req, res) {
    res.json({
        success: true,
        message:
            "TTS route system is working"
    });
});

app.get("/api/voices", async function (req, res) {
    try {
        const response =
            await fetch(
                "https://api.elevenlabs.io/v1/voices",
                {
                    headers: {
                        "xi-api-key":
                            process.env
                                .ELEVENLABS_API_KEY
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            return res.status(
                response.status
            ).json({
                success: false,
                message:
                    data.detail?.message ||
                    "Failed to load voices."
            });
        }

        res.json({
            success: true,
            voices: data.voices
        });
    } catch (error) {
        console.log(
            "Voice Error:"
        );

        console.log(
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                error.message
        });
    }
});

app.get("/api/history", async function (req, res) {
    try {
        const history =
            await SpeechHistory
                .find()
                .sort({
                    createdAt: -1
                });

        res.json({
            success: true,
            history: history
        });
    } catch (error) {
        console.log(
            "History Error:"
        );

        console.log(
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to load speech history."
        });
    }
});

app.post("/api/tts", ttsLimiter, async function (req, res) {
    try {
        const {
            text,
            language,
            voice
        } = req.body;

        console.log(
            "TTS request received"
        );

        console.log(
            "Text:",
            text
        );

        console.log(
            "Language:",
            language
        );

        console.log(
            "Voice:",
            voice
        );

        if (
            !text ||
            text.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please enter some text."
            });
        }

        if (text.length > 1500) {
            return res.status(400).json({
                success: false,
                message:
                    "Text cannot be more than 1500 characters."
            });
        }

        if (!voice) {
            return res.status(400).json({
                success: false,
                message:
                    "Please select a voice."
            });
        }

        if (!supportedLanguages.includes(language)) {
            return res.status(400).json({
                success: false,
                message:
                    "Unsupported language selected."
            });
        }

        const beepPath =
            path.join(
                audioFolder,
                "beep.mp3"
            );

        if (!fs.existsSync(beepPath)) {
            return res.status(500).json({
                success: false,
                message:
                    "beep.mp3 file not found."
            });
        }

        const parts =
            splitText(text);

        console.log(
            "Text parts:",
            parts
        );

        const inputFiles = [];

        for (
            let i = 0;
            i < parts.length;
            i++
        ) {
            const part =
                parts[i];

            if (
                part.type === "beep"
            ) {
                inputFiles.push(
                    beepPath
                );

                console.log(
                    "Electronic beep inserted"
                );

                continue;
            }

            if (
                part.type === "speech" &&
                part.text.trim() !== ""
            ) {
                const segmentBuffer =
                    await generateElevenLabsAudio(
                        part.text,
                        voice
                    );

                const segmentName =
                    `segment-${Date.now()}-${i}.mp3`;

                const segmentPath =
                    path.join(
                        audioFolder,
                        segmentName
                    );

                fs.writeFileSync(
                    segmentPath,
                    segmentBuffer
                );

                inputFiles.push(
                    segmentPath
                );

                console.log(
                    "Speech segment saved:",
                    segmentName
                );
            }
        }

        const finalFileName =
            `speech-${Date.now()}.mp3`;

        const finalAudioPath =
            path.join(
                audioFolder,
                finalFileName
            );

        await runFFmpeg(
            inputFiles,
            finalAudioPath
        );

        for (
            let i = 0;
            i < inputFiles.length;
            i++
        ) {
            const file =
                inputFiles[i];

            if (
                file !== beepPath &&
                fs.existsSync(file)
            ) {
                fs.unlinkSync(file);
            }
        }

        console.log(
            "Final audio created:",
            finalFileName
        );

        const audioUrl =
            `/audio/${finalFileName}`;

        const speech =
            new SpeechHistory({
                text: text,
                language:
                    language || "en-US",
                voice: voice,
                audioUrl: audioUrl
            });

        await speech.save();

        console.log(
            "History saved to MongoDB"
        );

        res.json({
            success: true,
            message:
                "Speech generated successfully",
            audioUrl: audioUrl
        });
    } catch (error) {
        console.log(
            "TTS Error:"
        );

        console.log(
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                error.message
        });
    }
});

mongoose.connect(
    process.env.MONGODB_URI
)
.then(function () {
    console.log(
        "MongoDB connected"
    );

    app.listen(
        process.env.PORT || 5000,
        function () {
            console.log(
                `Server running on http://127.0.0.1:${process.env.PORT || 5000}`
            );
        }
    );
})
.catch(function (error) {
    console.log(
        "MongoDB connection failed"
    );

    console.log(
        error.message
    );
});