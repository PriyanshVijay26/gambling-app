#!/bin/bash

# PostgreSQL Setup Script for Gambling App

echo "🎰 Setting up PostgreSQL for Gambling App..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "On Ubuntu/Debian: sudo apt update && sudo apt install postgresql postgresql-contrib"
    echo "On macOS: brew install postgresql"
    echo "On Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

echo "✅ PostgreSQL found"

# Check if PostgreSQL service is running
if ! sudo systemctl is-active --quiet postgresql; then
    echo "🔄 Starting PostgreSQL service..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

echo "✅ PostgreSQL service is running"

# Create database and user
echo "🔄 Setting up database..."

sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE gambling_app;

-- Create user (change password in production!)
CREATE USER gambling_user WITH ENCRYPTED PASSWORD 'gambling_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gambling_app TO gambling_user;

-- Grant usage on schema
\c gambling_app
GRANT USAGE ON SCHEMA public TO gambling_user;
GRANT CREATE ON SCHEMA public TO gambling_user;

\q
EOF

echo "✅ Database 'gambling_app' created"
echo "✅ User 'gambling_user' created with password 'gambling_password'"

# Create .env file with database configuration
echo "🔄 Creating .env file..."

cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gambling_app
DB_USER=gambling_user
DB_PASSWORD=gambling_password

# Server Configuration
PORT=3001
NODE_ENV=development

# Session Configuration
SESSION_SECRET=$(openssl rand -base64 32)

# CORS Configuration
FRONTEND_URL=http://localhost:5173
EOF

echo "✅ .env file created with database configuration"

# Install dependencies
echo "🔄 Installing Node.js dependencies..."
npm install

echo "✅ Dependencies installed"

echo ""
echo "🎉 PostgreSQL setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Review the .env file and update passwords for production"
echo "2. Run 'npm run dev' to start the server"
echo "3. The database tables will be created automatically on first run"
echo ""
echo "🔧 Database connection details:"
echo "   Host: localhost"
echo "   Port: 5432" 
echo "   Database: gambling_app"
echo "   Username: gambling_user"
echo "   Password: gambling_password"
echo ""
echo "⚠️  Remember to change the password for production deployment!"