---

# 🚀 QuickPoll — Real-Time Opinion Polling Platform

A **full-stack real-time polling platform** built using **FastAPI**, **Next.js**, and **WebSockets**.
It enables users to create polls, vote, like polls, and view live results as other participants interact — all updated in real time.

---

## 🌟 Core Features

* 🗳 **Create Polls** — Polls with 2–10 options
* ⚡ **Real-Time Voting** — Instant updates via WebSockets
* ❤️ **Like Polls** — Track and broadcast like counts live
* 🔁 **Live Synchronization** — Bidirectional real-time data flow
* 📱 **Responsive UI** — Fully adaptive with Tailwind CSS
* 👤 **Session-Based Identification** — Lightweight user recognition without login

---

## 🧱 Architecture Overview

### 🧩 Tech Stack

| Layer                | Technology                           | Purpose                            |
| -------------------- | ------------------------------------ | ---------------------------------- |
| **Frontend**         | Next.js 14 (React + TypeScript)      | Interactive UI                     |
|                      | Tailwind CSS                         | Styling and responsiveness         |
|                      | WebSocket API                        | Real-time data sync                |
| **Backend**          | FastAPI                              | REST + WebSocket API               |
|                      | SQLAlchemy                           | ORM for DB operations              |
|                      | SQLite → PostgreSQL (prod)           | Persistent data store              |
|                      | Pydantic                             | Data validation                    |
| **Infra/Deployment** | Vercel (Frontend), Railway (Backend) | Serverless deployment              |
|                      | Docker-Ready                         | For containerized production setup |

---

### 🧠 System Design

```text
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Client A   │◄───────►│   FastAPI    │◄───────►│  Client B   │
│  (Browser)  │  HTTP   │ + WebSocket  │  HTTP   │  (Browser)  │
└─────────────┘         └──────────────┘         └─────────────┘
      ▲                        │                         ▲
      │                   ┌────┴────┐                    │
      │                   │ SQLite  │                    │
      │                   │  / PG   │                    │
      │                   └─────────┘                    │
      │                                                  │
      └──────────── Real-Time Broadcast ────────────────┘
```

### 🔄 Data Flow

1. Client creates/votes/likes a poll → sends HTTP request
2. FastAPI updates DB
3. FastAPI broadcasts WebSocket event → all connected clients
4. Clients receive payload, update state, re-render UI

---

## 📁 Folder Structure

```
quickpoll/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entrypoint
│   │   ├── models.py            # ORM models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── crud.py              # CRUD utilities
│   │   ├── database.py          # DB connection setup
│   │   └── websocket_manager.py # WebSocket broadcaster
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Main UI
│   │   │   └── layout.tsx       # Root layout
│   │   ├── components/
│   │   │   ├── CreatePollForm.tsx
│   │   │   ├── PollCard.tsx
│   │   │   └── PollList.tsx
│   │   ├── lib/
│   │   │   ├── api.ts           # HTTP client
│   │   │   ├── websocket.ts     # WebSocket client
│   │   │   └── utils.ts         # Helpers
│   │   └── hooks/
│   │       └── useRealtimePolls.ts
│   ├── package.json
│   └── .env.local
└── README.md
```

---

## ⚙️ Setup & Installation

### 🧩 Prerequisites

* **Python** ≥ 3.9
* **Node.js** ≥ 18
* **npm** or **yarn**

---

### 🖥 Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)
pip install -r requirements.txt

# Environment variables
cat > .env << EOF
DATABASE_URL=sqlite:///./quickpoll.db
CORS_ORIGINS=http://localhost:3000
EOF

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Endpoints**

* REST: [http://localhost:8000](http://localhost:8000)
* Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
* WS: ws://localhost:8000/ws

---

### 💻 Frontend Setup

```bash
cd frontend
npm install

cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
EOF

npm run dev
```

Access UI at **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Real-Time Demo Test

1. Open `http://localhost:3000` in two browsers
2. Create poll in Window A → instantly visible in Window B
3. Vote or Like in either window → synchronized live

---

## 🔌 API Overview

| Endpoint            | Method | Description                 |
| ------------------- | ------ | --------------------------- |
| `/polls/`           | `POST` | Create poll                 |
| `/polls/`           | `GET`  | Fetch all polls             |
| `/polls/{id}`       | `GET`  | Get poll details            |
| `/polls/{id}/votes` | `POST` | Cast vote                   |
| `/polls/{id}/likes` | `POST` | Toggle like                 |
| `/ws`               | `WS`   | Real-time WebSocket updates |

---

## 🗄 Database Schema

```sql
polls (id, title, description, created_at, created_by, like_count)
options (id, poll_id, text, vote_count)
votes (id, poll_id, option_id, user_id, created_at)
likes (id, poll_id, user_id, created_at)
```

---

## 🔍 Implementation Highlights

### Real-Time Broadcasting

**Backend**

```python
await manager.broadcast({
    "type": "vote_update",
    "data": poll.dict()
})
```

**Frontend**

```ts
wsManager.on('vote_update', data => updatePollInState(data));
```

### Stateless User Identity

```ts
const id = generateUserId(); // e.g., "user_4f2a1d"
localStorage.setItem('quickpoll_user', id);
```

### Auto-Reconnect Logic

```ts
private attemptReconnect() {
  setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
}
```

---

## 🧰 Troubleshooting

| Issue                        | Possible Fix                                         |                |
| ---------------------------- | ---------------------------------------------------- | -------------- |
| **WebSocket not connecting** | Check `NEXT_PUBLIC_WS_URL` and backend port          |                |
| **No real-time update**      | Verify backend logs show `Broadcasting to X clients` |                |
| **DB locked (SQLite)**       | Use PostgreSQL in production                         |                |
| **Port already in use**      | Kill process via `lsof -ti:PORT                      | xargs kill -9` |

---

## ☁️ Deployment Guide

### Backend (Railway / Render / Docker)

```bash
cd backend
railway up
# or docker build -t quickpoll-backend . && docker run -p 8000:8000 quickpoll-backend
```

Set environment variables:

```
DATABASE_URL=postgresql://user:pass@host/db
CORS_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (Vercel)

```
vercel
```

Set:

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app/ws
```

---

## 🧩 Future Improvements

| Area              | Enhancement                                      |
| ----------------- | ------------------------------------------------ |
| 🧠 Authentication | Add JWT/OAuth for user management                |
| 🗄 Database       | Migrate to PostgreSQL + Alembic migrations       |
| 🚀 Performance    | Introduce Redis caching                          |
| 🧱 Scalability    | Use Pub/Sub for distributed WebSocket broadcasts |
| 🔐 Security       | Add rate limiting + input sanitization           |
| 📊 Observability  | Integrate Sentry / Prometheus metrics            |
| 🔄 CI/CD          | GitHub Actions for lint, test, deploy            |

---

## 🧭 Technical Architecture Summary

* **Frontend → Backend:** REST for CRUD, WebSocket for sync
* **Backend → DB:** SQLAlchemy ORM + async I/O
* **Broadcast Mechanism:** In-memory WebSocket manager
* **State Sync:** Client-side hook `useRealtimePolls` ensures reactive state
* **Data Flow:** Event-driven; backend is stateless between connections

---

## 🧾 License

MIT License — Free to use and modify.

---

## 🤝 Contributing

Contributions, ideas, and optimizations are welcome via Pull Requests.
For bug reports, open an issue.

---

**Built with ❤️ using FastAPI, Next.js, and WebSockets.**
*Designed for scalable, real-time, event-driven applications.*

---
