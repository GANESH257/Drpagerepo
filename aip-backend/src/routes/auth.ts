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

    // Allow pending users to login (for approval request submission)
    // Frontend will handle restricting dashboard access for pending users
    // Only block suspended/deleted users
    if (user.status === 'suspended' || user.status === 'deleted') {
      return res.status(403).json({ error: 'Account is suspended or deleted' });
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
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        doctorId: doctorId,
      },
      jwtSecret,
      { expiresIn } as any
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
