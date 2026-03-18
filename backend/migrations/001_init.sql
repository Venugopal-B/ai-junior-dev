-- AI Junior Developer — Database Schema
-- Run: psql -U postgres -d ai_junior_dev -f 001_init.sql

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ─── Projects ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  primary_language VARCHAR(64) NOT NULL DEFAULT 'TypeScript',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- ─── Project Files ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_files (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name  VARCHAR(255) NOT NULL,
  file_path  VARCHAR(500) NOT NULL DEFAULT '/',
  content    TEXT NOT NULL DEFAULT '',
  language   VARCHAR(64) NOT NULL DEFAULT 'TypeScript',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);

-- ─── Analysis Runs ────────────────────────────────────────────────────────────
CREATE TYPE run_type   AS ENUM ('explain', 'analyze', 'generate-tests', 'suggest-fix');
CREATE TYPE run_status AS ENUM ('pending', 'running', 'success', 'failed');

CREATE TABLE IF NOT EXISTS analysis_runs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_id          UUID REFERENCES project_files(id) ON DELETE SET NULL,
  run_type         run_type   NOT NULL,
  input_summary    TEXT       NOT NULL DEFAULT '',
  output_summary   TEXT       NOT NULL DEFAULT '',
  raw_result_json  JSONB      NOT NULL DEFAULT '{}',
  status           run_status NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_runs_project_id ON analysis_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_file_id    ON analysis_runs(file_id);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_created_at ON analysis_runs(created_at DESC);

-- ─── Generated Tests ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS generated_tests (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_id    UUID NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  framework  VARCHAR(64)  NOT NULL DEFAULT 'Jest',
  content    TEXT         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_tests_file_id ON generated_tests(file_id);

-- ─── Fix Suggestions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fix_suggestions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_id        UUID NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
  title          VARCHAR(255) NOT NULL,
  explanation    TEXT         NOT NULL,
  original_code  TEXT         NOT NULL,
  suggested_code TEXT         NOT NULL,
  diff_text      TEXT         NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fix_suggestions_file_id ON fix_suggestions(file_id);

-- ─── Updated-at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at    BEFORE UPDATE ON users         FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_files_updated_at    BEFORE UPDATE ON project_files FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
