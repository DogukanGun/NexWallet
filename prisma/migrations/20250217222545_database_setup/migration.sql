-- CreateTable
CREATE TABLE "Chains" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isEmbedded" BOOLEAN NOT NULL DEFAULT false,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT NOT NULL,

    CONSTRAINT "Chains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LlmProviders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LlmProviders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "KnowledgeBases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isOnPointSystem" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentPoints" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "AgentPoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AgentsToChains" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AgentsToChains_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AgentsToLlmProviders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AgentsToLlmProviders_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AgentsToKnowledgeBases" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AgentsToKnowledgeBases_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AgentsToChains_B_index" ON "_AgentsToChains"("B");

-- CreateIndex
CREATE INDEX "_AgentsToLlmProviders_B_index" ON "_AgentsToLlmProviders"("B");

-- CreateIndex
CREATE INDEX "_AgentsToKnowledgeBases_B_index" ON "_AgentsToKnowledgeBases"("B");

-- AddForeignKey
ALTER TABLE "AgentPoints" ADD CONSTRAINT "AgentPoints_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentsToChains" ADD CONSTRAINT "_AgentsToChains_A_fkey" FOREIGN KEY ("A") REFERENCES "Agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentsToChains" ADD CONSTRAINT "_AgentsToChains_B_fkey" FOREIGN KEY ("B") REFERENCES "Chains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentsToLlmProviders" ADD CONSTRAINT "_AgentsToLlmProviders_A_fkey" FOREIGN KEY ("A") REFERENCES "Agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentsToLlmProviders" ADD CONSTRAINT "_AgentsToLlmProviders_B_fkey" FOREIGN KEY ("B") REFERENCES "LlmProviders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentsToKnowledgeBases" ADD CONSTRAINT "_AgentsToKnowledgeBases_A_fkey" FOREIGN KEY ("A") REFERENCES "Agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentsToKnowledgeBases" ADD CONSTRAINT "_AgentsToKnowledgeBases_B_fkey" FOREIGN KEY ("B") REFERENCES "KnowledgeBases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
