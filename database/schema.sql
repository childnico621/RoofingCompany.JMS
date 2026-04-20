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

--------------------------------------------------------------------------------
-- Seed Data
-- Adding one job for each status for demonstration purposes

INSERT INTO jobs.jobs (id, title, description, status, street, city, state, zip_code, latitude, longitude, scheduled_date, customer_id, organization_id)
VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d470', 'Roof Inspection - Central Park', 'Initial assessment of the north wing roof structure.', 'Draft', '123 Central Park S', 'New York', 'NY', '10019', 40.7651, -73.9776, NULL, '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
('f47ac10b-58cc-4372-a567-0e02b2c3d471', 'Emergency Patch - Brooklyn', 'Repairing urgent leak after yesterday storm.', 'Scheduled', '456 Atlantic Ave', 'Brooklyn', 'NY', '11217', 40.6847, -73.9845, '2026-05-01T09:00:00Z', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
('f47ac10b-58cc-4372-a567-0e02b2c3d472', 'Full Replacement - Queens', 'Complete shingle replacement for the main residential building.', 'InProgress', '789 Broadway', 'Long Island City', 'NY', '11106', 40.7615, -73.9255, '2026-04-15T08:30:00Z', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
('f47ac10b-58cc-4372-a567-0e02b2c3d473', 'Gutter Cleaning - Bronx', 'Annual maintenance and gutter cleanup.', 'Completed', '101 Grand Concourse', 'Bronx', 'NY', '10451', 40.8267, -73.9225, '2026-03-10T14:00:00Z', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
('f47ac10b-58cc-4372-a567-0e02b2c3d474', 'Shingle Repair - Staten Island', 'Minor repair on back side of the house. Cancelled due to client request.', 'Cancelled', '202 Victory Blvd', 'Staten Island', 'NY', '10301', 40.6300, -74.0800, '2026-04-20T11:00:00Z', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001');
