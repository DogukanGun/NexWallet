/*
  Warnings:

  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `Agents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Agents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agents" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Transaction";

-- CreateTable
CREATE TABLE "Transactions" (
    "id" SERIAL NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    "user_wallet" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWallet" (
    "id" SERIAL NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "UserWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwitterUsers" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TwitterUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_transaction_hash_key" ON "Transactions"("transaction_hash");

-- CreateIndex
CREATE UNIQUE INDEX "UserWallet_wallet_address_key" ON "UserWallet"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "TwitterUsers_user_id_key" ON "TwitterUsers"("user_id");

-- AddForeignKey
ALTER TABLE "Agents" ADD CONSTRAINT "Agents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "TwitterUsers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
