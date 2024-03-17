-- AlterTable
ALTER TABLE `users` ADD COLUMN `isValidMail` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `isActive` BOOLEAN NOT NULL DEFAULT true;
