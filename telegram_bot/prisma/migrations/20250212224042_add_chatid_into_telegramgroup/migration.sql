/*
  Warnings:

  - Added the required column `chatId` to the `TelegramGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TelegramGroup" ADD COLUMN     "chatId" TEXT NOT NULL;
