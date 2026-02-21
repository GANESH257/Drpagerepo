# GCP Deployment Guide - Frontend (GoDaddy) + Backend (GCP)

## Architecture Overview

```
Frontend (GoDaddy cPanel)
    ↓ (HTTPS API calls)
Backend API (GCP Cloud Run)
    ↓ (Private IP)
Database (Cloud SQL PostgreSQL)
```

---

## Part 1: Database Setup (Cloud SQL)

### Step 1: Create Cloud SQL Instance

1. **Go to GCP Console** → SQL → Create Instance
2. **Choose PostgreSQL** (version 15+ recommended)
3. **Instance Settings**:
   - Instance ID: `aip-database`
   - Password: Set strong password (save it!)
   - Region: Choose closest to your users (e.g., `us-central1`)
   - Machine Type: `db-f1-micro` (free tier) or `db-n1-standard-1` (production)
4. **Create Instance**

### Step 2: Create Database

```sql
-- Connect to your Cloud SQL instance
-- Use Cloud SQL Proxy or GCP Console SQL Editor

CREATE DATABASE aip_production;
```

### Step 3: Run Schema Migration

```bash
# Copy your schema from docs/DATABASE_SCHEMA.md
# Connect to Cloud SQL and run all CREATE TABLE statements
```

**Connection String Example**:
```
postgresql://username:password@PRIVATE_IP:5432/aip_production
```

---

## Part 2: Backend Setup (Cloud Run)

### Step 1: Create Backend Project Structure

```bash
# Create separate backend folder
mkdir aip-backend
cd aip-backend

# Initialize Node.js project
npm init -y
npm install express cors dotenv pg bcrypt jsonwebtoken
npm install -D @types/express @types/cors @types/pg @types/bcrypt @types/jsonwebtoken typescript ts-node nodemon
```

### Step 2: Backend Structure

```
aip-backend/
├── src/
│   ├── index.ts          # Express server
│   ├── routes/
│   │   ├── auth.ts       # Authentication routes
│   │   ├── doctors.ts    # Doctor CRUD
│   │   ├── practices.ts  # Practice CRUD
│   │   ├── approvals.ts  # Approval workflows
│   │   └── referrals.ts  # Referral system
│   ├── db/
│   │   └── connection.ts # Database connection
│   ├── middleware/
│   │   ├── auth.ts       # JWT authentication
│   │   └── cors.ts       # CORS configuration
│   └── utils/
│       └── types.ts      # Shared types
├── Dockerfile
├── .env.example
└── package.json
```

### Step 3: Environment Variables

Create `.env` file:
```env
# Database
DB_HOST=PRIVATE_IP_OF_CLOUD_SQL
DB_PORT=5432
DB_NAME=aip_production
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://yourdomain.com

# Cloud Run
PORT=8080
```

### Step 4: CORS Configuration

```typescript
// src/middleware/cors.ts
import cors from 'cors';

export const corsOptions = {
  origin: [
    'https://yourdomain.com',        // Your GoDaddy domain
    'https://www.yourdomain.com',    // With www
    'http://localhost:3001',         // For local testing
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

### Step 5: Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["node", "dist/index.js"]
```

### Step 6: Deploy to Cloud Run

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/aip-backend

# Deploy to Cloud Run
gcloud run deploy aip-backend \
  --image gcr.io/YOUR_PROJECT_ID/aip-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="DB_HOST=PRIVATE_IP,DB_NAME=aip_production,DB_USER=username,DB_PASSWORD=password,JWT_SECRET=secret,FRONTEND_URL=https://yourdomain.com"
```

**Note**: Get your Cloud Run URL (e.g., `https://aip-backend-xxxxx.run.app`)

---

## Part 3: Frontend Configuration (GoDaddy)

### Step 1: Update Frontend to Call Backend API

Create `src/lib/api/config.ts`:
```typescript
// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aip-backend-xxxxx.run.app';

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
  
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  // Add auth token to requests
  authenticated: {
    get: async (endpoint: string, token: string) => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.json();
    },
  },
};
```

### Step 2: Replace localStorage Calls

**Before** (localStorage):
```typescript
// src/lib/storage/doctorStorage.ts
const doctors = localStorage.getItem('aip_doctors');
```

**After** (API calls):
```typescript
// src/lib/api/doctors.ts
import { apiClient } from './config';

export async function getDoctors() {
  return apiClient.get('/api/doctors');
}

export async function updateDoctor(id: string, data: any) {
  return apiClient.post(`/api/doctors/${id}`, data);
}
```

### Step 3: Build Static Export

Keep `next.config.js` as static export:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://aip-backend-xxxxx.run.app',
  },
};
```

### Step 4: Deploy to GoDaddy

```bash
# Build static export
npm run build

# Upload /out folder to GoDaddy public_html
```

---

## Part 4: Security Configuration

### 1. Cloud SQL Private IP

- **Enable Private IP** on Cloud SQL instance
- **Connect Cloud Run to VPC** to access private IP
- This prevents database from being publicly accessible

### 2. CORS Whitelist

Only allow your GoDaddy domain:
```typescript
origin: ['https://yourdomain.com', 'https://www.yourdomain.com']
```

### 3. JWT Authentication

- Store JWT in httpOnly cookies (more secure)
- Or use Authorization header with Bearer token
- Set expiration (e.g., 7 days)

### 4. Environment Variables

- Never commit `.env` files
- Use Cloud Run environment variables
- Use Secret Manager for sensitive data

---

## Part 5: Cost Estimation

### Cloud SQL (PostgreSQL)
- **db-f1-micro**: Free tier (1 vCPU, 0.6GB RAM) - Good for testing
- **db-n1-standard-1**: ~$25/month (1 vCPU, 3.75GB RAM) - Production

### Cloud Run
- **Free tier**: 2 million requests/month
- **After free tier**: $0.40 per million requests
- **CPU/Memory**: Pay per use (very cheap)

### Total Estimated Cost
- **Development**: $0/month (free tier)
- **Small Production**: ~$25-50/month
- **Medium Production**: ~$50-100/month

---

## Part 6: Testing Checklist

### ✅ Frontend → Backend Connection
```bash
# Test API endpoint from browser console
fetch('https://aip-backend-xxxxx.run.app/api/health')
  .then(r => r.json())
  .then(console.log)
```

### ✅ CORS Configuration
- Test from your GoDaddy domain
- Should work without CORS errors

### ✅ Database Connection
- Backend should connect to Cloud SQL
- Test CRUD operations

### ✅ Authentication Flow
- Login from frontend
- Receive JWT token
- Use token for authenticated requests

---

## Troubleshooting

### CORS Errors
- Check `FRONTEND_URL` in backend env vars
- Verify domain matches exactly (with/without www)
- Check browser console for CORS error details

### Database Connection Issues
- Verify Cloud SQL instance is running
- Check private IP is correct
- Verify Cloud Run has VPC connector
- Check firewall rules

### API Not Responding
- Check Cloud Run logs: `gcloud run services logs read aip-backend`
- Verify environment variables are set
- Check Cloud Run service is deployed

---

## Next Steps

1. ✅ Set up Cloud SQL PostgreSQL
2. ✅ Create backend API (Express/Node.js)
3. ✅ Deploy backend to Cloud Run
4. ✅ Update frontend to use API
5. ✅ Deploy frontend to GoDaddy
6. ✅ Test end-to-end flow
7. ✅ Set up monitoring and alerts

---

**Last Updated**: January 29, 2026
**Status**: Architecture Guide
