# Backend Quick Setup - No Prisma (Fast Deployment)

## Goal: Get Backend Deployed and Working ASAP

This guide uses raw SQL queries (no Prisma) for fastest setup and deployment.

---

## Step 1: Create Backend Project

```bash
# Create backend folder
mkdir aip-backend
cd aip-backend

# Initialize project
npm init -y

# Install dependencies
npm install express cors dotenv pg bcrypt jsonwebtoken
npm install -D typescript @types/node @types/express @types/cors @types/pg @types/bcrypt @types/jsonwebtoken ts-node nodemon

# Create folders
mkdir -p src/routes src/middleware src/db
```

---

## Step 2: Create TypeScript Config

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## Step 3: Database Connection

Create `src/db/connection.ts`:

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || '35.225.60.9',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'aip_production',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // For Cloud SQL public IP
  },
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});
```

---

## Step 4: Environment Variables

Create `.env`:

```env
# Database
DB_HOST=35.225.60.9
DB_PORT=5432
DB_NAME=aip_production
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD_HERE

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters-long-change-this
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://yourdomain.com
FRONTEND_URL_WWW=https://www.yourdomain.com

# Server
PORT=8080
NODE_ENV=production
```

**Replace `YOUR_PASSWORD_HERE` with your actual Cloud SQL password.**

---

## Step 5: CORS Middleware

Create `src/middleware/cors.ts`:

```typescript
import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_WWW,
    'http://localhost:3001',
  ].filter(Boolean) as string[],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

---

## Step 6: Auth Middleware

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
  const token = authHeader && authHeader.split(' ')[1];

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
```

---

## Step 7: Main Server

Create `src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { corsOptions } from './middleware/cors';
import { pool } from './db/connection';

// Import routes
import authRoutes from './routes/auth';
import doctorRoutes from './routes/doctors';
import practiceRoutes from './routes/practices';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: (error as Error).message 
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/practices', practiceRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
```

---

## Step 8: Auth Routes

Create `src/routes/auth.ts`:

```typescript
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/connection';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check status
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Get doctor ID if user is a doctor
    let doctorId = null;
    if (user.role === 'doctor') {
      const doctorResult = await pool.query(
        'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
        [user.id]
      );
      doctorId = doctorResult.rows[0]?.id || null;
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        doctorId: doctorId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        doctorId: doctorId,
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
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Check if user exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `user-${Date.now()}`;

    // Create user
    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, status)
       VALUES ($1, $2, $3, 'applicant', 'pending')`,
      [userId, email, passwordHash]
    );

    res.status(201).json({
      message: 'Account created successfully',
      userId: userId,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

---

## Step 9: Doctors Routes

Create `src/routes/doctors.ts`:

```typescript
import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/doctors - Get all doctors (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, p.name as practice_name, p.city as practice_city, p.state as practice_state
       FROM doctors d
       LEFT JOIN practices p ON d.practice_id = p.id
       WHERE d.verified = true
       LIMIT 100`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/doctors/:id - Get single doctor
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, p.name as practice_name
       FROM doctors d
       LEFT JOIN practices p ON d.practice_id = p.id
       WHERE d.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/doctors/:id - Update doctor (authenticated)
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Verify ownership or admin
    if (req.doctorId !== req.params.id && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Build update query dynamically
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');

    const result = await pool.query(
      `UPDATE doctors SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id, ...values]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

---

## Step 10: Practices Routes

Create `src/routes/practices.ts`:

```typescript
import express from 'express';
import { pool } from '../db/connection';

const router = express.Router();

// GET /api/practices - Get all practices
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM practices WHERE status = 'active' ORDER BY name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching practices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/practices/:id - Get single practice
router.get('/:id', async (req, res) => {
  try {
    const practiceResult = await pool.query(
      'SELECT * FROM practices WHERE id = $1',
      [req.params.id]
    );

    if (practiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Practice not found' });
    }

    const practice = practiceResult.rows[0];

    // Get related data
    const [locations, doctors, specialties, services, insurance] = await Promise.all([
      pool.query('SELECT * FROM practice_locations WHERE practice_id = $1', [req.params.id]),
      pool.query('SELECT id, full_name, specialty FROM doctors WHERE practice_id = $1', [req.params.id]),
      pool.query('SELECT specialty FROM practice_specialties WHERE practice_id = $1', [req.params.id]),
      pool.query('SELECT service FROM practice_services WHERE practice_id = $1', [req.params.id]),
      pool.query('SELECT * FROM practice_insurance WHERE practice_id = $1', [req.params.id]),
    ]);

    res.json({
      ...practice,
      locations: locations.rows,
      doctors: doctors.rows,
      specialties: specialties.rows.map(r => r.specialty),
      services: services.rows.map(r => r.service),
      insurance: insurance.rows,
    });
  } catch (error) {
    console.error('Error fetching practice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

---

## Step 11: Update package.json

Edit `package.json`:

```json
{
  "name": "aip-backend",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

## Step 12: Test Locally

```bash
# Start dev server
npm run dev
```

Test endpoints:
```bash
# Health check
curl http://localhost:8080/health

# Get doctors
curl http://localhost:8080/api/doctors

# Get practices
curl http://localhost:8080/api/practices
```

---

## Step 13: Create Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
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

## Step 14: Deploy to Cloud Run

### 14.1 Build and Push

```bash
# Set your project ID
export PROJECT_ID=ensemble-portal

# Build and push
gcloud builds submit --tag gcr.io/$PROJECT_ID/aip-backend
```

### 14.2 Deploy

```bash
gcloud run deploy aip-backend \
  --image gcr.io/$PROJECT_ID/aip-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="DB_HOST=35.225.60.9,DB_PORT=5432,DB_NAME=aip_production,DB_USER=postgres,DB_PASSWORD=YOUR_PASSWORD,JWT_SECRET=your-secret-key-here,FRONTEND_URL=https://yourdomain.com,FRONTEND_URL_WWW=https://www.yourdomain.com,PORT=8080"
```

**Replace:**
- `YOUR_PASSWORD` with your Cloud SQL password
- `your-secret-key-here` with a random 32+ character string
- `yourdomain.com` with your actual domain

### 14.3 Get Your API URL

After deployment, you'll get:
```
https://aip-backend-xxxxx-uc.a.run.app
```

**Save this URL!**

---

## Step 15: Test Deployed API

```bash
# Test health endpoint
curl https://aip-backend-xxxxx-uc.a.run.app/health

# Should return: {"status":"ok","database":"connected",...}
```

---

## Step 16: Update Frontend

Create `src/lib/api/config.ts` in your frontend:

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

Update `next.config.js`:

```javascript
env: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://aip-backend-xxxxx-uc.a.run.app',
}
```

---

## ✅ Done!

Your backend is now:
- ✅ Deployed to Cloud Run
- ✅ Connected to Cloud SQL
- ✅ Has authentication endpoints
- ✅ Has doctors and practices endpoints
- ✅ Ready to receive requests

**Next:** Add more routes as needed (approvals, referrals, etc.)

---

**Quick Reference:**
- Health: `GET /health`
- Login: `POST /api/auth/login`
- Signup: `POST /api/auth/signup`
- Get Doctors: `GET /api/doctors`
- Get Practices: `GET /api/practices`
