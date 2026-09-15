const API_URL =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
        ? "http://127.0.0.1:5000"
        : "";

const textInput = document.getElementById("textInput");
const characterCount = document.getElementById("characterCount");
const wordCount = document.getElementById("wordCount");

const language = document.getElementById("language");
const voice = document.getElementById("voice");

const generateButton = document.getElementById("generateButton");
const audioPlayer = document.getElementById("audioPlayer");
const downloadButton = document.getElementById("downloadButton");

const historyList = document.getElementById("historyList");

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

        if (!response.ok) {
            throw new Error(
                "Voice API returned " + response.status
            );
        }

        const data = await response.json();

        console.log("Voices:", data);

        voice.innerHTML = "";

        if (!data.success || !Array.isArray(data.voices)) {

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


async function loadHistory() {

    try {

        const response = await fetch(
            API_URL + "/api/history"
        );

        if (!response.ok) {
            throw new Error(
                "History API returned " + response.status
            );
        }

        const data = await response.json();

        console.log("History:", data);

        historyList.innerHTML = "";

        if (
            !data.success ||
            !Array.isArray(data.history) ||
            data.history.length === 0
        ) {

            historyList.textContent =
                "No speech history yet.";

            return;
        }

        data.history.forEach(function (item) {

            const historyCard =
                document.createElement("div");

            historyCard.className =
                "history-card";

            const text =
                document.createElement("p");

            text.textContent =
                item.text;

            const languageText =
                document.createElement("span");

            languageText.textContent =
                item.language;

            const date =
                document.createElement("small");

            date.textContent =
                new Date(item.createdAt)
                    .toLocaleString();

            const audio =
                document.createElement("audio");

            audio.controls = true;

            audio.src =
                API_URL + item.audioUrl;

            historyCard.appendChild(text);
            historyCard.appendChild(languageText);
            historyCard.appendChild(date);
            historyCard.appendChild(audio);

            historyList.appendChild(historyCard);
        });

    } catch (error) {

        console.log("History error:", error);

        historyList.textContent =
            "Failed to load speech history.";
    }

}


async function wait(ms) {

    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });

}


async function wakeServer() {

    console.log("Checking server...");

    try {

        const response = await fetch(
            API_URL + "/api/health",
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Health check failed: " + response.status
            );
        }

        const data = await response.json();

        console.log(
            "Server is awake:",
            data
        );

        return true;

    } catch (error) {

        console.log(
            "Server wake-up check:",
            error.message
        );

        return false;
    }

}


async function generateTTSRequest(text) {

    const maxAttempts = 3;

    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {

        try {

            console.log(
                "TTS attempt:",
                attempt
            );

            const response =
                await fetch(
                    API_URL + "/api/tts",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            text: text,
                            language:
                                language.value,
                            voice:
                                voice.value
                        })
                    }
                );

            console.log(
                "TTS response status:",
                response.status
            );

            const data =
                await response.json();

            console.log(
                "TTS response:",
                data
            );

            if (
                response.ok &&
                data.success
            ) {

                return data;
            }

            if (attempt === maxAttempts) {

                return {
                    success: false
                };
            }

        } catch (error) {

            console.log(
                "TTS attempt failed:",
                attempt,
                error
            );

            if (attempt === maxAttempts) {

                return {
                    success: false
                };
            }

        }

        console.log(
            "Waiting before retry..."
        );

        await wait(5000);
    }

}


async function generateSpeech(event) {

    event.preventDefault();

    console.log(
        "GENERATE CLICKED"
    );

    const text =
        textInput.value.trim();

    console.log(
        "Selected voice:",
        voice.value
    );


    if (text === "") {

        alert(
            "Please enter some text."
        );

        return;
    }


    if (text.length > maxCharacters) {

        alert(
            "Text cannot be more than 1500 characters."
        );

        return;
    }


    if (voice.value === "") {

        alert(
            "Please select a voice."
        );

        return;
    }


    generateButton.disabled =
        true;

    generateButton.textContent =
        "Connecting...";


    try {

        await wakeServer();

        generateButton.textContent =
            "Generating...";


        const data =
            await generateTTSRequest(text);


        if (!data || !data.success) {

            console.log(
                "Speech generation failed."
            );

            return;
        }


        const audioUrl =
            API_URL + data.audioUrl;


        audioPlayer.src =
            audioUrl;

        audioPlayer.load();


        downloadButton.disabled =
            false;


        downloadButton.onclick =
            function () {

                const link =
                    document.createElement("a");

                link.href =
                    audioUrl;

                link.download =
                    "speech.mp3";

                document.body.appendChild(
                    link
                );

                link.click();

                document.body.removeChild(
                    link
                );
            };


        try {

            await audioPlayer.play();

        } catch (error) {

            console.log(
                "Autoplay blocked:",
                error.message
            );
        }


        await loadHistory();


    } catch (error) {

        console.log(
            "TTS error:",
            error
        );

    } finally {

        generateButton.disabled =
            false;

        generateButton.textContent =
            "Generate Speech";
    }

}


generateButton.addEventListener(
    "click",
    generateSpeech
);


loadVoices();
loadHistory();