import { Context } from 'telegraf';

export interface SessionContext extends Context {
  session: {
    waitingForName?: boolean;
  };
} 