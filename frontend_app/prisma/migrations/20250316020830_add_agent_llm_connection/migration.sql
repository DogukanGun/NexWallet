/*
  Warnings:

  - You are about to drop the `_ProviderAgents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProviderAgents" DROP CONSTRAINT "_ProviderAgents_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProviderAgents" DROP CONSTRAINT "_ProviderAgents_B_fkey";

-- DropTable
DROP TABLE "_ProviderAgents";

-- CreateTable
CREATE TABLE "agent_llm_provider" (
    "agent_id" TEXT NOT NULL,
    "llm_provider_id" TEXT NOT NULL,

    CONSTRAINT "agent_llm_provider_pkey" PRIMARY KEY ("agent_id","llm_provider_id")
);

-- CreateTable
CREATE TABLE "_AgentLlmProviders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AgentLlmProviders_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AgentLlmProviders_B_index" ON "_AgentLlmProviders"("B");

-- AddForeignKey
ALTER TABLE "agent_llm_provider" ADD CONSTRAINT "agent_llm_provider_llm_provider_id_fkey" FOREIGN KEY ("llm_provider_id") REFERENCES "LlmProviders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_llm_provider" ADD CONSTRAINT "agent_llm_provider_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "Agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentLlmProviders" ADD CONSTRAINT "_AgentLlmProviders_A_fkey" FOREIGN KEY ("A") REFERENCES "Agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentLlmProviders" ADD CONSTRAINT "_AgentLlmProviders_B_fkey" FOREIGN KEY ("B") REFERENCES "LlmProviders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
