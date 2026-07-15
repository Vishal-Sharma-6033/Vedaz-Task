# Real-Time Chat Application

A full-stack real-time chat application built with React (Vite) on the frontend and Node.js + Express + Socket.io on the backend, with MongoDB for message persistence.

## Features

### Core
- **Real-time messaging** via Socket.io — messages appear instantly for all connected users
- **Chat history** persisted in MongoDB — messages survive page refreshes
- **Message timestamps** displayed on every message
- **REST APIs** for sending and fetching messages

### Bonus
- **Username & password authentication** — Register and login with JWT-based auth
- **Typing indicator** — shows when other users are typing
- **Online/offline user status** — sidebar shows all connected users with live updates
- **Message read/delivered status** — connection status in header
- **Logout** — sign out and switch accounts

## Tech Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Frontend | React 18, Vite, Socket.io Client              |
| Backend  | Node.js, Express, Socket.io, JWT, bcryptjs    |
| Database | MongoDB (Mongoose ODM)                        |

## Project Structure

```
chat-app/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── ChatScreen.jsx
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── OnlineSidebar.jsx
│   │   │   └── TypingIndicator.jsx
│   │   ├── context/
│   │   │   └── ChatContext.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── models/
│   │   │   ├── Message.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── messages.js
│   │   ├── socket/
│   │   │   └── handler.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   └── index.js
│   ├── .env
│   ├── .env.example
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** running locally or a MongoDB Atlas connection string
- **npm** or **yarn**

### 1. Clone the repository

```bash
git clone <repo-url>
cd chat-app
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file (or copy from `.env.example`):

```bash
cp .env.example .env
```

Update the environment variables as needed, then start the server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The backend will run on `http://localhost:5000`.

### 3. Frontend Setup

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.

### 4. Open the app

Navigate to `http://localhost:5173` in your browser. Register a new account (username + password), then sign in to start chatting. Open multiple tabs with different accounts to test real-time messaging between users.

## Environment Variables

### Server (`server/.env`)

| Variable      | Default                              | Description                |
| ------------- | ------------------------------------ | -------------------------- |
| `PORT`        | `5000`                               | Server port                |
| `MONGODB_URI` | `mongodb://localhost:27017/chatapp`   | MongoDB connection string  |
| `CORS_ORIGIN` | `http://localhost:5173`              | Allowed CORS origin        |
| `JWT_SECRET`  | `chat-app-secret-key-...`            | Secret for signing JWTs    |

## API Endpoints

### Auth (Public)

| Method | Endpoint            | Description      | Body                                          |
| ------ | ------------------- | ---------------- | --------------------------------------------- |
| POST   | `/api/auth/register`| Register account | `{ "username": "...", "password": "..." }`    |
| POST   | `/api/auth/login`   | Login            | `{ "username": "...", "password": "..." }`    |

### Messages (Protected — requires `Authorization: Bearer <token>`)

| Method | Endpoint         | Description          | Body                                |
| ------ | ---------------- | -------------------- | ----------------------------------- |
| GET    | `/api/messages`  | Fetch chat history   | Query: `?limit=50&before=<ISODate>` |
| POST   | `/api/messages`  | Send a message       | `{ "text": "..." }`                |
| GET    | `/health`        | Health check         | —                                   |

## Socket.io Events

| Event              | Direction       | Payload                  | Description                  |
| ------------------ | --------------- | ------------------------ | ---------------------------- |
| `user:join`        | Client → Server | `username` (string)      | User joins the chat          |
| `message:send`     | Client → Server | `{ username, text }`     | Send a new message           |
| `message:new`      | Server → Client | `message` (object)       | Broadcast new message        |
| `typing:start`     | Client → Server | `username` (string)      | User started typing          |
| `typing:stop`      | Client → Server | `username` (string)      | User stopped typing          |
| `typing:show`      | Server → Client | `username` (string)      | Show typing indicator        |
| `typing:hide`      | Server → Client | `username` (string)      | Hide typing indicator        |
| `users:online`     | Server → Client | `string[]` (usernames)   | Updated list of online users |
| `message:error`    | Server → Client | `error` (string)         | Message send failed          |

## Design Decisions

1. **MongoDB for persistence** — Chosen for its flexible schema and seamless integration with Mongoose. Messages include automatic `createdAt`/`updatedAt` timestamps.

2. **JWT authentication** — Stateless auth using JSON Web Tokens. Passwords are hashed with bcryptjs. The JWT is sent via `Authorization` header for REST APIs and via Socket.io `auth` for WebSocket connections.

3. **Vite for frontend** — Faster dev server and build times compared to Create React App, with built-in proxy support for Socket.io during development.

3. **Context + custom hook pattern** — `ChatContext` provides socket state globally; `useSocket` encapsulates all socket logic (connection, events, cleanup) in one reusable hook.

4. **Server-side message storage** — Messages are saved to MongoDB via the Socket.io handler, ensuring real-time delivery and persistence in a single operation.

5. **Typing indicator with debounce** — A 2-second timeout stops the typing event after the user pauses, preventing unnecessary broadcasts.

6. **Responsive sidebar** — The online users sidebar overlays on mobile and slides in on desktop, adapting to different screen sizes.

## Assumptions

- **Username/password auth** — Users register with a username and password. JWTs expire after 7 days. No email verification or password reset flow.
- **Single chat room** — All users share one global chat room (no private messaging or channels).
- **MongoDB is available locally** — The default connection string assumes MongoDB is running on `localhost:27017`. For cloud deployment, update `MONGODB_URI`.
- **No message editing/deletion** — Messages are append-only for simplicity.
- **No file/image uploads** — Only text messages are supported.

## Running in Production

```bash
# Build the client
cd client
npm run build

# Serve static files from the server (optional)
# Update server to serve client/dist
```

For deployment to Render, Railway, or similar platforms:
1. Set the `MONGODB_URI` to your cloud MongoDB instance (e.g., MongoDB Atlas)
2. Set `CORS_ORIGIN` to your frontend's deployed URL
3. Deploy the server; build and deploy the client separately or serve from the server
