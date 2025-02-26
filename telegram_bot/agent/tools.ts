import { SolanaTool } from './solanaTool';
import { DefineAgentTool } from './defineAgentTool';
import { GetActiveAgentsTool } from './getActiveAgentsTool';
import { AgentSettingsTool } from './agentSetingsTool';
import { GetWalletTool } from './getWallet';
import { CdpAgentTool } from './cdpAgentTool';
// Export the tools
export const getTools = (chatId: string) => [
  new SolanaTool(chatId),
  new DefineAgentTool(chatId),
  new GetActiveAgentsTool(chatId),
  new AgentSettingsTool(chatId),
  new GetWalletTool(chatId),
  new CdpAgentTool(chatId),
]; 