/*
  Warnings:

  - You are about to drop the column `transactionHash` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `userWallet` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transaction_hash]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transaction_hash` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_wallet` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Transaction_transactionHash_key";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "transactionHash",
DROP COLUMN "userWallet",
ADD COLUMN     "transaction_hash" TEXT NOT NULL,
ADD COLUMN     "user_wallet" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RegisteredUsers" (
    "id" SERIAL NOT NULL,
    "user_wallet" TEXT NOT NULL,

    CONSTRAINT "RegisteredUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialUserCodes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SpecialUserCodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transaction_hash_key" ON "Transaction"("transaction_hash");
