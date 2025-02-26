-- CreateTable
CREATE TABLE "ArbitrumWallets" (
    "id" SERIAL NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ArbitrumWallets_pkey" PRIMARY KEY ("id")
);
