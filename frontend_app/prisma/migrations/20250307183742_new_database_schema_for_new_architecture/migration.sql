/*
  Warnings:

  - The primary key for the `Admins` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `wallet_address` on the `Admins` table. All the data in the column will be lost.
  - You are about to drop the column `user_wallet` on the `RegisteredUsers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `RegisteredUsers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `ArbitrumWallets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admins" DROP CONSTRAINT "Admins_pkey",
DROP COLUMN "wallet_address",
ADD COLUMN     "user_id" TEXT NOT NULL DEFAULT '',
ADD CONSTRAINT "Admins_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "ArbitrumWallets" ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
CREATE SEQUENCE interations_id_seq;
ALTER TABLE "Interations" ALTER COLUMN "id" SET DEFAULT nextval('interations_id_seq');
ALTER SEQUENCE interations_id_seq OWNED BY "Interations"."id";

-- AlterTable
ALTER TABLE "RegisteredUsers" DROP COLUMN "user_wallet",
ADD COLUMN     "user_id" TEXT;

-- AlterTable
CREATE SEQUENCE walletinteraction_id_seq;
ALTER TABLE "WalletInteraction" ALTER COLUMN "id" SET DEFAULT nextval('walletinteraction_id_seq');
ALTER SEQUENCE walletinteraction_id_seq OWNED BY "WalletInteraction"."id";

-- CreateIndex
CREATE UNIQUE INDEX "RegisteredUsers_user_id_key" ON "RegisteredUsers"("user_id");
