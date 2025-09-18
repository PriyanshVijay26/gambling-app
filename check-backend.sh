#!/bin/bash

echo "🔍 Checking backend server status..."

# Check if port 3001 is in use
echo "📡 Checking port 3001..."
if lsof -i :3001 >/dev/null 2>&1; then
    echo "✅ Port 3001 is in use - server might be running"
    echo "📋 Processes using port 3001:"
    lsof -i :3001
else
    echo "❌ Port 3001 is not in use - server is not running"
fi

echo ""
echo "🌐 Testing HTTP endpoint..."
if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "✅ Backend server is responding"
    curl -s http://localhost:3001/api/health | jq . 2>/dev/null || curl -s http://localhost:3001/api/health
else
    echo "❌ Backend server is not responding"
fi

echo ""
echo "📝 To start the backend server, run:"
echo "   cd /home/priyansh/gambling_app/backend"
echo "   npm start"