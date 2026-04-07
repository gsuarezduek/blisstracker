ALTER TABLE "Project"
  ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  ADD COLUMN "linksEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "situationEnabled" BOOLEAN NOT NULL DEFAULT true;
