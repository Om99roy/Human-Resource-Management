/*
  Warnings:

  - You are about to drop the column `password` on the `Employee` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Employee` DROP COLUMN `password`,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `passwordHash` VARCHAR(191) NOT NULL,
    MODIFY `role` ENUM('ADMIN', 'EMPLOYEE', 'HR') NOT NULL DEFAULT 'EMPLOYEE';

-- CreateTable
CREATE TABLE `EmailVerification` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `EmailVerification_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmailVerification` ADD CONSTRAINT `EmailVerification_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Notification` RENAME INDEX `Notification_employeeId_fkey` TO `Notification_employeeId_idx`;

-- RenameIndex
ALTER TABLE `RefreshToken` RENAME INDEX `RefreshToken_employeeId_fkey` TO `RefreshToken_employeeId_idx`;
