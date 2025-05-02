/*
  Warnings:

  - You are about to drop the `ArbitrumWallets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ArbitrumWallets";

-- CreateTable
CREATE TABLE "BaseWallets" (
    "id" SERIAL NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "mnemonic" TEXT,

    CONSTRAINT "BaseWallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BaseWallets_wallet_address_key" ON "BaseWallets"("wallet_address");
