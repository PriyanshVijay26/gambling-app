# Database Setup Guide

This gambling app now uses PostgreSQL for production-ready data persistence instead of in-memory storage.

## Quick Setup

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Run Setup Script (Linux/macOS)

```bash
chmod +x setup-postgres.sh
./setup-postgres.sh
```

### 3. Manual Setup (if script doesn't work)

1. **Create Database:**
```sql
sudo -u postgres psql
CREATE DATABASE gambling_app;
CREATE USER gambling_user WITH ENCRYPTED PASSWORD 'gambling_password';
GRANT ALL PRIVILEGES ON DATABASE gambling_app TO gambling_user;
\c gambling_app
GRANT USAGE ON SCHEMA public TO gambling_user;
GRANT CREATE ON SCHEMA public TO gambling_user;
\q
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Configure Environment:**
Copy `.env.example` to `.env` and update database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gambling_app
DB_USER=gambling_user
DB_PASSWORD=gambling_password
```

### 4. Start the Server

```bash
npm run dev
```

The database tables will be created automatically on first run.

## Database Schema

The app creates the following tables:

- **users** - Player profiles, balances, and statistics
- **game_sessions** - Active game tracking
- **game_results** - Completed game records
- **chat_messages** - Global chat history
- **referral_earnings** - Referral commission tracking
- **server_seeds** - Provably fair seed management
- **user_fairness** - User-specific fairness data

## Features

✅ **Persistent Data** - User profiles and game history survive server restarts
✅ **Referral System** - 5% commission on referred user winnings  
✅ **Provably Fair** - Cryptographic game fairness verification
✅ **Chat History** - Persistent global chat messages
✅ **Statistics** - Detailed player and game analytics
✅ **Leaderboards** - Top winners and recent big wins
✅ **Connection Pooling** - Optimized database performance
✅ **Graceful Shutdown** - Clean database disconnection

## Production Deployment

For production, update these settings:

1. **Change default passwords**
2. **Use environment variables for sensitive data**
3. **Enable SSL/TLS for database connections**
4. **Set up database backups**
5. **Configure connection pooling limits**

## Troubleshooting

**Connection Issues:**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check database exists: `psql -U gambling_user -d gambling_app`
- Verify user permissions

**Table Creation Issues:**
- Check database user has CREATE privileges
- Review schema.sql for any syntax errors
- Check server logs for detailed error messages

**Performance Issues:**
- Monitor connection pool usage
- Check database query performance
- Consider adding additional indexes for large datasets