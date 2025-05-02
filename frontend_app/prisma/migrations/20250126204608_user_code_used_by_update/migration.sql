/*
  Warnings:

  - Added the required column `used_by` to the `SpecialUserCodes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SpecialUserCodes" ADD COLUMN     "used_by" TEXT NOT NULL;
