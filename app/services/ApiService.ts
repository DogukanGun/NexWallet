import { Message } from "ai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { AppChain } from "../configurator/page";

type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};
type UserCodeType = {
  id: number;
  code: string;
  is_used: boolean;
  used_by: string;
};

// Define proper types instead of any
type ApiResponse<T> = {
  data: T;
  status: number;
  message?: string;
};

// Define response types based on your API endpoints
type UserCode = {
  id: number;
  code: string;
  is_used: boolean;
  used_by: string;
};

type AdminResponse = {
  token: string;
};

type ChatResponse = {
  text: string;
  audio?: string;
  op?: string;
};

type BotResponse = {
  text?: string;
  transaction?: string;
};

type TranscribeResponse = {
  text: string;
};

type CheckResponse = {
  exists: boolean;
};

type RegisterResponse = {
  success: boolean;
};

// Update the ChatHistory type
type ChatHistory = {
  id: string;
  title: string; // First message or truncated content
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

class ApiService {
  private async fetchWithToken<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const token = localStorage.getItem("token");
    options.headers = {
      ...(options.headers || {}),
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }


  async getUserCodes(): Promise<UserCode[]> {
    return this.fetchWithToken("/api/user/codes", { method: "GET" });
  }

  async postAdmin(address: string, signature: number[]): Promise<AdminResponse> {
    return this.fetchWithToken("/api/user/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address, signature }),
    });
  }

  async checkAdmin(token: string): Promise<{ isAdmin: boolean }> {
    return this.fetchWithToken("/api/user/admin", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async postUserCode(): Promise<UserCode> {
    return this.fetchWithToken("/api/user/code", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  }

  async checkUsercode(code: string, walletAddress: string): Promise<CheckResponse> {
    return this.fetchWithToken("/api/user/code/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, walletAddress }),
    });
  }

  async registerUser(
    address: string,
    transactionSignature: string,
  ): Promise<RegisterResponse> {
    return this.fetchWithToken("/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, transactionSignature }),
    });
  }

  async checkUser(identifier: string, did: string): Promise<{ isAllowed: boolean }> {
    return this.fetchWithToken("/api/user/check", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userWallet: identifier, did }),
    });
  }

  async deleteUserCode(id: string): Promise<{ success: boolean }> {
    return this.fetchWithToken("/api/user/code", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async updateUserCode(id: string): Promise<UserCode> {
    return this.fetchWithToken("/api/user/code", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async getAllUserCodes(): Promise<UserCodeType[]> {
    const data = await this.fetchWithToken<{ code: UserCodeType[] }>("/api/user/codes");
    return data.code;
  }

  // New methods
  async postChat(
    caption: string, 
    messageHistory: ChatCompletionMessageParam[] | Message[],
    chains: AppChain[],
    knowledge: string[]
  ): Promise<ChatResponse> {
    return this.fetchWithToken("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption, messageHistory, chains, knowledge }),
    });
  }

  async postBotSolana(text: string, address: string): Promise<BotResponse> {
    return this.fetchWithToken("/api/bot/solana", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.split("op")[0], address }),
    });
  }

  async postBotEvm(text: string, id: string, chain: string = 'base'): Promise<BotResponse> {
    return this.fetchWithToken("/api/bot/evm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.split("op")[0], walletData:id, chain: chain }),
    });
  }

  async postTranscribe(formData: FormData): Promise<TranscribeResponse> {
    return this.fetchWithToken("/api/transcribe", {
      method: "POST",
      body: formData,
    });
  }

  // Chat history methods using localStorage
  getChatHistory(): ChatHistory[] {
    try {
      const allKeys = Object.keys(localStorage);
      const chatKeys = allKeys.filter(key => key.startsWith('chat_'));
      
      return chatKeys.map(key => {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        const id = key.replace('chat_', '');
        const title = data[0]?.content?.slice(0, 30) || 'New Chat';
        
        return {
          id,
          title: title + (title.length >= 30 ? '...' : ''),
          messages: data,
          createdAt: new Date(Number(id)).toISOString(),
          updatedAt: new Date().toISOString()
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  saveChatHistory(chatId: string, messages: Message[]): ChatHistory {
    try {
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
      const title = messages.length > 0 ? messages[0]?.content?.slice(0, 30) : 'New Chat';
      
      return {
        id: chatId,
        title: title + (title.length >= 30 ? '...' : ''),
        messages,
        createdAt: new Date(Number(chatId)).toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error saving chat history:', error);
      throw error;
    }
  }

  deleteChatHistory(chatId: string): { success: boolean } {
    try {
      localStorage.removeItem(`chat_${chatId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting chat history:', error);
      return { success: false };
    }
  }

  async updateToken(walletAddress: string): Promise<{ token: string }> {
    return this.fetchWithToken("/api/user/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });
  }
}

// Export a single instance of the ApiService
export const apiService = new ApiService();
