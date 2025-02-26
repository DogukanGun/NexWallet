/*
  Warnings:

  - Added the required column `keyShare` to the `CDPWallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CDPWallet" ADD COLUMN     "keyShare" TEXT NOT NULL;
