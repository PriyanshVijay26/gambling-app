# Render.com Deployment Guide

Deploy your gambling app backend to Render with PostgreSQL database.

## 🚀 Quick Render Deployment

### 1. Setup Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub repository

### 2. Create PostgreSQL Database

1. **Create Database Service:**
   - Click "New" → "PostgreSQL"
   - Choose a name (e.g., `gambling-app-db`)
   - Select region closest to users
   - Choose plan (Free tier available)

2. **Note Connection Details:**
   - Render provides `DATABASE_URL` automatically
   - Internal/External connection strings available
   - Database will be accessible to your web service

### 3. Deploy Backend Web Service

1. **Create Web Service:**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Choose the repository branch

2. **Configure Build Settings:**
   ```
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   SESSION_SECRET=your-secure-random-string-here
   FRONTEND_URL=https://your-frontend-domain.com
   ```

4. **Database Connection:**
   - Render automatically provides `DATABASE_URL`
   - No manual database config needed
   - App detects and uses database in production

### 4. Configure CORS for Frontend

Update your frontend to use the Render backend URL:

```javascript
// In your frontend config
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-render-backend.onrender.com'
  : 'http://localhost:3001';
```

## 🔧 Render Configuration

### Automatic Features
✅ **PostgreSQL Database** - Managed with automatic backups
✅ **SSL/TLS** - HTTPS enabled by default
✅ **Environment Variables** - Secure configuration
✅ **Auto-deploys** - From GitHub commits
✅ **Health Checks** - Built-in monitoring
✅ **Custom Domains** - Professional URLs

### Database Features
- **Daily backups** included
- **Connection pooling** handled by our app
- **SSL encryption** for secure connections
- **Monitoring dashboard** for performance
- **Automatic scaling** based on usage

## 📋 Production Environment Variables

Set these in Render dashboard:

```bash
# Required
NODE_ENV=production
SESSION_SECRET=your-super-secure-random-string-here
FRONTEND_URL=https://your-frontend-domain.com

# Optional
LOG_LEVEL=info
```

## 🌐 Domain and SSL

### Custom Domain Setup
1. Go to service settings in Render
2. Add custom domain (e.g., `api.yourgamingsite.com`)
3. Update DNS records as instructed
4. SSL certificate auto-provisioned

### Frontend Integration
Update frontend to use your custom domain:
```javascript
const SOCKET_URL = 'https://api.yourgamingsite.com';
```

## 📊 Monitoring and Logs

### Render Dashboard
- **Real-time logs** - View application output
- **Metrics** - CPU, memory, request stats  
- **Deploy history** - Track all deployments
- **Health checks** - Monitor service status

### Application Health
Your app includes `/api/health` endpoint:
```bash
curl https://your-app.onrender.com/api/health
```

Response includes:
- Server status
- Database connectivity  
- Active connections
- Game statistics

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check logs in Render dashboard
   # Verify DATABASE_URL is set
   # Ensure database service is running
   ```

2. **CORS Errors**
   ```bash
   # Update FRONTEND_URL environment variable
   # Check allowed origins in server.js
   ```

3. **Memory Issues**
   ```bash
   # Monitor memory usage in dashboard
   # Consider upgrading plan if needed
   ```

### Debug Commands
Access via Render shell (if needed):
```bash
# View environment variables
env | grep DATABASE

# Check process status
ps aux

# View recent logs
tail -f /var/log/app.log
```

## 💰 Render Pricing

### Free Tier
- **Web Service**: 750 hours/month free
- **PostgreSQL**: 90 days free trial
- **Perfect for development and testing**

### Paid Plans
- **Starter**: $7/month (web service)
- **PostgreSQL**: $7/month (production database)
- **Custom domains and SSL included**

## 🔄 CI/CD with GitHub

### Automatic Deployments
Render auto-deploys when you push to main branch:

1. **Push to GitHub** → **Render detects change**
2. **Builds automatically** → **Deploys new version**
3. **Zero downtime** → **Health checks ensure stability**

### Deploy Hooks
Set up deploy hooks for notifications:
- Slack integration
- Discord webhooks  
- Email notifications

## 🔒 Security Best Practices

### Environment Variables
- Use strong `SESSION_SECRET` (32+ random characters)
- Keep database credentials secure
- Regularly rotate secrets

### Database Security
- Enable SSL (automatic on Render)
- Use connection pooling (implemented)
- Monitor for unusual activity

### Application Security
- Rate limiting (can be added)
- Input validation (implemented)
- CORS properly configured

## 📈 Performance Optimization

### Database Performance
- Connection pooling configured (max 20 connections)
- Indexed queries for leaderboards
- Optimized for gaming workloads

### Application Performance  
- Health check endpoint: `/api/health`
- Real-time WebSocket connections
- Efficient in-memory caching

### Monitoring
- Track response times
- Monitor database query performance
- Watch memory and CPU usage

## 🚀 Going Live Checklist

### Pre-Deploy
- [ ] Set production environment variables
- [ ] Update CORS origins
- [ ] Test database connection
- [ ] Verify health endpoint

### Post-Deploy
- [ ] Test all game functionality
- [ ] Verify WebSocket connections
- [ ] Check database operations
- [ ] Monitor performance metrics

### Frontend Update
- [ ] Update API URLs to Render domain
- [ ] Test complete user flow
- [ ] Verify real-time features work
- [ ] Check mobile compatibility

Your gambling app is now production-ready on Render! 🎰

## 📞 Support

If you need help:
- Render documentation: [render.com/docs](https://render.com/docs)
- Render community: [community.render.com](https://community.render.com)
- Check `/api/health` endpoint for app status