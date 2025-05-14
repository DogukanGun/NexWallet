import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from 'dotenv';
import { SolanaAgentKit,createSolanaTools } from './solana-agent-kit/index';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Load environment variables
config();

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register CORS
fastify.register(cors, {
  origin: true,
});

// Create a helper function similar to createAgent
const createAgent = async (
  llmOptions: { modelName: string; temperature: number },
  tools: any[],
  systemPrompt: string,
  streaming = true
) => {
  const llm = new ChatOpenAI({
    modelName: llmOptions.modelName,
    temperature: llmOptions.temperature,
    streaming,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", "{input}"]
  ]);

  const agent = await createOpenAIToolsAgent({
    llm,
    tools,
    prompt,
  });

  return AgentExecutor.fromAgentAndTools({
    agent,
    tools,
  });
};

// Mobile Solana API endpoint
fastify.post('/api/mobile-solana', async (request, reply) => {
  const { message, wallet } = request.body as { message: string; wallet: string };

  if (!message || typeof message !== 'string') {
    return reply.status(400).send({ 
      error: 'Message is required and should be a string.' 
    });
  }
  
  if (!wallet || typeof wallet !== 'string') {
    return reply.status(400).send({ 
      error: 'Wallet address is required and should be a string.' 
    });
  }
  
  try {
    fastify.log.info(`Mobile Solana API request: ${message} for wallet ${wallet}`);
    
    const agent = new SolanaAgentKit(
      wallet, 
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com', 
      { OPENAI_API_KEY: process.env.OPENAI_API_KEY }
    );
    
    agent.isUiMode = true;
    agent.onSignTransaction = async (transaction) => {
      fastify.log.info(`Transaction created: ${transaction}`);
      reply.send({
        text: 'Transaction created successfully',
        transaction: transaction,
        audio: null,
        op: 'solana'
      });
      return transaction;
    };

    const tools = createSolanaTools(agent);
    const reactAgent = await createAgent(
      { modelName: 'gpt-4o-mini', temperature: 0.5 },
      tools,
      `You are a helpful agent that can answer questions about the blockchain.
      If an user asks you a questions about outside of Solana chain,
      you must tell them mobile app only supports Solana chain.`,
      false
    );

    let response = '';
    const stream = await reactAgent.stream(
      { messages: [new HumanMessage(message)] },
      { configurable: { thread_id: 'Frontend Agent' } },
    );

    for await (const chunk of stream) {
      if ('agent' in chunk) {
        fastify.log.info(`Agent response: ${JSON.stringify(chunk.agent.messages)}`);
        response = chunk.agent.messages[0].content;
      }
    }

    return reply.send({ text: response });
  } catch (error: any) {
    fastify.log.error(`Error in Mobile Solana API: ${error}`);
    return reply.status(500).send({ 
      error: 'An error occurred while processing your request',
      text: error instanceof Error ? error.message : 'Unknown error',
      success: false
    });
  }
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ 
      port: parseInt(process.env.PORT || '8004', 10), 
      host: '0.0.0.0' 
    });
    console.log(`Server is running at http://localhost:${process.env.PORT || 8004}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 