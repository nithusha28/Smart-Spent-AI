# SmartSpend AI - Deployment Guide

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Users / Judges                            │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐  ┌───────▼───────┐  ┌──▼─────────┐
    │ Vercel  │  │  Railway.app  │  │ Hugging    │
    │ Edge    │  │  or Render    │  │ Face       │
    │(CDN)    │  │  (Node.js)    │  │ Spaces(ML) │
    └────┬────┘  └───────┬───────┘  └──┬─────────┘
         │               │             │
         │               └─────────┬───┘
         │                         │
         │                    ┌────▼────┐
         └────────────────────┤ Supabase│
                              │PostgreSQL
                              └─────────┘
```

## Production Environment Variables

### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ML_SERVICE_URL=https://ml-api.yourdomain.com
```

### Backend (.env.production)
```
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres
JWT_SECRET=<generate-strong-secret-64-chars>
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
ML_SERVICE_URL=https://ml-api.yourdomain.com
```

### ML Service (.env.production)
```
ENV=production
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

## Step-by-Step Deployment

### 1. Database Setup (Supabase)

```bash
# Create Supabase account and project
1. Go to https://supabase.com
2. Create new project
3. Copy connection string from Settings → Database
4. Run migrations in SQL editor:
   - Copy contents of scripts/01-init-database.sql
   - Paste into Supabase SQL editor
   - Execute

# Test connection
psql <your-connection-string> -c "SELECT COUNT(*) FROM users;"
```

### 2. Deploy Backend API (Railway.app)

```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Initialize and deploy
cd backend
railway init
railway link                    # Link to Supabase project
railway add                     # Add PostgreSQL (skip - use Supabase)
railway up

# Set environment variables in Railway dashboard
- DATABASE_URL
- JWT_SECRET
- NODE_ENV=production
- FRONTEND_URL
- ML_SERVICE_URL

# Get backend URL (e.g., https://smartspend-api.railway.app)
```

### 3. Deploy ML Service (Hugging Face Spaces)

```bash
# Create HF account and Space
1. Go to https://huggingface.co/spaces
2. Create new Space (Private)
3. Choose "Docker" as SDK
4. Clone the space

git clone https://huggingface.co/spaces/your-username/smartspend-ml
cd smartspend-ml

# Copy ML service files
cp -r ../../ml-service/* .

# Create runtime.txt
echo "python==3.11" > runtime.txt

# Push to deploy
git add .
git commit -m "Deploy SmartSpend ML service"
git push

# Get ML Service URL from HF (e.g., https://username-smartspend-ml.hf.space)
```

### 4. Deploy Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
NEXT_PUBLIC_ML_SERVICE_URL=https://your-huggingface-space.hf.space

# Configure custom domain if needed
vercel domains add yourdomain.com

# Get frontend URL (e.g., https://smartspend.vercel.app)
```

## DNS Configuration (Optional - for custom domain)

```
# In your domain registrar (GoDaddy, Namecheap, etc.)
Add CNAME records:
  yourdomain.com          → CNAME: cname.vercel-dns.com
  api.yourdomain.com      → CNAME: railway.app (or your provider)
  ml.yourdomain.com       → CNAME: huggingface.co (or your provider)
```

## Post-Deployment Verification

### 1. Test Frontend
```bash
# Visit https://yourdomain.com
# Check homepage loads
# Check API calls in browser console
```

### 2. Test Backend
```bash
# Test health endpoint
curl https://your-railway-backend.railway.app/health

# Test registration
curl -X POST https://your-railway-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123", "fullName": "Test User"}'
```

### 3. Test ML Service
```bash
# Test categorization
curl -X POST https://your-huggingface-space.hf.space/api/categorize \
  -H "Content-Type: application/json" \
  -d '{"description": "Coffee at Starbucks"}'

# Check response
# Should return: {"category": "Food", "confidence": 0.95, ...}
```

### 4. Test Database
```bash
# Connect to production database
psql <production-connection-string>

# Check tables exist
\dt

# Check users can be created
INSERT INTO users (email, passwordHash, fullName) 
VALUES ('test@example.com', 'hash', 'Test');
SELECT * FROM users;
```

## Monitoring & Maintenance

### Set Up Error Tracking (Sentry)

```bash
# 1. Create Sentry account
# 2. Create new project for SmartSpend
# 3. Add to backend:
npm install @sentry/node

# In backend/src/index.ts:
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });

# 4. Add SENTRY_DSN to environment variables
```

### Set Up Monitoring

```bash
# Check backend uptime
curl -I https://your-backend.railway.app/health

# Check ML service status
curl -I https://your-ml-service.hf.space/health

# Check database connections
psql <connection-string> -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

### Database Backups (Supabase)

```bash
# Supabase automatically backs up daily
# Manual backup:
pg_dump <connection-string> > backup.sql

# Restore if needed:
psql <connection-string> < backup.sql
```

## Scaling Considerations

### When Traffic Increases

1. **Backend**: Railway allows easy scaling with "Add Replica"
2. **ML Service**: Add more instances on HF Spaces
3. **Database**: Upgrade Supabase plan for more connections
4. **CDN**: Vercel automatically scales

### Performance Optimization

```bash
# 1. Enable query caching (PostgreSQL)
SET shared_preload_libraries = 'pg_stat_statements';

# 2. Add Redis for API response caching
# Use Upstash Redis (free tier available)

# 3. Implement database query caching in backend
```

## Rollback Procedure

```bash
# If something goes wrong:

# Railway - rollback to previous deployment
railway rollback

# Vercel - rollback to previous deployment
vercel rollback

# Database - restore from backup
psql <connection-string> < backup.sql
```

## Security Checklist for Production

- [x] JWT_SECRET is 64+ random characters
- [x] All environment variables are set
- [x] HTTPS is enforced (automatic on Vercel/Railway)
- [x] CORS is configured correctly
- [x] Database backups are enabled
- [x] Error logging is configured (Sentry)
- [x] API rate limiting is implemented
- [x] Password hashing uses bcryptjs
- [x] RLS policies are enabled in database
- [x] Audit logs are being recorded

## Troubleshooting Production Issues

### 500 Error from Backend
```bash
# Check backend logs on Railway
railway logs

# Check database connection
psql <connection-string> -c "SELECT 1"

# Restart backend
railway restart
```

### ML Service Not Responding
```bash
# Check HF Spaces logs
# Redeploy if needed:
git push huggingface main

# Or use fallback categorization on backend
```

### Database Connection Errors
```bash
# Check Supabase dashboard for status
# Verify connection string is correct
# Check connection pooling settings
```

### Frontend API Errors
```bash
# Check browser console for exact error
# Verify API URL environment variable
# Check backend is responding to requests
# Check CORS headers are correct
```

## Cost Estimation

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Vercel** | 100GB bandwidth | $20/mo + overages |
| **Railway** | $5/month credit | $0.0000463/hour |
| **Supabase** | 500MB DB, 2GB storage | $25/mo |
| **HF Spaces** | Free (public) | Free (private) |
| **Sentry** | 5,000 errors/month | $29/mo |

**Total**: ~$30-50/month for production

## Next Steps After Deployment

1. ✅ Register test user and verify email flow
2. ✅ Add sample expenses and test categorization
3. ✅ Create budgets and test notifications
4. ✅ Monitor error logs and performance metrics
5. ✅ Gather user feedback and iterate
6. ✅ Set up automated backups and monitoring

---

**Deployed and ready to handle real users!** 🚀
