# Deployment Guide

## Recommendation

- Frontend: Vercel (great fit for Vite SPA)
- Backend: Render / Railway / Fly.io / Cloud Run (better fit than Vercel for persistent Node server + Socket.IO)

Vercel is not ideal for this backend because this project starts a long-lived HTTP + Socket.IO server. Vercel functions are serverless/ephemeral and do not support this model reliably for realtime sockets.

## Frontend (Vercel)

### 1. Import project

- In Vercel, import the `frontend` folder as a project.

### 2. Build settings

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

### 3. Environment variables

Set in Vercel project settings:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_API_URL` -> your deployed backend URL, e.g. `https://api.yourdomain.com`

### 4. SPA routing

- `frontend/vercel.json` already includes rewrite to `index.html` for React Router routes.

## Backend (Render/Railway/Fly.io)

### 1. Build from backend folder

- `backend/Dockerfile` is ready for container deployment.

### 2. Required environment variables

Use `backend/.env.example` as template.
Must provide at minimum:

- `NODE_ENV=production`
- `PORT` (platform usually injects this)
- `CLIENT_ORIGIN` (set to your frontend domain)
- `JWT_SECRET`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- Firebase admin credentials: either
  - `FIREBASE_SERVICE_ACCOUNT_PATH`, or
  - `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`
- `BREVO_API_KEY` and sender/template vars if email features are used

### 3. Health check

- Use `GET /health`

### 4. CORS

- `CLIENT_ORIGIN` must match frontend origin exactly.
- Multiple origins are supported as comma-separated values.

## Post-deploy checklist

1. Open frontend and verify login works.
2. Ensure backend `/health` returns `200`.
3. Confirm authenticated API requests succeed from frontend.
4. Verify HR template assignment and employee checklist flow.
5. If using sockets, verify realtime events connect from frontend domain.
