CREATE INDEX "WorkDay_userId_idx" ON "WorkDay"("userId");
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");
CREATE INDEX "Task_workDayId_idx" ON "Task"("workDayId");
