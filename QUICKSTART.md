# SmartSpend AI - Quick Start (5 Minutes)

## Fastest Setup Option: Docker

### Prerequisites
- Docker Desktop installed
- Git

### Steps

```bash
# 1. Clone repository
git clone <your-repo-url>
cd smartspend-ai

# 2. Start all services
docker-compose up -d

# 3. Wait 30 seconds for services to be ready

# 4. Open browser
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# ML Service: http://localhost:8000
# Database: localhost:5432
```

### Test the App

1. **Register a User**
   - Go to http://localhost:3000
   - Sign up with any email/password

2. **Add an Expense**
   - Dashboard → "Add Expense"
   - Enter: "Lunch at Starbucks", Amount: $12.50
   - Watch AI auto-categorize as "Food"

3. **Check Health Score**
   - Go to "Financial Health" tab
   - See your score calculated from expenses

4. **View Leaderboard**
   - Go to "Rewards"
   - See gamification features

---

## Manual Setup (If Docker Not Available)

### Backend (Node.js)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with database URL
npm run dev
# Running on http://localhost:5000
```

### ML Service (Python)
```bash
cd ml-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
# Running on http://localhost:8000
```

### Frontend (Next.js)
```bash
npm install
npm run dev
# Running on http://localhost:3000
```

---

## Key Files for Judges

1. **ARCHITECTURE.md** - System design and decisions
2. **backend/src/** - API implementation
3. **ml-service/routes/** - ML service implementation
4. **app/** - Frontend pages and components
5. **backend/prisma/schema.prisma** - Database schema

---

## Next Steps

- Read **SETUP.md** for detailed setup guide
- Read **ARCHITECTURE.md** for system design explanation
- Explore **backend/src/routes/** for API implementation
- Check **ml-service/** for ML features

---

Good luck! 🚀
