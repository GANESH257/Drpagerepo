-- Migration 008: Board of Directors (Leadership page - API-driven)
-- Single config row + director list; no dependency on doctors table.

CREATE TABLE IF NOT EXISTS board_of_directors (
    id VARCHAR(50) PRIMARY KEY,
    intro_text TEXT NOT NULL,
    bylaws_url VARCHAR(500) NOT NULL DEFAULT '/policies/governance-bylaws.pdf',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS board_directors (
    id VARCHAR(50) PRIMARY KEY,
    board_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(150) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (board_id) REFERENCES board_of_directors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_board_directors_board_id ON board_directors(board_id);

-- Seed single row and first Board of Directors
INSERT INTO board_of_directors (id, intro_text, bylaws_url, updated_at)
VALUES (
    'board-001',
    'The Board of Directors shall be self-perpetuating and shall consist of licensed medical doctors. The first Board of Directors shall consist of the following Directors:',
    '/policies/governance-bylaws.pdf',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Seed directors (use fixed IDs so we can run migration idempotently)
INSERT INTO board_directors (id, board_id, full_name, role, sort_order, created_at)
VALUES
    ('bd-001', 'board-001', 'Robert Hacker, M.D.', 'President', 1, NOW()),
    ('bd-002', 'board-001', 'George Mansour, M.D.', 'Treasurer', 2, NOW()),
    ('bd-003', 'board-001', 'Hashim Raza, M.D.', 'Secretary', 3, NOW()),
    ('bd-004', 'board-001', 'Scott Hardeman, M.D.', 'Member-at-Large', 4, NOW()),
    ('bd-005', 'board-001', 'Amit Bhandarkar, M.D.', 'Member-at-Large', 5, NOW())
ON CONFLICT (id) DO NOTHING;
