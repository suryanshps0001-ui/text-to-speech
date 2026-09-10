 # Text-to-Speech Application

A web-based Text-to-Speech application that converts written text into speech.

Users can enter text, select a language and voice, generate speech, play the audio, download the generated MP3 file, and view speech history.

## Features

* Text-to-Speech conversion
* English and Hindi language support
* Voice selection
* Character count
* Word count
* 1500 character limit
* Audio player
* MP3 download
* Speech history
* MongoDB database
* Abusive word detection
* Electronic censor beep
* Backend validation
* Rate limiting
* Error handling
* Responsive dark-themed interface

## Technologies Used

Frontend:

* HTML
* CSS
* JavaScript

Backend:

* Node.js
* Express.js

Services:

* ElevenLabs Text-to-Speech API
* MongoDB Atlas

Other:

* FFmpeg
* Git
* GitHub

## How It Works

1. User enters text.
2. User selects a language.
3. User selects a voice.
4. Frontend sends the request to the backend.
5. Backend validates the request.
6. Backend checks for abusive words.
7. ElevenLabs generates the speech.
8. FFmpeg processes the audio.
9. The final audio is returned to the frontend.
10. User can play or download the audio.
11. Speech information is stored in MongoDB.

## API Endpoints

GET /api/health

Checks whether the backend server is running.

GET /api/voices

Returns available voices.

GET /api/history

Returns speech history.

POST /api/tts

Generates speech from the submitted text.

## Security

* API keys are stored in environment variables.
* API keys are not exposed in frontend JavaScript.
* The .env file is excluded from GitHub.
* The node_modules folder is excluded from GitHub.
* Backend validation is used for incoming requests.
* Rate limiting is applied to the Text-to-Speech endpoint.

## Environment Variables

Create a .env file inside the server folder.

Use your own credentials:

ELEVENLABS_API_KEY=your_api_key
MONGODB_URI=your_mongodb_connection_string
PORT=5000

Never upload real API keys or database credentials to GitHub.

## Installation

Clone the repository.

Open the project folder in VS Code.

Open the terminal and run:

cd server

npm install

Create the .env file inside the server folder and add your credentials.

Start the server:

node server.js

Open the application:

http://127.0.0.1:5000/

## Testing

The application has been tested for:

* Text-to-Speech generation
* English speech
* Hindi speech
* Voice selection
* Audio playback
* MP3 download
* Character count
* Word count
* Empty text validation
* Voice validation
* Abusive word censor beep
* Speech history
* MongoDB connection
* Backend API routes
* Rate limiting

## Future Improvements

* More language support
* More voice controls
* Speech speed control
* Pitch control
* Favorites
* Cloud deployment
* Improved speech history management

## Author

Suryansh Singh

BCA Student
