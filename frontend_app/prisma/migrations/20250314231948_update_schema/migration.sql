/*
  Warnings:

  - You are about to drop the `_AgentsToChains` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AgentsToKnowledgeBases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AgentsToLlmProviders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AgentsToChains" DROP CONSTRAINT "_AgentsToChains_A_fkey";

-- DropForeignKey
ALTER TABLE "_AgentsToChains" DROP CONSTRAINT "_AgentsToChains_B_fkey";

-- DropForeignKey
ALTER TABLE "_AgentsToKnowledgeBases" DROP CONSTRAINT "_AgentsToKnowledgeBases_A_fkey";

-- DropForeignKey
ALTER TABLE "_AgentsToKnowledgeBases" DROP CONSTRAINT "_AgentsToKnowledgeBases_B_fkey";

-- DropForeignKey
ALTER TABLE "_AgentsToLlmProviders" DROP CONSTRAINT "_AgentsToLlmProviders_A_fkey";

-- DropForeignKey
ALTER TABLE "_AgentsToLlmProviders" DROP CONSTRAINT "_AgentsToLlmProviders_B_fkey";

-- DropTable
DROP TABLE "_AgentsToChains";

-- DropTable
DROP TABLE "_AgentsToKnowledgeBases";

-- DropTable
DROP TABLE "_AgentsToLlmProviders";

-- CreateTable
CREATE TABLE "_ChainAgents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChainAgents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProviderAgents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProviderAgents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_KnowledgeBaseAgents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_KnowledgeBaseAgents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChainAgents_B_index" ON "_ChainAgents"("B");

-- CreateIndex
CREATE INDEX "_ProviderAgents_B_index" ON "_ProviderAgents"("B");

-- CreateIndex
CREATE INDEX "_KnowledgeBaseAgents_B_index" ON "_KnowledgeBaseAgents"("B");

-- AddForeignKey
ALTER TABLE "_ChainAgents" ADD CONSTRAINT "_ChainAgents_A_fkey" FOREIGN KEY ("A") REFERENCES "Agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChainAgents" ADD CONSTRAINT "_ChainAgents_B_fkey" FOREIGN KEY ("B") REFERENCES "Chains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProviderAgents" ADD CONSTRAINT "_ProviderAgents_A_fkey" FOREIGN KEY ("A") REFERENCES "Agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProviderAgents" ADD CONSTRAINT "_ProviderAgents_B_fkey" FOREIGN KEY ("B") REFERENCES "LlmProviders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KnowledgeBaseAgents" ADD CONSTRAINT "_KnowledgeBaseAgents_A_fkey" FOREIGN KEY ("A") REFERENCES "Agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KnowledgeBaseAgents" ADD CONSTRAINT "_KnowledgeBaseAgents_B_fkey" FOREIGN KEY ("B") REFERENCES "KnowledgeBases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
