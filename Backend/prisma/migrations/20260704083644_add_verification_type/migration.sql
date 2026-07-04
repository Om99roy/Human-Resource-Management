/*
  Warnings:

  - Added the required column `type` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `EmailVerification` ADD COLUMN `type` ENUM('EMAIL_VERIFY', 'PASSWORD_RESET') NOT NULL;

-- CreateIndex
CREATE INDEX `EmailVerification_token_idx` ON `EmailVerification`(`token`);

-- RenameIndex
ALTER TABLE `EmailVerification` RENAME INDEX `EmailVerification_employeeId_fkey` TO `EmailVerification_employeeId_idx`;
