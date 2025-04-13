-- CreateTable
CREATE TABLE "agent_knowledge_base" (
    "agent_id" TEXT NOT NULL,
    "knowledge_base_id" TEXT NOT NULL,

    CONSTRAINT "agent_knowledge_base_pkey" PRIMARY KEY ("agent_id","knowledge_base_id")
);

-- AddForeignKey
ALTER TABLE "agent_knowledge_base" ADD CONSTRAINT "agent_knowledge_base_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "Agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_knowledge_base" ADD CONSTRAINT "agent_knowledge_base_knowledge_base_id_fkey" FOREIGN KEY ("knowledge_base_id") REFERENCES "KnowledgeBases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
