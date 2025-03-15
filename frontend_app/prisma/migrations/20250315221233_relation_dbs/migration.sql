-- CreateTable
CREATE TABLE "agent_chain" (
    "agentId" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,

    CONSTRAINT "agent_chain_pkey" PRIMARY KEY ("agentId","chainId")
);

-- AddForeignKey
ALTER TABLE "agent_chain" ADD CONSTRAINT "agent_chain_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_chain" ADD CONSTRAINT "agent_chain_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
