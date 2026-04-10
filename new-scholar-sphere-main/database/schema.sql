-- ================================================================
-- SCHOLAR SPHERE DATABASE SCHEMA (CODE-ALIGNED, IDEMPOTENT)
-- ================================================================
-- This schema supports both:
-- 1) Current production flow (lookups, auth, evaluations, repository, authors API)
-- 2) Legacy/compat routes still mounted in app.main (research/papers/outputs/presentations)

-- ==========================================
-- 1) INFRASTRUCTURE & LOOKUP TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS campuses (
    campus_id SERIAL PRIMARY KEY,
    campus_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS colleges (
    college_id SERIAL PRIMARY KEY,
    campus_id INTEGER NOT NULL REFERENCES campuses(campus_id) ON DELETE CASCADE,
    college_name VARCHAR(255) NOT NULL,
    is_graduate BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    department_id SERIAL PRIMARY KEY,
    college_id INTEGER NOT NULL REFERENCES colleges(college_id) ON DELETE CASCADE,
    department_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS school_years (
    school_year_id SERIAL PRIMARY KEY,
    year_label VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS school_semesters (
    school_semester_id SERIAL PRIMARY KEY,
    semester_label VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (role_name)
VALUES ('student'), ('faculty'), ('admin'), ('reviewer'), ('guest')
ON CONFLICT (role_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS research_types (
    research_type_id SERIAL PRIMARY KEY,
    research_type_name VARCHAR(100),
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE research_types ADD COLUMN IF NOT EXISTS research_type_name VARCHAR(100);
ALTER TABLE research_types ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE research_types ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE research_types ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE research_types ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'research_types' AND column_name = 'id'
    ) THEN
        ALTER TABLE research_types ADD COLUMN id INTEGER GENERATED ALWAYS AS (research_type_id) STORED;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'research_types_name_unique'
    ) THEN
        ALTER TABLE research_types ADD CONSTRAINT research_types_name_unique UNIQUE (name);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'research_types_research_type_name_unique'
    ) THEN
        ALTER TABLE research_types ADD CONSTRAINT research_types_research_type_name_unique UNIQUE (research_type_name);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS research_output_types (
    output_type_id SERIAL PRIMARY KEY,
    output_type_name VARCHAR(100),
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE research_output_types ADD COLUMN IF NOT EXISTS output_type_name VARCHAR(100);
ALTER TABLE research_output_types ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE research_output_types ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE research_output_types ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE research_output_types ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'research_output_types' AND column_name = 'id'
    ) THEN
        ALTER TABLE research_output_types ADD COLUMN id INTEGER GENERATED ALWAYS AS (output_type_id) STORED;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'research_output_types_name_unique'
    ) THEN
        ALTER TABLE research_output_types ADD CONSTRAINT research_output_types_name_unique UNIQUE (name);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'research_output_types_output_type_name_unique'
    ) THEN
        ALTER TABLE research_output_types ADD CONSTRAINT research_output_types_output_type_name_unique UNIQUE (output_type_name);
    END IF;
END $$;

CREATE OR REPLACE FUNCTION sync_research_type_names()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.research_type_name IS NULL OR BTRIM(NEW.research_type_name) = '') AND NEW.name IS NOT NULL THEN
        NEW.research_type_name := NEW.name;
    END IF;
    IF (NEW.name IS NULL OR BTRIM(NEW.name) = '') AND NEW.research_type_name IS NOT NULL THEN
        NEW.name := NEW.research_type_name;
    END IF;
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_research_type_names ON research_types;
CREATE TRIGGER trg_sync_research_type_names
BEFORE INSERT OR UPDATE ON research_types
FOR EACH ROW
EXECUTE FUNCTION sync_research_type_names();

CREATE OR REPLACE FUNCTION sync_research_output_type_names()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.output_type_name IS NULL OR BTRIM(NEW.output_type_name) = '') AND NEW.name IS NOT NULL THEN
        NEW.output_type_name := NEW.name;
    END IF;
    IF (NEW.name IS NULL OR BTRIM(NEW.name) = '') AND NEW.output_type_name IS NOT NULL THEN
        NEW.name := NEW.output_type_name;
    END IF;
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_research_output_type_names ON research_output_types;
CREATE TRIGGER trg_sync_research_output_type_names
BEFORE INSERT OR UPDATE ON research_output_types
FOR EACH ROW
EXECUTE FUNCTION sync_research_output_type_names();

-- ==========================================
-- 2) USERS & AUTHENTICATION
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_initial VARCHAR(5),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    campus_id INTEGER REFERENCES campuses(campus_id),
    college_id INTEGER REFERENCES colleges(college_id),
    department_id INTEGER REFERENCES departments(department_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3) AUTHORS (SHARED BY AUTHORS API + LEGACY RESEARCH API)
-- ==========================================

CREATE TABLE IF NOT EXISTS authors (
    author_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    department_id INTEGER REFERENCES departments(department_id) ON DELETE SET NULL,
    author_name TEXT,
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE authors ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(department_id) ON DELETE SET NULL;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE authors ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);
ALTER TABLE authors ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE authors ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'authors' AND column_name = 'id'
    ) THEN
        ALTER TABLE authors ADD COLUMN id INTEGER GENERATED ALWAYS AS (author_id) STORED;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_authors_author_name_lower_unique
    ON authors (LOWER(author_name))
    WHERE author_name IS NOT NULL AND BTRIM(author_name) <> '';

CREATE OR REPLACE FUNCTION sync_authors_display_name()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.author_name IS NULL OR BTRIM(NEW.author_name) = '') THEN
        NEW.author_name := NULLIF(
            BTRIM(CONCAT_WS(' ', NEW.first_name, NEW.middle_name, NEW.last_name)),
            ''
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_authors_display_name ON authors;
CREATE TRIGGER trg_sync_authors_display_name
BEFORE INSERT OR UPDATE ON authors
FOR EACH ROW
EXECUTE FUNCTION sync_authors_display_name();

-- ==========================================
-- 4) WORKFLOW: RESEARCH EVALUATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS research_evaluations (
    evaluation_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    research_title TEXT NOT NULL,
    authors TEXT NOT NULL,
    school_year_id INTEGER REFERENCES school_years(school_year_id),
    semester VARCHAR(20) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Submitted',
    remarks TEXT,
    is_authorship_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_evaluation_form_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_full_paper_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_turnitin_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_grammarly_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_journal_info_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evaluation_files (
    file_id SERIAL PRIMARY KEY,
    evaluation_id INTEGER NOT NULL REFERENCES research_evaluations(evaluation_id) ON DELETE CASCADE,
    file_category VARCHAR(80) NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_evaluation_files_eval_category_unique
    ON evaluation_files (evaluation_id, file_category);

-- ==========================================
-- 5) WORKFLOW: RESEARCH REPOSITORY (CURRENT DASHBOARD FLOW)
-- ==========================================

CREATE TABLE IF NOT EXISTS research_repository (
    research_repository_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    research_type_id INTEGER REFERENCES research_types(research_type_id) ON DELETE SET NULL,
    output_type_id INTEGER REFERENCES research_output_types(output_type_id) ON DELETE SET NULL,
    department_id INTEGER REFERENCES departments(department_id) ON DELETE SET NULL,
    school_year_id INTEGER REFERENCES school_years(school_year_id) ON DELETE SET NULL,
    school_semester_id INTEGER REFERENCES school_semesters(school_semester_id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE research_repository ADD COLUMN IF NOT EXISTS authors TEXT;
ALTER TABLE research_repository ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS research_repository_presentation (
    presentation_id INTEGER PRIMARY KEY REFERENCES research_repository(research_repository_id) ON DELETE CASCADE,
    conference_name TEXT,
    presentation_date DATE,
    venue TEXT
);

CREATE TABLE IF NOT EXISTS research_repository_publication (
    publication_id INTEGER PRIMARY KEY REFERENCES research_repository(research_repository_id) ON DELETE CASCADE,
    journal_name TEXT,
    issn_isbn TEXT,
    volume_issue TEXT,
    doi_link TEXT
);

-- ==========================================
-- 6) LEGACY RESEARCH FLOW (ROUTERS STILL MOUNTED)
-- ==========================================

CREATE TABLE IF NOT EXISTS research_papers (
    id SERIAL PRIMARY KEY,
    research_type_id INTEGER REFERENCES research_types(research_type_id) ON DELETE SET NULL,
    research_output_type_id INTEGER REFERENCES research_output_types(output_type_id) ON DELETE SET NULL,
    school_year_id INTEGER REFERENCES school_years(school_year_id) ON DELETE SET NULL,
    semester_id INTEGER REFERENCES school_semesters(school_semester_id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    abstract TEXT,
    keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE research_papers ADD COLUMN IF NOT EXISTS abstract TEXT;
ALTER TABLE research_papers ADD COLUMN IF NOT EXISTS keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE research_papers ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE research_papers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE research_papers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS research_authors (
    paper_id INTEGER NOT NULL REFERENCES research_papers(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES authors(author_id) ON DELETE CASCADE,
    is_primary_author BOOLEAN NOT NULL DEFAULT FALSE,
    author_order INTEGER,
    PRIMARY KEY (paper_id, author_id)
);

CREATE INDEX IF NOT EXISTS idx_research_authors_paper_order
    ON research_authors (paper_id, author_order);

CREATE TABLE IF NOT EXISTS presentations (
    id SERIAL PRIMARY KEY,
    paper_id INTEGER NOT NULL REFERENCES research_papers(id) ON DELETE CASCADE,
    venue TEXT,
    conference_name TEXT,
    presentation_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_presentations_paper_unique ON presentations (paper_id);

CREATE TABLE IF NOT EXISTS publications (
    id SERIAL PRIMARY KEY,
    paper_id INTEGER NOT NULL REFERENCES research_papers(id) ON DELETE CASCADE,
    doi TEXT,
    manuscript_link TEXT,
    journal_publisher TEXT,
    volume TEXT,
    issue_number TEXT,
    page_number TEXT,
    publication_date DATE,
    indexing TEXT,
    cite_score DOUBLE PRECISION,
    impact_factor DOUBLE PRECISION,
    editorial_board TEXT,
    journal_website TEXT,
    apa_format TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_publications_paper_unique ON publications (paper_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_publications_doi_unique
    ON publications (doi)
    WHERE doi IS NOT NULL AND BTRIM(doi) <> '';

-- ==========================================
-- 7) LEGACY RESEARCH RECORDS TABLE (OPTIONAL BACKWARD SUPPORT)
-- ==========================================

CREATE TABLE IF NOT EXISTS research_records (
    record_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    school_year_id INTEGER REFERENCES school_years(school_year_id) ON DELETE SET NULL,
    semester VARCHAR(20) NOT NULL,
    research_title TEXT NOT NULL,
    authors TEXT NOT NULL,
    output_type_id INTEGER REFERENCES research_output_types(output_type_id) ON DELETE SET NULL,
    research_type_id INTEGER REFERENCES research_types(research_type_id) ON DELETE SET NULL,
    funding_source TEXT,
    remarks TEXT,
    file_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
