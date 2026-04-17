# SmartSpend AI - Complete Setup Guide

## Project Overview

SmartSpend AI is a **production-grade, full-stack expense tracking application** with AI-powered financial intelligence. This guide covers setup for the national hackathon submission.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js 16)                  │
│           - Dashboard, Analytics, Gamification           │
│              React 19.2, Tailwind CSS v4                │
└──────────────────────────┬──────────────────────────────┘
                           │
                    API Calls (REST)
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌───────▼────────┐ ┌──────▼──────────┐
│  Backend API   │ │   ML Service   │ │   PostgreSQL DB │
│ (Node.js +     │ │   (FastAPI)    │ │  (Supabase)     │
│  Express)      │ │                │ │                 │
│ - Auth         │ │ - Categorizer  │ │ - User Data     │
│ - Expenses     │ │ - Forecasting  │ │ - Expenses      │
│ - Budgets      │ │ - Insights     │ │ - Budgets       │
│ - Goals        │ │                │ │ - Goals         │
│ - Health Score │ │                │ │ - Scores        │
└────────────────┘ └────────────────┘ └─────────────────┘
```

## Prerequisites

- **Node.js** 18.x or higher
- **Python** 3.11 or higher
- **PostgreSQL** 15 (local) or Supabase account
- **Docker & Docker Compose** (optional, for containerized setup)
- **Git** for version control

## Quick Start (5 minutes)

### Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo>
cd smartspend-ai

# Start all services with one command
docker-compose up -d

# Wait for services to be ready
# Backend: http://localhost:5000
# ML Service: http://localhost:8000
# Frontend: http://localhost:3000
# Database: localhost:5432
```

### Option 2: Manual Setup

#### 1. Database Setup

```bash
# Using Supabase (Recommended for hackathon)
1. Go to https://supabase.com
2. Create a new project
3. Copy connection string
4. Run SQL migrations in SQL editor:
   - Open /scripts/01-init-database.sql
   - Copy and paste into Supabase SQL editor
   - Execute

# OR use local PostgreSQL
createdb smartspend
psql smartspend < scripts/01-init-database.sql
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start development server
npm run dev
# Backend runs on http://localhost:5000
```

#### 3. ML Service Setup

```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
ENV=development
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
EOF

# Start service
python main.py
# ML Service runs on http://localhost:8000
```

#### 4. Frontend Setup

```bash
# In project root directory
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8000
EOF

# Start development server
npm run dev
# Frontend runs on http://localhost:3000
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update profile

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create expense
- `PATCH /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/category/:category` - Get by category

### Budgets
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `PATCH /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/:id/status` - Get budget status

### Goals
- `GET /api/goals` - List savings goals
- `POST /api/goals` - Create goal
- `PATCH /api/goals/:id` - Update goal
- `POST /api/goals/:id/add` - Add to goal amount
- `DELETE /api/goals/:id` - Delete goal
- `GET /api/goals/:id/progress` - Get progress

### Health & Analytics
- `GET /api/health/score` - Get health score
- `GET /api/health/history` - Get score history
- `GET /api/health/insights` - Get AI insights
- `GET /api/analytics/summary` - Spending summary
- `GET /api/analytics/daily` - Daily breakdown
- `GET /api/analytics/categories` - Category trends
- `GET /api/analytics/comparison` - Month comparison

### Predictions & Leaderboard
- `POST /api/predictions/generate` - Generate forecasts
- `GET /api/leaderboard` - Global leaderboard
- `GET /api/leaderboard/user/rank` - User ranking

## ML Service Endpoints

### Categorization
- `POST /api/categorize` - Categorize expense description
- `GET /api/categorize/categories` - List categories

### Forecasting
- `POST /api/predict` - Generate spending forecast
- `GET /api/predict/trend/:user_id` - Get spending trend

### Insights
- `POST /api/insights` - Generate insights
- `GET /api/insights/recommendations/:user_id` - Get recommendations

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:5432/smartspend
JWT_SECRET=your-secret-key-min-32-chars
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ML_SERVICE_URL=http://localhost:8000
```

### ML Service (.env)
```
ENV=development
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8000
```

## Project Structure

```
smartspend-ai/
├── app/                          # Next.js Frontend
│   ├── page.tsx                 # Dashboard
│   ├── expenses/                # Expense pages
│   ├── budget/                  # Budget pages
│   ├── goals/                   # Goals pages
│   ├── health/                  # Health pages
│   ├── analytics/               # Analytics pages
│   ├── rewards/                 # Gamification pages
│   └── api/                     # API routes
├── components/                   # React Components
│   ├── dashboard/               # Dashboard components
│   ├── expense/                 # Expense components
│   ├── gamification/            # Gamification components
│   └── layout/                  # Layout components
├── lib/
│   ├── types.ts                # TypeScript types
│   ├── calculations.ts         # Utility functions
│   ├── mock-data.ts            # Mock data
│   └── ai/                     # AI utilities
├── backend/                     # Node.js Backend
│   ├── src/
│   │   ├── index.ts            # Entry point
│   │   ├── middleware/         # Auth middleware
│   │   └── routes/             # API routes
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── package.json
│   └── Dockerfile
├── ml-service/                  # Python ML Service
│   ├── main.py                 # FastAPI app
│   ├── routes/
│   │   ├── categorizer.py     # Categorization
│   │   ├── forecasting.py     # Forecasting
│   │   └── insights.py        # Insights
│   ├── requirements.txt
│   └── Dockerfile
├── scripts/
│   └── 01-init-database.sql   # Database schema
├── docker-compose.yml           # Docker orchestration
└── README.md                    # Project overview
```

## Testing the Application

### 1. User Registration & Login
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "securepass123", "fullName": "Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "securepass123"}'
```

### 2. Add Expenses
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Coffee at Starbucks", "amount": 5.50, "date": "2024-01-20"}'
```

### 3. Test ML Categorization
```bash
curl -X POST http://localhost:8000/api/categorize \
  -H "Content-Type: application/json" \
  -d '{"description": "Lunch at Pizza Hut"}'
```

## Deployment

### Deploy to Vercel (Frontend)
```bash
# Login to Vercel
vercel login

# Deploy
vercel deploy --prod

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=your-backend-url
```

### Deploy Backend to Railway/Render
```bash
# Using Railway.app
railway login
railway init
railway up

# Set production environment variables
DATABASE_URL=<production-db>
JWT_SECRET=<strong-secret>
NODE_ENV=production
```

### Deploy ML Service to Hugging Face Spaces
```bash
# Create Space on HF
# Push code with Dockerfile
git push huggingface main
```

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U smartspend -d smartspend -c "SELECT 1"

# Verify DATABASE_URL format:
# postgresql://username:password@localhost:5432/smartspend
```

### ML Service Connection Error
```bash
# Check ML service is running
curl http://localhost:8000/health

# Verify ML_SERVICE_URL in backend .env
```

### Frontend API Errors
```bash
# Check backend is running
curl http://localhost:5000/health

# Verify NEXT_PUBLIC_API_URL in frontend .env.local
# Should be http://localhost:5000 (without trailing slash)
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

## Performance Optimization Tips

1. **Database Indexes**: Already configured in schema
2. **API Response Caching**: Implement Redis for frequently accessed data
3. **Frontend Code Splitting**: Next.js automatically handles this
4. **ML Model Optimization**: Consider using cached embeddings for categorization
5. **Database Query Optimization**: Use pagination for large datasets

## Security Best Practices

1. **JWT Secret**: Use cryptographically strong secret (min 32 chars)
2. **HTTPS**: Enable in production
3. **CORS**: Configure allowed origins
4. **Rate Limiting**: Implement on API endpoints
5. **Input Validation**: Already implemented with Joi
6. **RLS Policies**: Already configured in database
7. **Password Hashing**: Using bcryptjs (10 rounds)
8. **Environment Variables**: Never commit .env files

## Next Steps for Hackathon Judges

1. **Read** `ARCHITECTURE.md` for system design details
2. **Watch** the video demo showing all features
3. **Test** the application using the provided test credentials
4. **Review** the code quality and documentation
5. **Check** the database schema for normalization
6. **Evaluate** AI capabilities (categorization, forecasting)

## Support & Questions

For detailed architecture explanation, see: `ARCHITECTURE.md`
For API documentation, see: `BACKEND_API.md`
For ML service details, see: `ML_SERVICE.md`

---

**Good luck at the national hackathon!** 🚀
