require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY
});

async function testTTS() {
    try {
        const audio = await client.textToSpeech.convert(
            "JBFqnCBsd6RMkjVDRZzb",
            {
                text: "Hello, this is my text to speech project.",
                modelId: "eleven_multilingual_v2"
            }
        );

        const audioFolder = path.join(__dirname, "audio");

        if (!fs.existsSync(audioFolder)) {
            fs.mkdirSync(audioFolder);
        }

        const audioPath = path.join(audioFolder, "test.mp3");

        const chunks = [];

        for await (const chunk of audio) {
            chunks.push(chunk);
        }

        const buffer = Buffer.concat(chunks);

        fs.writeFileSync(audioPath, buffer);

        console.log("Audio generated successfully");
        console.log("Saved at:", audioPath);

    } catch (error) {
        console.log("TTS API failed");
        console.log(error.message);
    }
}

testTTS();