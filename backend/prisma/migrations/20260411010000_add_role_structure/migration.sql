ALTER TABLE "RoleExpectation"
  ADD COLUMN IF NOT EXISTS "expectedResults"             JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "operationalResponsibilities" JSONB NOT NULL DEFAULT '[]';
