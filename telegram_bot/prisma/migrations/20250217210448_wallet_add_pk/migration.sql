/*
  Warnings:

  - Added the required column `publicKey` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "publicKey" TEXT NOT NULL;
