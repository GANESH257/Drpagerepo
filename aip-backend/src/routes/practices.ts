import express from 'express';
import { pool } from '../db/connection';

const router = express.Router();

// GET /api/practices - Get all practices
// Query params: city, state, specialty, search, page, limit
router.get('/', async (req, res) => {
  try {
    const { city, state, specialty, search, page = '1', limit = '100' } = req.query;
    
    let query = `
      SELECT p.*
      FROM practices p
      WHERE p.status = 'active'
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

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM practices p WHERE p.status = 'active'`;
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
