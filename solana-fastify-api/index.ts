import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from 'dotenv';
import { PublicKey } from '@solana/web3.js';
import { SolanaAgentKit, createSolanaTools } from './solana-agent-kit-main/src/index';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

// Load environment variables
config();

// Define the type for our agent instance
type AgentWithUI = {
  isUiMode: boolean;
  wallet_address: PublicKey;
  onSignTransaction: (tx: string) => Promise<string>;
} & SolanaAgentKit;

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
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
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
    
    // Create agent with config object
    const agent = new SolanaAgentKit(
      wallet,  // Pass wallet address as the first param (which is private_key param)
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      { 
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || "" 
      },
      true // Pass true for isUiMode
    ) as AgentWithUI;
    
    // Set UI mode properties after creation
    agent.wallet_address = new PublicKey(wallet); // This can remain to ensure wallet_address is set if not passed via constructor in UI mode
    agent.onSignTransaction = async (tx: string) => {
      fastify.log.info(`Transaction created: ${tx}`);
      reply.send({
        text: 'Transaction created successfully',
        transaction: tx,
        audio: null,
        op: 'solana'
      });
      return tx;
    };

    // Use the imported createSolanaTools function instead of the custom one
    const tools = createSolanaTools(agent);
    const reactAgent = await createAgent(
      { modelName: 'gpt-4o-mini', temperature: 0.5 },
      tools,
      `You are a helpful agent that can answer questions about the blockchain.
      If an user asks you a questions about outside of Solana chain,
      you must tell them mobile app only supports Solana chain.`,
      false
    );

    let finalAgentOutput = ""; // Use a new variable for clarity
    const stream = await reactAgent.stream(
      { input: message },
      { configurable: { thread_id: 'Frontend Agent' } },
    );

    for await (const chunk of stream) {
      // Log the entire chunk to understand its structure, this is very helpful for debugging
      fastify.log.info(`STREAM CHUNK: ${JSON.stringify(chunk)}`);

      // The final output from an agent (AgentFinish) is often in agent.returnValues.output
      if (chunk.agent && chunk.agent.returnValues && typeof chunk.agent.returnValues.output === 'string') {
        finalAgentOutput = chunk.agent.returnValues.output;
      }
      // Sometimes, the AgentExecutor might yield a final chunk with the output directly
      else if (chunk && typeof chunk.output === 'string') {
        finalAgentOutput = chunk.output;
      }
      // If the chunk contains AIMessages (especially if the LLM part was streaming, though it's false here)
      // the last AI message content could be a candidate, but returnValues.output or chunk.output are usually more definitive for final agent output.
      else if (chunk.messages && Array.isArray(chunk.messages)) {
        const lastMessage = chunk.messages[chunk.messages.length - 1];
        if (lastMessage && lastMessage._getType && lastMessage._getType() === 'ai' && typeof lastMessage.content === 'string') {
          // This will be overridden if a more definitive output (from returnValues or chunk.output) is found.
          finalAgentOutput = lastMessage.content; 
        }
      }
    }

    fastify.log.info(`Final determined agent output: ${finalAgentOutput}`);
    return reply.send({ text: finalAgentOutput });
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