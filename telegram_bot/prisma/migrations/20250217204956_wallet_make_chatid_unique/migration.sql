/*
  Warnings:

  - A unique constraint covering the columns `[chatId]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Wallet_chatId_key" ON "Wallet"("chatId");
