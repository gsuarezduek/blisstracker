-- AlterEnum
ALTER TYPE "TaskStatus" ADD VALUE 'PAUSED';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "pausedAt" TIMESTAMP(3),
ADD COLUMN     "pausedMinutes" INTEGER NOT NULL DEFAULT 0;
