-- Tracking lookup normalization for Scholar Sphere
-- Safe to run multiple times.

BEGIN;

-- 1) Canonical lookup tables
CREATE TABLE IF NOT EXISTS status (
    status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS statuses_and_remarks (
    statuses_and_remarks_id SERIAL PRIMARY KEY,
    statuses_and_remarks_name VARCHAR(100) UNIQUE NOT NULL
);

-- 2) Ensure research_evaluations has required fields for tracking
ALTER TABLE research_evaluations
    ADD COLUMN IF NOT EXISTS status VARCHAR(100) NOT NULL DEFAULT 'Submitted',
    ADD COLUMN IF NOT EXISTS remarks TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 3) Seed status options (canonical)
INSERT INTO status (status_name)
VALUES
    ('Submitted'),
    ('Under Review'),
    ('For Revision'),
    ('Approved'),
    ('Rejected')
ON CONFLICT (status_name) DO NOTHING;

-- 4) Remove status-like values from statuses_and_remarks (case-insensitive)
DELETE FROM statuses_and_remarks sar
USING status s
WHERE lower(trim(sar.statuses_and_remarks_name)) = lower(trim(s.status_name));

-- 5) Seed statuses_and_remarks options (canonical)
INSERT INTO statuses_and_remarks (statuses_and_remarks_name)
VALUES
    ('Pending initial screening'),
    ('Awaiting reviewer assignment'),
    ('Requires minor revisions'),
    ('Requires major revisions'),
    ('Ready for final decision')
ON CONFLICT (statuses_and_remarks_name) DO NOTHING;

-- 6) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_status_name ON status (status_name);
CREATE INDEX IF NOT EXISTS idx_statuses_and_remarks_name ON statuses_and_remarks (statuses_and_remarks_name);

-- 7) Legacy cleanup (do not use legacy names anymore)
DROP TABLE IF EXISTS statuses_remarks;

COMMIT;

-- Verification queries
-- SELECT status_id, status_name FROM status ORDER BY status_name;
-- SELECT statuses_and_remarks_id, statuses_and_remarks_name FROM statuses_and_remarks ORDER BY statuses_and_remarks_name;
-- SELECT s.status_name AS overlapping_name
-- FROM status s
-- JOIN statuses_and_remarks sar
--   ON lower(trim(s.status_name)) = lower(trim(sar.statuses_and_remarks_name));
