# GCP Quick Start - GoDaddy Frontend + GCP Backend

## 🎯 Quick Answer

**Yes, it's possible!** Here's the setup:

```
Frontend (GoDaddy) → Backend API (GCP Cloud Run) → Database (Cloud SQL PostgreSQL)
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (GoDaddy)                     │
│  • Static HTML/CSS/JS                                     │
│  • Next.js static export                                  │
│  • Makes API calls to backend                             │
└───────────────────────┬───────────────────────────────────┘
                        │ HTTPS API Calls
                        │ (CORS configured)
                        ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND API (GCP Cloud Run)                  │
│  • Node.js/Express server                                │
│  • REST API endpoints                                     │
│  • JWT authentication                                     │
│  • Handles all business logic                            │
└───────────────────────┬───────────────────────────────────┘
                        │ Private IP Connection
                        │ (Secure, not public)
                        ↓
┌─────────────────────────────────────────────────────────┐
│         DATABASE (Cloud SQL PostgreSQL)                  │
│  • All your data                                         │
│  • Users, Doctors, Practices, Approvals, etc.            │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Recommendation

### **Cloud SQL PostgreSQL** ✅ (BEST CHOICE)

**Why PostgreSQL?**
- ✅ Your schema is already PostgreSQL-ready (`docs/DATABASE_SCHEMA.md`)
- ✅ Best for relational data (practices, doctors, approvals)
- ✅ Excellent performance and reliability
- ✅ Fully managed by GCP

**Cost:**
- Free tier: `db-f1-micro` (testing)
- Production: `db-n1-standard-1` (~$25/month)

**Alternatives:**
- Cloud SQL MySQL (if you prefer MySQL)
- Firestore (NoSQL - not recommended for your relational data)

---

## 🚀 Backend Hosting Options

### **Cloud Run** ✅ (RECOMMENDED)

**Why Cloud Run?**
- ✅ Serverless (pay per request)
- ✅ Auto-scales automatically
- ✅ Easy deployment
- ✅ Free tier: 2 million requests/month
- ✅ Perfect for API servers

**Cost:** ~$0-25/month (depending on traffic)

**Alternatives:**
- App Engine (simpler, less flexible)
- Compute Engine VM (more control, more management)

---

## 📝 What You Need to Do

### 1. **Database Setup** (1-2 hours)
- Create Cloud SQL PostgreSQL instance
- Run your schema from `docs/DATABASE_SCHEMA.md`
- Set up private IP (for security)

### 2. **Backend Setup** (1-2 weeks)
- Create Node.js/Express API
- Set up routes: `/api/auth`, `/api/doctors`, `/api/practices`, etc.
- Configure CORS for your GoDaddy domain
- Deploy to Cloud Run

### 3. **Frontend Updates** (1 week)
- Replace localStorage calls with API calls
- Add API configuration
- Keep static export for GoDaddy
- Build and deploy to GoDaddy

### 4. **Security** (1-2 days)
- Set up CORS whitelist
- Configure JWT authentication
- Enable Cloud SQL private IP
- Set up environment variables

---

## 🔧 Configuration Needed

### Frontend (GoDaddy)
```javascript
// next.config.js
env: {
  NEXT_PUBLIC_API_URL: 'https://your-backend.run.app'
}
```

### Backend (Cloud Run)
```env
DB_HOST=PRIVATE_IP
DB_NAME=aip_production
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=your-secret-key
```

### CORS Setup
```typescript
// Backend CORS config
origin: ['https://yourdomain.com', 'https://www.yourdomain.com']
```

---

## 💰 Cost Breakdown

| Service | Free Tier | Production Cost |
|---------|-----------|----------------|
| Cloud SQL | db-f1-micro (free) | ~$25/month |
| Cloud Run | 2M requests/month | ~$0-10/month |
| **Total** | **$0/month** | **~$25-35/month** |

---

## ✅ Advantages of This Setup

1. **Cost Effective**: Very affordable (~$25-35/month)
2. **Scalable**: Auto-scales with traffic
3. **Secure**: Private database connection
4. **Flexible**: Easy to update backend independently
5. **Fast**: Cloud Run is fast, Cloud SQL is reliable

---

## ⚠️ Important Considerations

### CORS Configuration
- Must configure CORS in backend to allow GoDaddy domain
- Test from actual domain (not just localhost)

### Database Connection
- Use **Private IP** (not public IP) for security
- Cloud Run needs VPC connector to access private IP

### Environment Variables
- Frontend: Use `NEXT_PUBLIC_*` prefix (exposed to browser)
- Backend: Use Cloud Run env vars (secure)

### Authentication
- Store JWT in httpOnly cookies (more secure)
- Or use Authorization header
- Never store sensitive data in localStorage

---

## 🚦 Next Steps

1. ✅ Read full guide: `docs/GCP_DEPLOYMENT_GUIDE.md`
2. ✅ Set up Cloud SQL PostgreSQL instance
3. ✅ Create backend API structure
4. ✅ Deploy backend to Cloud Run
5. ✅ Update frontend to use API
6. ✅ Deploy frontend to GoDaddy
7. ✅ Test end-to-end

---

## 📚 Resources

- **Full Deployment Guide**: `docs/GCP_DEPLOYMENT_GUIDE.md`
- **Database Schema**: `docs/DATABASE_SCHEMA.md`
- **GCP Cloud SQL Docs**: https://cloud.google.com/sql/docs/postgres
- **GCP Cloud Run Docs**: https://cloud.google.com/run/docs

---

**Last Updated**: January 29, 2026
