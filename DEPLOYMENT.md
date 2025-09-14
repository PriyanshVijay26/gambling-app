# Deployment Guide

## 🚀 Deployment Instructions

### Prerequisites
- GitHub account
- Render account (for backend)
- Netlify account (for frontend)

### Step 1: Deploy Backend (Render)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Production ready gambling app"
   git push origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repo
   - Configure settings:
     - **Name:** `gambling-app-backend`
     - **Region:** Choose closest to your users
     - **Branch:** `main`
     - **Root Directory:** `backend`
     - **Runtime:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - Add environment variables:
     ```
     NODE_ENV=production
     CLIENT_URL=https://your-netlify-app.netlify.app
     ```

3. **Get Backend URL:**
   - Copy your Render deployment URL (e.g., `https://gambling-app-backend.onrender.com`)

### Step 2: Deploy Frontend (Netlify)

1. **Create .env file:**
   ```bash
   cd frontend
   cp .env.example .env
   ```
   
2. **Update .env with your backend URL:**
   ```
   VITE_SERVER_URL=https://gambling-app-backend.onrender.com
   ```

3. **Build and Deploy:**
   - Push frontend to GitHub
   - Connect to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variable: `VITE_SERVER_URL=https://gambling-app-backend.onrender.com`

### Step 3: Update CORS

Update backend environment variable:
```
CLIENT_URL=https://your-netlify-app.netlify.app
```

## 🎯 Alternative Platforms

### Backend Options:
- **Render** (Recommended) - Excellent free tier, auto-deploy from GitHub
- **Railway** - Easy deployment, generous free tier  
- **Heroku** - Reliable but paid plans only
- **DigitalOcean App Platform** - Good performance

### Frontend Options:
- **Netlify** (Recommended) - Best for React apps
- **Vercel** - Excellent for React/Next.js
- **GitHub Pages** - Free but limited

## 📋 Production Checklist

- [x] Backend configured with environment variables
- [x] Frontend configured with VITE_SERVER_URL
- [x] CORS properly set up
- [x] Procfile for deployment platforms
- [x] All games use backend (no hardcoded Math.random)
- [x] Provably fair system implemented
- [x] Socket.io real-time features working

## 🔧 Post-Deployment

1. Test all games work with backend
2. Verify chat and leaderboards update
3. Check fairness verification
4. Monitor server logs for errors

## 🎮 Your App Features

✅ **9 Games:** Mines, CoinFlip, Limbo, Crash, Upgrader, MurderMystery, Dice, Plinko, Towers
✅ **Provably Fair:** HMAC-SHA256 verification
✅ **Real-time Chat:** Global chat with avatars
✅ **Leaderboards:** Live stats tracking
✅ **Guest Authentication:** Username/avatar system