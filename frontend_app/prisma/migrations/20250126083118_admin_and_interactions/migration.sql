-- CreateTable
CREATE TABLE "Admins" (
    "wallet_address" TEXT NOT NULL,

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("wallet_address")
);

-- CreateTable
CREATE TABLE "Interations" (
    "id" INTEGER NOT NULL,
    "user" TEXT NOT NULL,
    "page" TEXT NOT NULL,

    CONSTRAINT "Interations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletInteraction" (
    "id" INTEGER NOT NULL,
    "user" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WalletInteraction_pkey" PRIMARY KEY ("id")
);
