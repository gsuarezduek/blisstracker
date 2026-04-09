CREATE TABLE "AiTokenLog" (
  "id"           SERIAL PRIMARY KEY,
  "service"      TEXT NOT NULL,
  "userId"       INTEGER,
  "inputTokens"  INTEGER NOT NULL DEFAULT 0,
  "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "AiTokenLog_createdAt_idx" ON "AiTokenLog"("createdAt");

ALTER TABLE "Project" ADD COLUMN "aiWeeklyTokenLimit" INTEGER NOT NULL DEFAULT 500000;
