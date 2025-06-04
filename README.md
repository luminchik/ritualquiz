# Seismic Quiz Game

An interactive quiz game with Discord authentication built with Node.js and Express. Players can log in using their Discord account, answer quiz questions and track high scores on a leaderboard stored in SQLite.

## Requirements

- Node.js (tested with version 18+)
- npm

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root (or otherwise set these variables in your environment) with the following values:

- `DISCORD_CLIENT_ID` – Discord application client ID.
- `DISCORD_CLIENT_SECRET` – Discord application client secret.
- `CALLBACK_URL` – OAuth callback URL registered with Discord (defaults to `http://localhost:3000/auth/discord/callback`).
- `SESSION_SECRET` – secret string used to sign session cookies.
- `PORT` – port for the HTTP server (optional, defaults to 3000).

## Usage

Start the application in production mode:

```bash
npm start
```

During development you can use nodemon to restart the server automatically:

```bash
npm run dev
```

The server will be available at `http://localhost:3000` by default.
