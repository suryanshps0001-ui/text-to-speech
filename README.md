# Text to Speech

This is a Text to Speech web application made during my web development internship.

The main purpose of this project is to convert written text into speech. The user can enter text, select a language and voice, and generate an audio file.

## Features

* Convert text into speech
* English and Hindi language support
* Select different voices
* Generate audio
* Play generated audio
* Download audio
* Character count
* Word count
* Maximum 1500 characters
* Empty text validation
* Voice validation
* Abusive word censor with beep sound
* Speech history using MongoDB
* Basic API rate limiting

## Technologies Used

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### API

* ElevenLabs Text to Speech API

### Other

* FFmpeg
* Git
* GitHub

## How It Works

The user enters some text and selects a language and voice.

The frontend sends the text and voice information to the backend.

The backend validates the request and sends the required text to ElevenLabs.

After getting the audio, the backend sends it back to the frontend.

If an abusive word is found, the word is replaced with an electronic beep sound.

The generated speech information is also stored in MongoDB.

## Project Structure

```text
text-to-speech/
│
├── client/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server/
│   ├── models/
│   │   └── SpeechHistory.js
│   ├── audio/
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── .gitignore
└── README.md
```

## API Endpoints

| Method | Endpoint          | Work                 |
| ------ | ----------------- | -------------------- |
| GET    | `/api/health`     | Check server         |
| GET    | `/api/voices`     | Get available voices |
| POST   | `/api/tts`        | Generate speech      |
| GET    | `/api/history`    | Get speech history   |
| GET    | `/api/test-route` | Test TTS route       |

## Environment Variables

The backend uses environment variables for the API key and MongoDB connection.

Example:

```env
ELEVENLABS_API_KEY=your_api_key
MONGODB_URI=your_mongodb_connection_string
```

The `.env` file is not uploaded to GitHub.

`node_modules` is also ignored using `.gitignore`.

## Running the Project

First, open the server folder:

```bash
cd server
```

Install the packages:

```bash
npm install
```

Create the `.env` file and add the required values.

Then start the server:

```bash
node server.js
```

The server will run on:

```text
http://127.0.0.1:5000
```

Open this address in the browser to use the application.

## Testing

I tested the project for:

* English speech
* Hindi speech
* Voice selection
* Audio generation
* Audio playback
* Audio download
* Empty text
* Character limit
* Abusive word censor
* MongoDB speech history
* Backend APIs

## Censor Feature

One feature I added separately is an abusive word censor.

For example, if an abusive word is present in the text, it is not sent directly for speech. The backend separates the text and adds an electronic beep in place of the abusive word.

FFmpeg is used to combine the speech parts and beep sound.

## Database

MongoDB is used to store speech history.

The stored information includes:

* Text
* Language
* Voice
* Audio URL
* Created date

## Security

The ElevenLabs API key is kept in the backend `.env` file.

It is not written inside the frontend JavaScript.

The backend also checks the input and has rate limiting on the TTS endpoint.

## Future Improvements

Some things I can add later:

* More languages
* More voice options
* Speech speed control
* User login
* Better speech history UI
* Deployment
* More audio controls

## Author

**Suryansh Singh**

BCA Student
Web Development Intern

GitHub: `suryanshps0001-ui`

## Project Status

The main features of the project are completed and working.
