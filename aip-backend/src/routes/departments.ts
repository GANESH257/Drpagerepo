import express from 'express';
import { pool } from '../db/connection';

const router = express.Router();

/**
 * GET /api/departments
 * Get all departments from departments table
 * Returns empty array if no data exists (data must be populated in database)
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT name, slug, description
       FROM departments
       ORDER BY name ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
