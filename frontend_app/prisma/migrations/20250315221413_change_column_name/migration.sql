/*
  Warnings:

  - The primary key for the `agent_chain` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `agentId` on the `agent_chain` table. All the data in the column will be lost.
  - You are about to drop the column `chainId` on the `agent_chain` table. All the data in the column will be lost.
  - Added the required column `agent_id` to the `agent_chain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chain_id` to the `agent_chain` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "agent_chain" DROP CONSTRAINT "agent_chain_agentId_fkey";

-- DropForeignKey
ALTER TABLE "agent_chain" DROP CONSTRAINT "agent_chain_chainId_fkey";

-- AlterTable
ALTER TABLE "agent_chain" DROP CONSTRAINT "agent_chain_pkey",
DROP COLUMN "agentId",
DROP COLUMN "chainId",
ADD COLUMN     "agent_id" TEXT NOT NULL,
ADD COLUMN     "chain_id" TEXT NOT NULL,
ADD CONSTRAINT "agent_chain_pkey" PRIMARY KEY ("agent_id", "chain_id");

-- AddForeignKey
ALTER TABLE "agent_chain" ADD CONSTRAINT "agent_chain_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "Agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_chain" ADD CONSTRAINT "agent_chain_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
