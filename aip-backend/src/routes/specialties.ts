import express from 'express';
import crypto from 'crypto';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

function makeId(): string {
  return 'spec-' + crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}

function requireAdmin(req: AuthRequest, res: express.Response): boolean {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return false;
  }
  return true;
}

router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const result = await pool.query(
      'SELECT * FROM specialties ORDER BY sort_order ASC, name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { name, slug, description, sort_order } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const id = makeId();
    const slugVal = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await pool.query(
      `INSERT INTO specialties (id, name, slug, description, sort_order) VALUES ($1, $2, $3, $4, $5)`,
      [id, name, slugVal, description || null, sort_order != null ? Number(sort_order) : 0]
    );
    const row = await pool.query('SELECT * FROM specialties WHERE id = $1', [id]);
    res.status(201).json(row.rows[0]);
  } catch (error) {
    console.error('Error creating specialty:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const result = await pool.query('SELECT * FROM specialties WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching specialty:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { name, slug, description, sort_order } = req.body;
    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (name !== undefined) { updates.push(`name = $${i++}`); values.push(name); }
    if (slug !== undefined) { updates.push(`slug = $${i++}`); values.push(slug); }
    if (description !== undefined) { updates.push(`description = $${i++}`); values.push(description); }
    if (sort_order !== undefined) { updates.push(`sort_order = $${i++}`); values.push(Number(sort_order)); }
    if (updates.length === 0) {
      const r = await pool.query('SELECT * FROM specialties WHERE id = $1', [req.params.id]);
      if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.json(r.rows[0]);
    }
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE specialties SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating specialty:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const result = await pool.query('DELETE FROM specialties WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting specialty:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
