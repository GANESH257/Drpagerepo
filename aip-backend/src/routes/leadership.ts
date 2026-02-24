import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

export interface BoardDirector {
  id: string;
  full_name: string;
  role: string;
  sort_order: number;
}

export interface BoardOfDirectorsResponse {
  introText: string;
  bylawsUrl: string;
  directors: { fullName: string; role: string }[];
}

/**
 * GET /api/leadership/board
 * Returns Board of Directors intro text, bylaws link, and director list (for Leadership & Committees page).
 */
router.get('/board', authenticateToken, async (_req: AuthRequest, res: express.Response) => {
  try {
    const boardResult = await pool.query(
      `SELECT id, intro_text, bylaws_url FROM board_of_directors ORDER BY updated_at DESC LIMIT 1`
    );
    if (boardResult.rows.length === 0) {
      return res.json({
        introText: '',
        bylawsUrl: '/policies/governance-bylaws.pdf',
        directors: [],
      } as BoardOfDirectorsResponse);
    }
    const board = boardResult.rows[0];
    const directorsResult = await pool.query(
      `SELECT id, full_name, role, sort_order FROM board_directors WHERE board_id = $1 ORDER BY sort_order ASC, full_name ASC`,
      [board.id]
    );
    const directors = (directorsResult.rows as BoardDirector[]).map((d) => ({
      fullName: d.full_name,
      role: d.role,
    }));
    res.json({
      introText: board.intro_text || '',
      bylawsUrl: board.bylaws_url || '/policies/governance-bylaws.pdf',
      directors,
    } as BoardOfDirectorsResponse);
  } catch (error) {
    console.error('Error fetching board of directors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
