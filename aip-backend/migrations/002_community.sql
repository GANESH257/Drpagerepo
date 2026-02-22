-- Community: posts (questions) and comments (answers) by section (General + specialty)

CREATE TABLE IF NOT EXISTS community_posts (
    id VARCHAR(255) PRIMARY KEY,
    section VARCHAR(255) NOT NULL,
    author_type VARCHAR(50) NOT NULL,
    author_id VARCHAR(255) NOT NULL,
    author_display_name VARCHAR(500) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_section ON community_posts(section);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);

CREATE TABLE IF NOT EXISTS community_comments (
    id VARCHAR(255) PRIMARY KEY,
    post_id VARCHAR(255) NOT NULL,
    author_type VARCHAR(50) NOT NULL,
    author_id VARCHAR(255) NOT NULL,
    author_display_name VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_at ON community_comments(created_at ASC);
