import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/doctors - Get all doctors (public)
// Query params: specialty, city, state, search, page, limit
router.get('/', async (req, res) => {
  try {
    const { specialty, city, state, search, page = '1', limit = '100' } = req.query;
    
    let query = `
      SELECT d.*, p.name as practice_name, p.city as practice_city, p.state as practice_state
      FROM doctors d
      LEFT JOIN practices p ON d.practice_id = p.id
      WHERE d.verified = true
    `;
    const params: any[] = [];
    let paramCount = 0;

    // Apply filters
    if (specialty) {
      paramCount++;
      query += ` AND d.specialty = $${paramCount}`;
      params.push(specialty);
    }

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

    if (search) {
      paramCount++;
      query += ` AND (
        d.full_name ILIKE $${paramCount} OR
        d.specialty ILIKE $${paramCount} OR
        p.name ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY d.full_name ASC';

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

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM doctors d
      LEFT JOIN practices p ON d.practice_id = p.id
      WHERE d.verified = true
    `;
    const countParams: any[] = [];
    let countParamCount = 0;

    if (specialty) {
      countParamCount++;
      countQuery += ` AND d.specialty = $${countParamCount}`;
      countParams.push(specialty);
    }

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

    if (search) {
      countParamCount++;
      countQuery += ` AND (
        d.full_name ILIKE $${countParamCount} OR
        d.specialty ILIKE $${countParamCount} OR
        p.name ILIKE $${countParamCount}
      )`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      doctors: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
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
