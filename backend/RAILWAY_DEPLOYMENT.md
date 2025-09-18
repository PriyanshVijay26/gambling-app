# Railway Deployment Guide

Deploy your gambling app to Railway with PostgreSQL in production.

## 🚀 Quick Railway Deployment

### 1. Setup Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Install Railway CLI: `npm install -g @railway/cli`

### 2. Deploy to Railway

```bash
# Login to Railway
railway login

# Initialize project
railway init

# Add PostgreSQL service
railway add postgresql

# Deploy the backend
railway up
```

### 3. Configure Environment Variables

Railway automatically provides:
- `DATABASE_URL` - Complete PostgreSQL connection string
- `PORT` - Assigned port for your service

Set these additional variables in Railway dashboard:

```env
NODE_ENV=production
SESSION_SECRET=your-production-secret-key
FRONTEND_URL=https://your-frontend-domain.com
```

### 4. Frontend Deployment

For the frontend, you can deploy to Vercel, Netlify, or Railway:

**Update frontend API URL:**
```javascript
// In frontend/src/config.js or similar
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-railway-backend.railway.app'
  : 'http://localhost:3001';
```

## 🔧 Railway Configuration

### Automatic Features
✅ **PostgreSQL Database** - Managed, backed up, monitored
✅ **SSL/TLS** - Automatic HTTPS certificates  
✅ **Environment Variables** - Secure config management
✅ **Auto-scaling** - Scales based on traffic
✅ **Monitoring** - Built-in metrics and logs
✅ **Zero-downtime** - Rolling deployments

### Database Features
- **Automatic backups** every 24 hours
- **Connection pooling** handled by our app
- **SSL encryption** for secure connections
- **Monitoring dashboard** for performance metrics
- **Point-in-time recovery** for data protection

## 📋 Production Checklist

### Security
- [ ] Change `SESSION_SECRET` to a secure random string
- [ ] Set `NODE_ENV=production`
- [ ] Update CORS origins to your domain
- [ ] Review database permissions

### Performance  
- [ ] Test with realistic user loads
- [ ] Monitor database connection pool usage
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure logging aggregation

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure alerts for errors
- [ ] Monitor database performance
- [ ] Track user analytics

## 🌐 Domain Setup

### Backend Domain
1. Go to Railway project settings
2. Add custom domain (e.g., `api.yourgamingsite.com`)
3. Update frontend to use new API URL

### Frontend Domain
Deploy frontend separately and point to Railway backend:
```javascript
const SOCKET_URL = 'https://api.yourgamingsite.com';
```

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check logs
railway logs

# Connect to database directly
railway connect postgresql
```

### Common Issues
1. **Port binding** - Railway provides PORT via environment
2. **CORS errors** - Update frontend URL in env vars  
3. **Database timeout** - Check connection pool settings
4. **Memory limits** - Monitor usage in Railway dashboard

### Debug Commands
```bash
# View environment variables
railway variables

# View service status
railway status

# Access shell
railway shell
```

## 💰 Cost Optimization

### Railway Pricing
- **Hobby Plan**: $5/month (perfect for development)
- **Pro Plan**: $20/month (production ready)
- **PostgreSQL**: Included in plans

### Tips
- Use connection pooling (already implemented)
- Monitor resource usage
- Optimize database queries
- Consider caching for frequently accessed data

## 🔄 CI/CD Setup

### Automatic Deployments
Railway can auto-deploy from GitHub:

1. Connect your GitHub repository
2. Enable auto-deploy on main branch
3. Railway builds and deploys automatically

### GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up --detach
```

## 📊 Monitoring Production

### Railway Dashboard
- View real-time metrics
- Monitor database performance  
- Check deployment logs
- Track resource usage

### Application Health
The app includes `/api/health` endpoint that checks:
- Server status
- Database connectivity
- Active connections
- Game statistics

### Performance Metrics
Monitor these key metrics:
- Response times
- Database connection pool usage
- Memory and CPU usage
- Active WebSocket connections
- Game completion rates

Your gambling app is now production-ready with Railway! 🎰