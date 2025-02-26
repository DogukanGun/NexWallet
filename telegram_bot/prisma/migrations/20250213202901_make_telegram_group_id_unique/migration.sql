/*
  Warnings:

  - A unique constraint covering the columns `[chatId]` on the table `TelegramGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TelegramGroup_chatId_key" ON "TelegramGroup"("chatId");
