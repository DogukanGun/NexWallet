/*
  Warnings:

  - A unique constraint covering the columns `[wallet_address]` on the table `ArbitrumWallets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ArbitrumWallets_wallet_address_key" ON "ArbitrumWallets"("wallet_address");
