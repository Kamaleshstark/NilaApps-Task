/*
  # Adaptive Learning Path Builder - Initial Schema

  ## Overview
  Creates the core tables for storing available content components and saved learning paths.

  ## New Tables

  ### components
  Stores available content items shown in the left-panel drag area.
  - id (text, primary key) — matches the component IDs from the API contract
  - title (text) — display name
  - short_description (text) — one/two-line supporting text
  - type (text) — enum: 'unit' | 'assessment'
  - approximate_duration_minutes (integer) — shown in UI
  - metadata (jsonb) — optional nested assessment/unit metadata

  ### learning_paths
  Stores saved learning path graphs (nodes + edges + canvas state).
  - id (text, primary key) — slug-style identifier
  - name (text) — display name
  - description (text) — optional summary
  - status (text) — enum: 'draft' | 'published'
  - version (integer) — incremented on each save
  - canvas (jsonb) — zoom/offset viewport state
  - nodes (jsonb) — array of node objects
  - edges (jsonb) — array of edge objects with conditional rules
  - created_at / updated_at — timestamps

  ## Security
  - RLS enabled on both tables
  - Public SELECT on components (read-only catalog data)
  - Authenticated CRUD on learning_paths
*/

-- Components catalog table
CREATE TABLE IF NOT EXISTS components (
  id text PRIMARY KEY,
  title text NOT NULL,
  short_description text NOT NULL,
  type text NOT NULL CHECK (type IN ('unit', 'assessment')),
  approximate_duration_minutes integer NOT NULL CHECK (approximate_duration_minutes >= 1),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read components"
  ON components FOR SELECT
  TO anon, authenticated
  USING (true);

-- Learning paths table
CREATE TABLE IF NOT EXISTS learning_paths (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  canvas jsonb DEFAULT '{"zoom":1,"offsetX":0,"offsetY":0}'::jsonb,
  nodes jsonb NOT NULL DEFAULT '[]'::jsonb,
  edges jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read learning paths"
  ON learning_paths FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert learning paths"
  ON learning_paths FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update learning paths"
  ON learning_paths FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Seed the components table with the example data
INSERT INTO components (id, title, short_description, type, approximate_duration_minutes, metadata)
VALUES
  (
    'cmp-assess-math-1',
    'Math Module 1 Assessment',
    'Baseline math diagnostic used to route learners.',
    'assessment',
    35,
    '{"assessment":{"maxScore":100,"passingScore":50}}'::jsonb
  ),
  (
    'cmp-unit-math-2-easy',
    'Math Module 2 - Easy',
    'Foundational math remediation unit for learners scoring below 50%.',
    'unit',
    35,
    '{"unit":{"recommendedMinutes":30}}'::jsonb
  ),
  (
    'cmp-unit-math-2-advanced',
    'Math Module 2 - Advanced',
    'Advanced math module for high-performing learners.',
    'unit',
    40,
    '{"unit":{"recommendedMinutes":35}}'::jsonb
  ),
  (
    'cmp-assess-reading-1',
    'Reading & Comp Module 1 Assessment',
    'Baseline reading comprehension diagnostic to route learners.',
    'assessment',
    32,
    '{"assessment":{"maxScore":100,"passingScore":60}}'::jsonb
  ),
  (
    'cmp-unit-rc-2-easy',
    'R&C Module 2 - Easy',
    'Foundational reading and comprehension unit for developing readers.',
    'unit',
    32,
    '{"unit":{"recommendedMinutes":25}}'::jsonb
  ),
  (
    'cmp-unit-rc-2-advanced',
    'R&C Module 2 - Advanced',
    'Advanced reading and comprehension for proficient learners.',
    'unit',
    32,
    '{"unit":{"recommendedMinutes":28}}'::jsonb
  ),
  (
    'cmp-assess-final',
    'Complete Assessment',
    'Final comprehensive assessment covering all learning path objectives.',
    'assessment',
    60,
    '{"assessment":{"maxScore":200,"passingScore":120}}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
