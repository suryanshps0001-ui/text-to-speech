
const API_URL = "http://127.0.0.1:5000";

const textInput = document.getElementById("textInput");
const characterCount = document.getElementById("characterCount");
const wordCount = document.getElementById("wordCount");

const language = document.getElementById("language");
const voice = document.getElementById("voice");

const generateButton = document.getElementById("generateButton");
const audioPlayer = document.getElementById("audioPlayer");
const downloadButton = document.getElementById("downloadButton");

const maxCharacters = 1500;


textInput.addEventListener("input", function () {

    if (textInput.value.length > maxCharacters) {
        textInput.value =
            textInput.value.substring(0, maxCharacters);
    }

    const text = textInput.value;

    characterCount.textContent = text.length;

    if (text.trim() === "") {
        wordCount.textContent = 0;
    } else {
        wordCount.textContent =
            text.trim().split(/\s+/).length;
    }
});


async function loadVoices() {

    try {

        const response = await fetch(
            API_URL + "/api/voices"
        );

        const data = await response.json();

        console.log("Voices:", data);

        voice.innerHTML = "";

        if (!data.success) {

            const option =
                document.createElement("option");

            option.value = "";
            option.textContent = "No voices found";

            voice.appendChild(option);

            return;
        }

        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent = "Select Voice";

        voice.appendChild(defaultOption);

        data.voices.forEach(function (item) {

            const option =
                document.createElement("option");

            option.value = item.voice_id;
            option.textContent = item.name;

            voice.appendChild(option);
        });

    } catch (error) {

        console.log("Voice error:", error);

        voice.innerHTML =
            '<option value="">Failed to load voices</option>';
    }
}


async function generateSpeech(event) {

    event.preventDefault();

    console.log("GENERATE CLICKED");

    const text = textInput.value.trim();

    console.log("Selected voice:", voice.value);

    if (text === "") {

        alert("Please enter some text.");

        return;
    }

    if (text.length > maxCharacters) {

        alert("Text cannot be more than 1500 characters.");

        return;
    }

    if (voice.value === "") {

        alert("Please select a voice.");

        return;
    }

    generateButton.disabled = true;
    generateButton.textContent = "Generating...";

    try {

        console.log("Sending TTS request...");

        const response = await fetch(
            API_URL + "/api/tts",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    text: text,
                    language: language.value,
                    voice: voice.value
                })
            }
        );

        console.log(
            "TTS response status:",
            response.status
        );

        const data = await response.json();

        console.log("TTS:", data);

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Speech generation failed."
            );

            return;
        }

        const audioUrl =
            API_URL + data.audioUrl;

        audioPlayer.src = audioUrl;

        audioPlayer.load();

        downloadButton.disabled = false;

        downloadButton.onclick = function () {

            const link =
                document.createElement("a");

            link.href = audioUrl;

            link.download = "speech.mp3";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);
        };

        try {

            await audioPlayer.play();

        } catch (error) {

            console.log(
                "Autoplay blocked:",
                error.message
            );
        }

    } catch (error) {

        console.log("TTS error:", error);

        alert(
            "Failed to connect to server. Make sure the server is running."
        );

    } finally {

        generateButton.disabled = false;
        generateButton.textContent = "Generate Speech";
    }
}


generateButton.addEventListener(
    "click",
    generateSpeech
);


loadVoices();

