````markdown
# QuickPoll - Real-Time Opinion Polling Platform

A full-stack application for creating and participating in real-time polls with live updates via WebSockets.

## 🚀 Features

- **Create Polls**: Create polls with 2-10 options
- **Vote**: Cast votes with real-time result updates
- **Like**: Like polls to show appreciation
- **Real-time Updates**: WebSocket integration for live data
- **Responsive Design**: Mobile-friendly interface
- **User Tracking**: Session-based user identification

## 🏗️ Architecture

### Backend (FastAPI)
- RESTful API with FastAPI
- SQLAlchemy ORM with SQLite database
- WebSocket support for real-time updates
- Pydantic models for data validation
- CORS enabled for frontend integration

### Frontend (Next.js)
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui component library
- WebSocket client for real-time updates
- Axios for API requests

## 📋 Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn
- Git

## 🛠️ Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd quickpoll
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at: http://localhost:8000
API Docs: http://localhost:8000/docs

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Run frontend
npm run dev
```

Frontend will run at: http://localhost:3000

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Manual Testing

1. Create a poll from the home page
2. Vote on the poll
3. Open another browser/incognito window
4. Vote on the same poll
5. Observe real-time updates in both windows

## 📦 Deployment

### Backend Deployment

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend
cd backend

# Initialize and deploy
railway init
railway up
```

#### Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Create new **Web Service**
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `DATABASE_URL`: `sqlite:///./quickpoll.db`
   - `CORS_ORIGINS`: Your frontend URL
6. Deploy

### Frontend Deployment

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Or connect GitHub repository to Vercel dashboard
```

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import GitHub repository
3. Set **Root Directory**: `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
   - `NEXT_PUBLIC_WS_URL`: Your WebSocket URL
5. Deploy

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to frontend
cd frontend

# Build
npm run build

# Deploy
netlify deploy --prod
```

## 🔌 API Endpoints

### Polls
- `POST /polls/` - Create a new poll
- `GET /polls/` - Get all polls
- `GET /polls/{id}` - Get poll by ID
- `DELETE /polls/{id}` - Delete poll

### Votes
- `POST /polls/{id}/votes` - Cast a vote
- `GET /polls/{id}/votes/{user_id}` - Get user's vote

### Likes
- `POST /polls/{id}/likes` - Toggle like
- `GET /polls/{id}/likes/{user_id}` - Check if user liked

### WebSocket
- `WS /ws` - Real-time updates connection

## 📊 Database Schema
````
polls
├── id (PK)
├── title
├── description
├── created_at
├── created_by
└── like_count

options
├── id (PK)
├── poll_id (FK)
├── text
└── vote_count

votes
├── id (PK)
├── poll_id (FK)
├── option_id (FK)
├── user_id
└── created_at

likes
├── id (PK)
├── poll_id (FK)
├── user_id
└── created_at
