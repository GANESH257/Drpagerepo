import express from 'express';
import crypto from 'crypto';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

function makeId(): string {
  return 'treat-' + crypto.randomUUID().replace(/-/g, '').slice(0, 12);
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
      'SELECT * FROM treatments ORDER BY sort_order ASC, name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching treatments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { name, slug, sort_order } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const id = makeId();
    const slugVal = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await pool.query(
      `INSERT INTO treatments (id, name, slug, sort_order) VALUES ($1, $2, $3, $4)`,
      [id, name, slugVal, sort_order != null ? Number(sort_order) : 0]
    );
    const row = await pool.query('SELECT * FROM treatments WHERE id = $1', [id]);
    res.status(201).json(row.rows[0]);
  } catch (error) {
    console.error('Error creating treatment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const result = await pool.query('SELECT * FROM treatments WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching treatment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { name, slug, sort_order } = req.body;
    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (name !== undefined) { updates.push(`name = $${i++}`); values.push(name); }
    if (slug !== undefined) { updates.push(`slug = $${i++}`); values.push(slug); }
    if (sort_order !== undefined) { updates.push(`sort_order = $${i++}`); values.push(Number(sort_order)); }
    if (updates.length === 0) {
      const r = await pool.query('SELECT * FROM treatments WHERE id = $1', [req.params.id]);
      if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.json(r.rows[0]);
    }
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE treatments SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating treatment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const result = await pool.query('DELETE FROM treatments WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting treatment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
