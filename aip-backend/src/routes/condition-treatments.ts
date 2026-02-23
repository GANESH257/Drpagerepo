import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

function requireAdmin(req: AuthRequest, res: express.Response): boolean {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return false;
  }
  return true;
}

router.use(authenticateToken);

/** GET /api/condition-treatments?condition_id= & treatment_id= - List links (optional filters) */
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { condition_id, treatment_id } = req.query;
    let query = `
      SELECT ct.condition_id, ct.treatment_id, c.name as condition_name, t.name as treatment_name
      FROM condition_treatments ct
      JOIN conditions c ON c.id = ct.condition_id
      JOIN treatments t ON t.id = ct.treatment_id
    `;
    const params: string[] = [];
    const conditions: string[] = [];
    if (condition_id) { conditions.push(`ct.condition_id = $${params.length + 1}`); params.push(condition_id as string); }
    if (treatment_id) { conditions.push(`ct.treatment_id = $${params.length + 1}`); params.push(treatment_id as string); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY c.name, t.name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching condition-treatments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** POST /api/condition-treatments - Link condition to treatment. Body: { condition_id, treatment_id } */
router.post('/', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { condition_id, treatment_id } = req.body;
    if (!condition_id || !treatment_id) return res.status(400).json({ error: 'condition_id and treatment_id required' });
    await pool.query(
      `INSERT INTO condition_treatments (condition_id, treatment_id) VALUES ($1, $2)
       ON CONFLICT (condition_id, treatment_id) DO NOTHING`,
      [condition_id, treatment_id]
    );
    const row = await pool.query(
      `SELECT ct.*, c.name as condition_name, t.name as treatment_name
       FROM condition_treatments ct
       JOIN conditions c ON c.id = ct.condition_id JOIN treatments t ON t.id = ct.treatment_id
       WHERE ct.condition_id = $1 AND ct.treatment_id = $2`,
      [condition_id, treatment_id]
    );
    if (row.rows.length === 0) return res.status(500).json({ error: 'Failed to read back' });
    res.status(201).json(row.rows[0]);
  } catch (error) {
    console.error('Error linking condition-treatment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** DELETE /api/condition-treatments/:conditionId/:treatmentId - Unlink */
router.delete('/:conditionId/:treatmentId', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const result = await pool.query(
      'DELETE FROM condition_treatments WHERE condition_id = $1 AND treatment_id = $2 RETURNING condition_id',
      [req.params.conditionId, req.params.treatmentId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Link not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error unlinking condition-treatment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
