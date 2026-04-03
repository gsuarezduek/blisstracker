-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('COMPLETED', 'BLOCKED');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'COMPLETED';
