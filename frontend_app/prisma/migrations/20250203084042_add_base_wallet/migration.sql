-- CreateTable
CREATE TABLE "ArbitrumWallets" (
    "id" SERIAL NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "mnemonic" TEXT,

    CONSTRAINT "ArbitrumWallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArbitrumWallets_wallet_address_key" ON "ArbitrumWallets"("wallet_address");
