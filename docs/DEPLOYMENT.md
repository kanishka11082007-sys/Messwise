# MessWise Production Deployment Guide

This guide provides end-to-end instructions for deploying the **MessWise** platform across local containers, VPS/VM cloud instances, and zero-devops PaaS providers (Render, Railway, Vercel).

---

## 1. Quick Local & VPS Deployment (Docker Compose)

The easiest way to run MessWise in production or staging is using Docker Compose.

### Prerequisites
* Docker 24.0+ & Docker Compose v2.0+

### Steps
1. Clone the repository and navigate to the project root:
   ```bash
   git clone https://github.com/kanishka11082007-sys/Messwise.git
   cd Messwise
   ```

2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```

3. Build and launch all containers:
   ```bash
   docker compose up -d --build
   ```

4. Verify services:
   * **Frontend Portal**: `http://localhost` (Port `80` & `5173`)
   * **FastAPI Backend & Interactive API Docs**: `http://localhost:8000/api/v1/docs`
   * **Health Check**: `http://localhost:8000/api/v1/health`

---

## 2. 1-Click Cloud Deployment (Render Blueprint)

MessWise includes an infrastructure-as-code `render.yaml` blueprint.

1. Create an account at [render.com](https://render.com).
2. Connect your GitHub repository `kanishka11082007-sys/Messwise`.
3. Click **New +** → **Blueprint** → Select `Messwise`.
4. Render will automatically provision:
   * **`messwise-api`**: Python web service with FastAPI, Uvicorn, and database auto-seeding.
   * **`messwise-portal`**: Static site hosting the React frontend with SPA routing rewrites.

---

## 3. Split Deployment (Vercel Frontend + Render/Railway Backend)

### Backend (Render or Railway)
* **Root Directory**: `backend`
* **Build Command**: `pip install -r requirements.txt`
* **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
* **Environment Variables**:
  * `ENVIRONMENT=production`
  * `SECRET_KEY=<your-secret-key>`
  * `AUTO_SEED_DATA=true`
  * `BACKEND_CORS_ORIGINS=["*"]`

### Frontend (Vercel)
* **Root Directory**: `frontend`
* **Framework Preset**: `Vite`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Environment Variables**:
  * `VITE_API_URL=https://<YOUR_BACKEND_URL>/api/v1`

---

## 4. Production Security Checklist

* [x] **JWT Secret Key**: Ensure `SECRET_KEY` in `.env` is set to a secure 32+ character random string.
* [x] **CORS Configuration**: Restrict `BACKEND_CORS_ORIGINS` to the authorized frontend domain.
* [x] **Database Isolation**: By default, SQLite creates a persistent volume. For high-concurrency enterprise setups, set `DATABASE_URL=postgresql+asyncpg://user:password@host:5432/messwise`.
* [x] **Stateless Auth**: JWT tokens expire after 24 hours (`ACCESS_TOKEN_EXPIRE_MINUTES=1440`).
