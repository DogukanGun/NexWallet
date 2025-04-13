import { ChatOpenAI } from "@langchain/openai";
import { createEigenTools } from "./tools";

export const createEigenAgent = () => {
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
    openAIApiKey: process.env.GRAPH_API_KEY,
  });

  const tools = createEigenTools(process.env.GRAPH_API_KEY!);

  return {
    model,
    tools
  };
}; 