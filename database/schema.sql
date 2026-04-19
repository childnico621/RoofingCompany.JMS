-- 4.1 Schema Design

-- Create the schema for the Jobs module.
CREATE SCHEMA IF NOT EXISTS jobs;

-- jobs table: id (UUID, PK), title, description, status (text enum), 
-- street, city, state, zip_code, latitude, longitude (owned value object),
-- scheduled_date, assignee_id (FK), customer_id (FK), organization_id (tenant),
-- created_at, updated_at
CREATE TABLE jobs.jobs (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    assignee_id UUID,
    customer_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- job_photos table: id (UUID, PK), job_id (FK), url, captured_at, caption
CREATE TABLE jobs.job_photos (
    id UUID PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs.jobs(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- outbox_messages table: id, type, content (jsonb), occurred_on, processed_on
CREATE TABLE jobs.outbox_messages (
    id UUID PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    occurred_on_utc TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_on_utc TIMESTAMP WITH TIME ZONE,
    error TEXT
);

-- Indexes for performance and isolation
-- Multi-tenant queries (organization_id)
CREATE INDEX idx_jobs_organization_id ON jobs.jobs(organization_id);

-- Status-based filtering
CREATE INDEX idx_jobs_status ON jobs.jobs(status);

-- Date range queries
CREATE INDEX idx_jobs_scheduled_date ON jobs.jobs(scheduled_date);

-- Composite index for the most common search pattern
CREATE INDEX idx_jobs_tenant_status_date ON jobs.jobs(organization_id, status, scheduled_date);

-- Full-text search on title + description
-- Using a GIN index on a generated tsvector column for better performance
ALTER TABLE jobs.jobs ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || description)
) STORED;

CREATE INDEX idx_jobs_search_vector ON jobs.jobs USING GIN(search_vector);

--------------------------------------------------------------------------------
-- 4.2 Query Optimization

-- Optimized search query with:
-- - Full-text search
-- - Filter by status (multiple)
-- - Filter by date range
-- - Cursor-based pagination (using id for stability)
-- - Photo count per job

/*
  Explain your indexing strategy:
  We use a composite index (organization_id, status, scheduled_date) to narrow down results quickly for a specific tenant.
  The GIN index on search_vector allows efficient full-text searching.
  Cursor-based pagination (WHERE id > last_id) is preferred over OFFSET because OFFSET performance degrades linearly 
  with the number of records as the database still has to scan all skipped rows. 
  Cursor-based pagination provides constant-time performance and avoids "missing items" issues when rows are added/deleted.
*/

-- Example query for tenant '00000000-0000-0000-0000-000000000001'
-- Status: 'InProgress', 'Scheduled'
-- Date range: '2026-01-01' to '2026-12-31'
-- Cursor: last seen id '00000000-0000-0000-0000-000000000000'
SELECT 
    j.id, 
    j.title, 
    j.status, 
    j.scheduled_date,
    (SELECT COUNT(*) FROM jobs.job_photos jp WHERE jp.job_id = j.id) as photo_count
FROM jobs.jobs j
WHERE j.organization_id = '00000000-0000-0000-0000-000000000001'
  AND j.status IN ('InProgress', 'Scheduled')
  AND j.scheduled_date >= '2026-01-01T00:00:00Z'
  AND j.scheduled_date <= '2026-12-31T23:59:59Z'
  -- Full-text search example
  -- AND j.search_vector @@ to_tsquery('english', 'roofing & repair')
  -- Cursor-based pagination
  AND j.id > '00000000-0000-0000-0000-000000000000'
ORDER BY j.id ASC
LIMIT 10;
