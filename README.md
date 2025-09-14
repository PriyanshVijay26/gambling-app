# Roblox-Style P2P Gambling Platform

A modern, responsive gambling platform inspired by Murder Mystery 2 and comparable to Harvester.gg, featuring 9 games, provably fair gaming, social features, and real-time multiplayer functionality.

## 🎮 Complete Game Catalog (9 Games)

### Core Games
- **Mines** - Classic minesweeper-style gambling with customizable difficulty
- **Coin Flip** - Simple heads/tails betting with instant results
- **Limbo** - Multiplier-based game with target goals
- **Crash** - Real-time multiplier crash game with cash-out mechanics
- **Upgrader** - Upgrade-style multiplier progression
- **Murder Mystery 2** - Roblox-inspired P2P battles with roles and strategy

### New Games Added
- **Dice** - Roll over/under your target number with configurable win chances
- **Plinko** - Ball drop simulation with 3 risk levels and 17 buckets
- **Towers** - Level-based climbing game with difficulty settings and cash-out system

## 🔒 Provably Fair Gaming

### Complete Fairness System
- **HMAC-SHA256** based random number generation
- **Server Seed + Client Seed + Nonce** for transparency
- **Real-time verification** with client-side HMAC calculation
- **Server seed rotation** and disclosure system
- **Client seed management** widget for user control
- **Fairness verification modal** for all game results

## 🌐 Social & Community Features

### Chat & Communication
- **Global Chat** with username and avatar support
- **Dicebear API** integration for avatar generation
- **Real-time messaging** with profanity filtering

### Live Activity
- **Big Wins Feed** - Real-time feed of wins over $100
- **Leaderboard** - User rankings by total winnings and games played
- **Live Player Counts** for each game

### User System
- **Guest Authentication** with username/avatar selection
- **Profile Management** with statistics tracking
- **Session Persistence** across page reloads

## 💰 Referral System

- **Referral Code Generation** (8-character alphanumeric codes)
- **5% Earnings** from referred users' winnings
- **Referral Tracking** and statistics dashboard
- **Bonus System** for new users using referral codes

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with modern hooks and context
- **Vite** for fast development and building
- **Tailwind CSS v3** for responsive styling
- **Framer Motion** for smooth animations
- **Socket.io Client** for real-time communication
- **crypto-js** for client-side fairness verification

### Backend Stack
- **Node.js** with Express.js
- **Socket.io** for WebSocket communication
- **In-memory storage** with real-time updates
- **Modular game classes** with provably fair RNG
- **RESTful API** for fairness endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Setup

1. Clone and install dependencies:
```bash
cd gambling_app
npm install
```

2. Start development servers:
```bash
# Start both backend and frontend concurrently
npm run dev

# Or start individually:
npm run dev:backend  # Backend on port 3001
npm run dev:frontend # Frontend on port 5173
```

3. Access the platform:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 🎯 Game Features

### Universal Game Features
- **Provably Fair RNG** for all games
- **Real-time results** with Socket.io
- **Fairness verification** for every outcome
- **Big win detection** and broadcasting
- **Statistics tracking** and leaderboard integration

### Game-Specific Features

#### Dice Game
- Roll over/under mechanics with 1-99 targets
- Dynamic multiplier calculation based on probability
- Instant results with visual feedback

#### Plinko Game
- 17-bucket physics simulation
- Three risk levels with different multiplier distributions
- Animated ball drop with realistic bouncing

#### Towers Game
- 8-level tower with progressive difficulty
- Cash-out system with increasing multipliers
- Safe path generation with configurable blocks

## 📱 Responsive Design

Fully optimized for all devices:
- **Desktop** (1920x1080+) - Full feature experience
- **Tablet** (768px - 1024px) - Touch-optimized interface
- **Mobile** (320px - 767px) - Mobile-first responsive design

## 🔧 Development

### Project Structure
```
gambling_app/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Game pages and routes
│   │   ├── context/       # React context providers
│   │   └── utils/         # Utility functions
├── backend/
│   ├── games/             # Game logic classes
│   ├── utils/             # Server utilities
│   └── server.js          # Main server file
├── shared/                # Shared types and utilities
└── docs/                  # Documentation
```

### Key Backend Features
- **Modular game architecture** for easy expansion
- **Socket event handling** for real-time gameplay
- **Provably fair utilities** with HMAC-SHA256
- **Big win tracking** and live feed management
- **Referral system** with code generation and tracking

### Key Frontend Features
- **Dynamic component loading** for optimal performance
- **Socket context** for centralized real-time communication
- **Fairness verification** with local HMAC calculation
- **Responsive game interfaces** with professional UI/UX
- **Live updates** for chat, leaderboards, and big wins

## � Current Status

✅ **Completed Features:**
- 9 complete games with professional interfaces
- Provably fair gaming with full verification system
- Social features (chat, leaderboards, live feeds)
- Referral system for user acquisition
- Guest authentication with avatar support
- Real-time updates across all features
- Mobile-responsive design

🚀 **Ready for Production:**
The platform now matches Harvester.gg's feature set and is ready for deployment with additional games and features easily extensible using the established patterns.

## 📖 API Documentation

### Fairness Endpoints
- `GET /api/fair/reveal` - Get revealed server seed
- `GET /api/leaderboard` - Get current leaderboard

### Socket Events
See `/docs` folder for complete Socket.io event documentation including game-specific events, chat system, and fairness management.
