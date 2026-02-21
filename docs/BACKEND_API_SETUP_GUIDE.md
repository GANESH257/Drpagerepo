# Backend API Setup Guide - Detailed Step-by-Step

## Overview

This guide will help you create a complete Express + Prisma backend API that connects to your Cloud SQL PostgreSQL database and deploys to Cloud Run.

**What You'll Build:**
- Express.js REST API server
- Prisma ORM for database access
- JWT authentication
- All API endpoints your frontend needs
- CORS configuration for GoDaddy frontend
- Docker containerization
- Cloud Run deployment

---

## Prerequisites

✅ **Completed:**
- Cloud SQL PostgreSQL instance created
- Database `aip_production` created
- All 23 tables created via migration script

**What You Need:**
- Node.js 18+ installed locally
- GCP account with Cloud Run enabled
- Google Cloud SDK (`gcloud`) installed
- Your Cloud SQL connection details:
  - Public IP: `35.225.60.9`
  - Port: `5432`
  - Database: `aip_production`
  - Username: `postgres` (or your username)
  - Password: (your password)

---

## Step 1: Create Backend Project Structure

### 1.1 Create Project Folder

```bash
# Navigate to your project root
cd /Users/ganesh/Desktop/DRPLatest/EnsembleDrPage-main

# Create backend folder (separate from frontend)
mkdir aip-backend
cd aip-backend
```

### 1.2 Initialize Node.js Project

```bash
# Initialize package.json
npm init -y

# Install production dependencies
npm install express cors dotenv bcrypt jsonwebtoken
npm install @prisma/client

# Install development dependencies
npm install -D typescript @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken ts-node nodemon prisma

# Install Prisma CLI globally (optional, or use npx)
npm install -g prisma
```

### 1.3 Create Project Structure

```bash
# Create folder structure
mkdir -p src/routes src/middleware src/utils src/db
mkdir -p prisma
```

**Final Structure:**
```
aip-backend/
├── src/
│   ├── index.ts              # Express server entry point
│   ├── routes/
│   │   ├── auth.ts           # Authentication routes
│   │   ├── doctors.ts        # Doctor CRUD operations
│   │   ├── practices.ts      # Practice CRUD operations
│   │   ├── approvals.ts      # Approval workflow routes
│   │   ├── referrals.ts     # Referral system routes
│   │   ├── notifications.ts  # Notification routes
│   │   ├── messages.ts       # Messaging routes
│   │   └── memberships.ts    # Membership routes
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication middleware
│   │   └── cors.ts           # CORS configuration
│   ├── utils/
│   │   ├── errors.ts         # Error handling utilities
│   │   └── validation.ts      # Input validation
│   └── db/
│       └── prisma.ts         # Prisma client instance
├── prisma/
│   └── schema.prisma         # Prisma schema (generated from DB)
├── .env                      # Environment variables (DO NOT COMMIT)
├── .env.example              # Example env file
├── .gitignore
├── Dockerfile
├── .dockerignore
├── tsconfig.json
└── package.json
```

---

## Step 2: Set Up Prisma

### 2.1 Initialize Prisma

```bash
# Initialize Prisma (creates prisma/schema.prisma)
npx prisma init
```

### 2.2 Configure Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Note: We'll use Prisma's introspection to generate models from your existing database
// Run: npx prisma db pull
```

### 2.3 Set Up Database Connection String

Create `.env` file:

```env
# Database Connection (Cloud SQL)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@35.225.60.9:5432/aip_production?sslmode=require"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-to-random-string-min-32-chars"
JWT_EXPIRES_IN="7d"

# CORS Configuration
FRONTEND_URL="https://yourdomain.com"
FRONTEND_URL_WWW="https://www.yourdomain.com"
FRONTEND_URL_LOCAL="http://localhost:3001"

# Server Configuration
PORT=8080
NODE_ENV=production

# Cloud SQL Connection (for Cloud Run - use private IP later)
DB_HOST=35.225.60.9
DB_PORT=5432
DB_NAME=aip_production
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD
```

**Important:** Replace `YOUR_PASSWORD` with your actual Cloud SQL password.

### 2.4 Generate Prisma Client from Database

```bash
# Pull schema from your existing database
npx prisma db pull

# Generate Prisma Client
npx prisma generate
```

This will:
1. Connect to your Cloud SQL database
2. Read all 23 tables
3. Generate TypeScript types and Prisma Client
4. Create `prisma/schema.prisma` with all your models

### 2.5 Create Prisma Client Instance

Create `src/db/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## Step 3: Set Up Express Server

### 3.1 Create TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3.2 Create Main Server File

Create `src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { corsOptions } from './middleware/cors';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import doctorRoutes from './routes/doctors';
import practiceRoutes from './routes/practices';
import approvalRoutes from './routes/approvals';
import referralRoutes from './routes/referrals';
import notificationRoutes from './routes/notifications';
import messageRoutes from './routes/messages';
import membershipRoutes from './routes/memberships';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/practices', practiceRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/memberships', membershipRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

### 3.3 Create CORS Middleware

Create `src/middleware/cors.ts`:

```typescript
import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_WWW,
    process.env.FRONTEND_URL_LOCAL,
  ].filter(Boolean) as string[],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
};
```

---

## Step 4: Create Authentication System

### 4.1 Create Auth Middleware

Create `src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  doctorId?: string;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.doctorId = decoded.doctorId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### 4.2 Create Auth Routes

Create `src/routes/auth.ts`:

```typescript
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        doctors: true,
        admins: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check user status
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        doctorId: user.doctors?.[0]?.id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        doctorId: user.doctors?.[0]?.id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, credentials, specialty } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.users.create({
      data: {
        id: `user-${Date.now()}`,
        email,
        password_hash: passwordHash,
        role: 'applicant',
        status: 'pending',
      },
    });

    res.status(201).json({
      message: 'Account created successfully. Please wait for approval.',
      userId: user.id,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

---

## Step 5: Create API Routes

### 5.1 Doctors Routes

Create `src/routes/doctors.ts`:

```typescript
import express from 'express';
import { prisma } from '../db/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/doctors - Get all doctors (public)
router.get('/', async (req, res) => {
  try {
    const doctors = await prisma.doctors.findMany({
      where: {
        verified: true,
      },
      include: {
        practices: true,
      },
      take: 100,
    });

    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/doctors/:id - Get single doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await prisma.doctors.findUnique({
      where: { id: req.params.id },
      include: {
        practices: true,
        reviews: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/doctors/:id - Update doctor (authenticated)
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Verify user owns this doctor profile
    if (req.doctorId !== req.params.id && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.doctors.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### 5.2 Practices Routes

Create `src/routes/practices.ts`:

```typescript
import express from 'express';
import { prisma } from '../db/prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/practices - Get all practices
router.get('/', async (req, res) => {
  try {
    const practices = await prisma.practices.findMany({
      where: {
        status: 'active',
      },
      include: {
        doctors: true,
        practice_locations: true,
      },
    });

    res.json(practices);
  } catch (error) {
    console.error('Error fetching practices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/practices/:id - Get single practice
router.get('/:id', async (req, res) => {
  try {
    const practice = await prisma.practices.findUnique({
      where: { id: req.params.id },
      include: {
        doctors: true,
        practice_locations: true,
        practice_specialties: true,
        practice_services: true,
        practice_insurance: true,
      },
    });

    if (!practice) {
      return res.status(404).json({ error: 'Practice not found' });
    }

    res.json(practice);
  } catch (error) {
    console.error('Error fetching practice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### 5.3 Create Other Route Files

Create placeholder files for other routes (we'll implement them later):

**`src/routes/approvals.ts`:**
```typescript
import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// All approval routes will go here
// GET /api/approvals
// POST /api/approvals
// PUT /api/approvals/:id/approve
// etc.

export default router;
```

**`src/routes/referrals.ts`:**
```typescript
import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All referral routes will go here

export default router;
```

**`src/routes/notifications.ts`:**
```typescript
import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All notification routes will go here

export default router;
```

**`src/routes/messages.ts`:**
```typescript
import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All message routes will go here

export default router;
```

**`src/routes/memberships.ts`:**
```typescript
import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All membership routes will go here

export default router;
```

---

## Step 6: Update package.json Scripts

Edit `package.json`:

```json
{
  "name": "aip-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:pull": "prisma db pull",
    "prisma:studio": "prisma studio"
  }
}
```

---

## Step 7: Test Locally

### 7.1 Start Development Server

```bash
# Make sure .env is configured
npm run dev
```

Server should start on `http://localhost:8080`

### 7.2 Test Health Endpoint

```bash
curl http://localhost:8080/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### 7.3 Test Database Connection

```bash
# Test Prisma connection
npx prisma studio
```

This opens a GUI to browse your database.

---

## Step 8: Create Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/index.js"]
```

Create `.dockerignore`:

```
node_modules
dist
.env
.git
*.md
```

---

## Step 9: Deploy to Cloud Run

### 9.1 Build and Push Docker Image

```bash
# Set your GCP project ID
export PROJECT_ID=ensemble-portal

# Build and push to Container Registry
gcloud builds submit --tag gcr.io/$PROJECT_ID/aip-backend
```

### 9.2 Deploy to Cloud Run

```bash
gcloud run deploy aip-backend \
  --image gcr.io/$PROJECT_ID/aip-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@35.225.60.9:5432/aip_production?sslmode=require,JWT_SECRET=your-secret-key,FRONTEND_URL=https://yourdomain.com,FRONTEND_URL_WWW=https://www.yourdomain.com,PORT=8080"
```

**Important:** Replace:
- `YOUR_PASSWORD` with your actual password
- `your-secret-key` with a strong random string
- `yourdomain.com` with your actual GoDaddy domain

### 9.3 Get Your API URL

After deployment, you'll get a URL like:
```
https://aip-backend-xxxxx-uc.a.run.app
```

**Save this URL** - you'll need it for frontend configuration.

---

## Step 10: Update Frontend to Use API

### 10.1 Create API Client

In your frontend project, create `src/lib/api/config.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aip-backend-xxxxx-uc.a.run.app';

export const apiClient = {
  get: async (endpoint: string, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  },

  post: async (endpoint: string, data: any, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  },
};
```

### 10.2 Update next.config.js

Add environment variable:

```javascript
env: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://aip-backend-xxxxx-uc.a.run.app',
}
```

---

## Next Steps After Backend Setup

1. ✅ **Backend API**: Complete
2. **Implement all route handlers**: Add full CRUD operations
3. **Data Migration**: Migrate data from TypeScript files to database
4. **Frontend Integration**: Replace all localStorage calls with API calls
5. **Testing**: Test all endpoints
6. **Production Deployment**: Deploy frontend to GoDaddy

---

## Summary

You've now:
1. ✅ Created backend project structure
2. ✅ Set up Prisma with your database
3. ✅ Created Express server with authentication
4. ✅ Set up basic API routes
5. ✅ Created Dockerfile for deployment
6. ✅ Deployed to Cloud Run
7. ✅ Configured frontend to call API

**Your backend is now live and ready to receive requests!**

---

**Last Updated**: January 29, 2026
