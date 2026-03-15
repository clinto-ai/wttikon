# Wettikon - Bundesliga Betting Analysis App

## Project Overview

A modern, full-stack football betting analysis application focused on the German Bundesliga. The app provides data-driven predictions, value bet detection, live match tracking, and comprehensive bet tracking with PNL/ROI analytics.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT-based local auth with bcrypt
- **Charts**: Recharts
- **Data Source**: football-data.org API
- **Styling**: Custom design system with dark theme, glassmorphism

## Architecture

```
wttikon/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   ├── charts/            # Chart components
│   │   ├── matches/           # Match-related components
│   │   └── betting/           # Betting components
│   ├── lib/                   # Utilities and helpers
│   │   ├── db.ts              # Prisma client
│   │   ├── auth.ts            # Auth utilities
│   │   └── utils.ts           # General utilities
│   ├── services/              # Business logic
│   │   ├── api/               # External API services
│   │   ├── predictions/       # Prediction engine
│   │   └── betting/           # Betting calculations
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── public/                    # Static assets
└── .env.example               # Environment variables template
```

## Database Schema

### Core Entities

- **User**: Authentication and user profile
- **Match**: Bundesliga matches with scores and status
- **Team**: Teams with metadata
- **Odds**: Bookmaker odds for matches
- **Prediction**: AI predictions for matches
- **Bet**: User's placed bets
- **Bookmaker**: Supported bookmakers
- **Market**: Betting markets (1X2, O/U, BTTS)

### Prediction System

Multiple models for ensemble prediction:
1. **Logistic Regression**: Win/draw/loss probabilities
2. **Random Forest**: Feature-based predictions
3. **Poisson Model**: Goal expectations
4. **Elo Rating**: Team strength ratings
5. **Form Model**: Recent performance
6. **Ensemble**: Weighted combination

### Key Features

1. **Authentication**
   - JWT-based sessions
   - Secure password hashing
   - Protected routes

2. **Dashboard**
   - Today's matches
   - Top value bets
   - PNL statistics
   - Performance charts

3. **Match Center**
   - Detailed match info
   - Team statistics
   - Head-to-head
   - Prediction breakdown
   - Value analysis

4. **Value Bet Finder**
   - Filter by market
   - Sort by value %
   - Confidence scores

5. **Live Tracker**
   - Real-time scores
   - Live events
   - Dynamic probabilities

6. **Bet Tracker**
   - Manual bet entry
   - PNL calculation
   - ROI/Yield tracking
   - Performance charts

## API Integration

### football-data.org
- Match fixtures
- Live scores
- Team information
- Standings
- Historical results

### Odds Data
- Bookmaker odds fetching
- Odds comparison
- Value calculation

## Prediction Pipeline

1. **Data Collection**: Fetch matches, odds, statistics
2. **Feature Engineering**: Calculate features (form, Elo, H2H)
3. **Model Training**: Train multiple models on historical data
4. **Prediction**: Generate predictions for upcoming matches
5. **Value Calculation**: Compare fair odds to bookmaker odds
6. **Storage**: Save predictions with timestamp

## UI/UX Design

### Design System
- Dark theme (background: #0a0a0f, cards: #12121a)
- Accent color: Primary blue (#3b82f6), success green (#10b981)
- Glassmorphism effects
- Subtle gradients and glows
- Smooth transitions and hover effects

### Pages
1. **Landing Page**: Hero, features, CTA
2. **Login/Register**: Clean auth forms
3. **Dashboard**: Main analytics hub
4. **Matches**: Browse all matches
5. **Match Detail**: Full prediction analysis
6. **Value Bets**: Filter and sort value bets
7. **Live**: Real-time match tracking
8. **My Bets**: Bet management and PNL
9. **Profile**: User settings

## Setup Instructions

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Add your football-data.org API key
   ```

3. **Initialize database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Run prediction updates**
   ```bash
   npm run update-predictions
   ```

## Environment Variables

- `FOOTBALL_DATA_API_KEY`: API key from football-data.org
- `JWT_SECRET`: Secret for JWT tokens
- `DATABASE_URL`: SQLite database path

## Security Considerations

- Passwords hashed with bcrypt
- JWT tokens with expiration
- Protected API routes
- Input validation
- SQL injection prevention via Prisma
