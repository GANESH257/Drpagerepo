import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/practices - Get all practices
// Query params: city, state, specialty, search, page, limit, includePending (admin only)
router.get('/', async (req, res) => {
  try {
    const { city, state, specialty, search, page = '1', limit = '100', includePending } = req.query;
    let statusFilter = "p.status = 'active'";
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let debugPath = 'default-active'; // visible in Response Headers as X-Practices-Debug

    if (token && includePending === 'true') {
      try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          debugPath = 'no-secret';
        } else {
          const decoded = jwt.verify(token, secret) as { role?: string };
          if (decoded.role === 'admin') {
            statusFilter = '1=1';
            debugPath = 'admin-all';
          } else {
            statusFilter = "(p.status = 'active' OR p.status = 'pending_profile')";
            debugPath = 'non-admin-pending';
          }
        }
      } catch (err) {
        debugPath = `jwt-failed: ${(err as Error).message}`;
      }
    } else if (!token) {
      debugPath = 'no-token';
    } else if (includePending !== 'true') {
      debugPath = 'no-include-pending';
    }

    let query = `
      SELECT p.*
      FROM practices p
      WHERE ${statusFilter}
    `;
    const params: any[] = [];
    let paramCount = 0;

    // Apply filters
    if (city) {
      paramCount++;
      query += ` AND p.city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
    }

    if (state) {
      paramCount++;
      query += ` AND p.state = $${paramCount}`;
      params.push(state);
    }

    if (specialty) {
      paramCount++;
      query += ` AND EXISTS (
        SELECT 1 FROM practice_specialties ps 
        WHERE ps.practice_id = p.id AND ps.specialty = $${paramCount}
      )`;
      params.push(specialty);
    }

    if (search) {
      paramCount++;
      query += ` AND (
        p.name ILIKE $${paramCount} OR
        p.description ILIKE $${paramCount} OR
        p.city ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY p.name ASC';

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 100;
    const offset = (pageNum - 1) * limitNum;
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limitNum);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    // Get total count (same status filter and filters as main query)
    let countQuery = `SELECT COUNT(*) as total FROM practices p WHERE ${statusFilter}`;
    const countParams: any[] = [];
    let countParamCount = 0;

    if (city) {
      countParamCount++;
      countQuery += ` AND p.city ILIKE $${countParamCount}`;
      countParams.push(`%${city}%`);
    }

    if (state) {
      countParamCount++;
      countQuery += ` AND p.state = $${countParamCount}`;
      countParams.push(state);
    }

    if (specialty) {
      countParamCount++;
      countQuery += ` AND EXISTS (
        SELECT 1 FROM practice_specialties ps 
        WHERE ps.practice_id = p.id AND ps.specialty = $${countParamCount}
      )`;
      countParams.push(specialty);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (
        p.name ILIKE $${countParamCount} OR
        p.description ILIKE $${countParamCount} OR
        p.city ILIKE $${countParamCount}
      )`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.setHeader('X-Practices-Debug', debugPath);
    res.json({
      practices: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching practices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/practices/:id/invitations - List invitations (PA only)
router.get('/:id/invitations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const practiceId = req.params.id;
    const userId = req.userId;
    const doctorResult = await pool.query(
      'SELECT id, practice_id FROM doctors WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    if (doctorResult.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });
    const myPracticeId = doctorResult.rows[0].practice_id;
    if (myPracticeId !== practiceId) return res.status(403).json({ error: 'Not your practice' });
    const isPA = await pool.query(
      "SELECT 1 FROM practice_roles WHERE doctor_id = $1 AND practice_id = $2 AND role = 'practice_admin'",
      [doctorResult.rows[0].id, practiceId]
    );
    if (isPA.rows.length === 0) return res.status(403).json({ error: 'Practice admin only' });
    const result = await pool.query(
      'SELECT * FROM practice_invitations WHERE practice_id = $1 ORDER BY created_at DESC',
      [practiceId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/practices/:id/invitations - Create invitation (PA only)
router.post('/:id/invitations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const practiceId = req.params.id;
    const userId = req.userId;
    const { email, doctor_name, message } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    const doctorResult = await pool.query(
      'SELECT id, practice_id FROM doctors WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    if (doctorResult.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });
    if (doctorResult.rows[0].practice_id !== practiceId) return res.status(403).json({ error: 'Not your practice' });
    const isPA = await pool.query(
      "SELECT 1 FROM practice_roles WHERE doctor_id = $1 AND practice_id = $2 AND role = 'practice_admin'",
      [doctorResult.rows[0].id, practiceId]
    );
    if (isPA.rows.length === 0) return res.status(403).json({ error: 'Practice admin only' });
    const token = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 12)}`;
    const id = `pi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await pool.query(
      `INSERT INTO practice_invitations (id, practice_id, invited_by, email, doctor_name, message, token, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, practiceId, doctorResult.rows[0].id, email, doctor_name || null, message || null, token, expiresAt]
    );
    const row = await pool.query('SELECT * FROM practice_invitations WHERE id = $1', [id]);
    res.status(201).json(row.rows[0]);
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/practices/:id/membership - Memberships for practice (PA only)
router.get('/:id/membership', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const practiceId = req.params.id;
    const userId = req.userId;
    const doctorResult = await pool.query(
      'SELECT id, practice_id FROM doctors WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    if (doctorResult.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });
    if (doctorResult.rows[0].practice_id !== practiceId) return res.status(403).json({ error: 'Not your practice' });
    const isPA = await pool.query(
      "SELECT 1 FROM practice_roles WHERE doctor_id = $1 AND practice_id = $2 AND role = 'practice_admin'",
      [doctorResult.rows[0].id, practiceId]
    );
    if (isPA.rows.length === 0) return res.status(403).json({ error: 'Practice admin only' });
    const result = await pool.query(
      'SELECT * FROM memberships WHERE practice_id = $1 ORDER BY created_at DESC',
      [practiceId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching practice membership:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/practices/:id - Update practice (admin only)
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    const id = req.params.id;
    const body = req.body as Record<string, unknown>;
    const allowed = new Set([
      'name', 'description', 'phone', 'email', 'website',
      'address_line1', 'address_line2', 'city', 'state', 'zip', 'country', 'status',
      'logo_url',
    ]);
    const setParts: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      if (!allowed.has(key)) continue;
      setParts.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
    if (setParts.length === 0) {
      const current = await pool.query('SELECT * FROM practices WHERE id = $1', [id]);
      if (current.rows.length === 0) return res.status(404).json({ error: 'Practice not found' });
      return res.json(current.rows[0]);
    }
    const setClause = setParts.join(', ');
    const result = await pool.query(
      `UPDATE practices SET ${setClause}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      [...values, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Practice not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating practice:', error);
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
