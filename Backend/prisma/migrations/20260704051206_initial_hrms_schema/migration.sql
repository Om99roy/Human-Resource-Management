/*
  Warnings:

  - You are about to drop the column `deduction` on the `Payroll` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `LeaveRequest` MODIFY `leaveType` ENUM('CASUAL', 'SICK', 'PAID', 'UNPAID') NOT NULL;

-- AlterTable
ALTER TABLE `Payroll` DROP COLUMN `deduction`,
    ADD COLUMN `deductions` DECIMAL(10, 2) NOT NULL DEFAULT 0;
