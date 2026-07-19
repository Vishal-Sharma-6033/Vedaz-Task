# Real-Time Chat Application

A full-stack real-time chat application built with React (Vite) on the frontend and Node.js + Express + Socket.io on the backend, with MongoDB for message persistence.


Live Preview Link- https://vedaz-task.vercel.app/

## Features

### Core
- **Real-time messaging** via Socket.io — messages appear instantly for all connected users
- **Chat history** persisted in MongoDB — messages survive page refreshes
- **Message timestamps** displayed on every message
- **REST APIs** for sending and fetching messages

### Authentication
- **Register** — create an account with a username (min 2 chars) and password (min 6 chars)
- **Login** — sign in with username and password
- **JWT-based auth** — stateless tokens (7-day expiry) protect all message APIs and Socket.io connections
- **Password hashing** — passwords stored securely with bcryptjs (10 salt rounds)
- **Session persistence** — JWT saved in `localStorage`; user stays logged in across page refreshes
- **Logout** — sign out clears token and returns to login screen
- **Duplicate prevention** — registration rejects taken usernames

### Bonus
- **Typing indicator** — shows when other users are typing
- **Online/offline user status** — sidebar shows all connected users with live updates
- **Connection status** — header shows whether Socket.io is connected

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

Navigate to `http://localhost:5173` in your browser. You'll see the login screen with two tabs:

1. **Register** — enter a username (2–20 chars) and password (min 6 chars) to create a new account
2. **Login** — sign in with your existing credentials

After signing in, you'll enter the chat room. Open multiple browser tabs or use different accounts to test real-time messaging between users. Use the logout button (top-right) to sign out and switch accounts.

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

| Method | Endpoint             | Description      | Body                                          |
| ------ | -------------------- | ---------------- | --------------------------------------------- |
| POST   | `/api/auth/register` | Register account | `{ "username": "...", "password": "..." }`    |
| POST   | `/api/auth/login`    | Login            | `{ "username": "...", "password": "..." }`    |

**Register / Login Response (200 / 201):**
```json
{
  "user": { "_id": "...", "username": "vishal", "createdAt": "..." },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
| Status | Scenario |
| ------ | -------- |
| `400`  | Missing username or password |
| `400`  | Username too short (< 2 chars) or password too short (< 6 chars) |
| `401`  | Invalid credentials (login) |
| `409`  | Username already taken (register) |

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

4. **Context + custom hook pattern** — `ChatContext` provides socket state globally; `useSocket` encapsulates all socket logic (connection, events, cleanup) in one reusable hook.

5. **Server-side message storage** — Messages are saved to MongoDB via the Socket.io handler, ensuring real-time delivery and persistence in a single operation.

6. **Typing indicator with debounce** — A 2-second timeout stops the typing event after the user pauses, preventing unnecessary broadcasts.

7. **Responsive sidebar** — The online users sidebar overlays on mobile and slides in on desktop, adapting to different screen sizes.

## Assumptions

- **Username/password auth** — Users register with a unique username and password. Passwords are hashed with bcryptjs (10 rounds). JWTs expire after 7 days. No email verification, password reset, or OAuth flow.
- **Token storage** — JWT is stored in `localStorage` and sent via `Authorization` header (REST) and `auth.token` (Socket.io). This is acceptable for this project but `httpOnly` cookies are recommended for production.
- **Single chat room** — All users share one global chat room (no private messaging or channels).
- **MongoDB is available locally** — The default connection string assumes MongoDB is running on `localhost:27017`. For cloud deployment, update `MONGODB_URI`.
- **No message editing/deletion** — Messages are append-only for simplicity.
- **No file/image uploads** — Only text messages are supported.

## Deployment

### Backend on Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo and select the `server/` directory
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Node Version:** 18+
5. Add environment variables in Render dashboard:
   ```
   MONGODB_URI=mongodb+srv://<your-atlas-uri>
   JWT_SECRET=<your-secret>
   CORS_ORIGIN=https://your-app.vercel.app
   NODE_ENV=production
   ```
6. Deploy — Render will give you a URL like `https://chat-app-server.onrender.com`

> **Note:** Render's free tier spins down after inactivity. The first request after idle may take 30–50 seconds.

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo, set **Root Directory** to `client/`
3. Add environment variable:
   ```
   VITE_API_URL=https://chat-app-server.onrender.com
   ```
4. Deploy — Vercel gives you a URL like `https://chat-app.vercel.app`

### Post-Deployment

After both are live, update the backend's `CORS_ORIGIN` on Render to include your Vercel URL:
```
CORS_ORIGIN=https://your-app.vercel.app
```

### Environment Variables Summary

| Service  | Variable      | Where to set     | Example                                        |
| -------- | ------------- | ---------------- | ---------------------------------------------- |
| Backend  | `MONGODB_URI` | Render dashboard | `mongodb+srv://...`                            |
| Backend  | `JWT_SECRET`  | Render dashboard | `my-secret-key`                                |
| Backend  | `CORS_ORIGIN` | Render dashboard | `https://your-app.vercel.app`                  |
| Frontend | `VITE_API_URL`| Vercel dashboard | `https://chat-app-server.onrender.com`         |
