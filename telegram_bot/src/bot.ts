import { Telegraf, Markup, session } from 'telegraf';
import { SessionContext } from './types';
import dotenv from 'dotenv';
import getAgent from '../agent/agent';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { prisma } from '../prisma/client';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set in the environment variables');
}

const bot = new Telegraf<SessionContext>(token);


// Use session middleware
bot.use(session());

// Function to handle new user addition
bot.on('new_chat_members', async (ctx) => {
  const newMember = ctx.message.new_chat_members[0];
  if (newMember.id === ctx.botInfo.id) {
    await ctx.reply('Please define a name for the agent:', Markup.inlineKeyboard([
      Markup.button.callback('Define Name', 'define_name')
    ]));
  }
});

// Handle the callback for defining the name
bot.action('define_name', async (ctx) => {
  await ctx.reply('Please enter a name for the agent:');

  // Initialize session if it doesn't exist
  if (!ctx.session) {
    ctx.session = {};
  }

  ctx.session.waitingForName = true; // Initialize session variable
});

// Handle text messages
bot.on('text', async (ctx) => {
  if (!ctx.session) {
    ctx.session = {};
  }
  let messages = []
  if (ctx.session.waitingForName) {
    const agentName = ctx.message.text;
    messages.push(new SystemMessage("Please create an agent with the name: " + agentName + " and chatId: " + ctx.chat.id.toString()));
    ctx.session.waitingForName = false; // Reset user state
  } else {
    messages.push(new HumanMessage(ctx.message.text));
  }
  // Stream the response from the agent
  const stream = await getAgent(ctx.chat.id.toString()).stream(
    {
      messages: messages
    },
    { configurable: { thread_id: "Telegram Bot" } }
  );

  let response = "";
  console.log("Stream: ", stream);
  for await (const chunk of stream) {
    if ("agent" in chunk) {
      console.log(chunk.agent.messages[0].content);
      response = chunk.agent.messages[0].content;
    } else if ("tools" in chunk) {
      console.log(chunk.tools.messages[0].content);
    }
    console.log("-------------------");
  }
  console.log("Response: ", response);
  await ctx.reply(response); // Send the response back to the user
});

bot.command("trigger", async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const tags: string[] = [];
  let condition: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tag') {
      while (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        tags.push(args[i + 1]);
        i++;
      }
    } else if (args[i] === '--condition') {
      if (i + 1 < args.length) {
        condition = args[i + 1];
        i++;
      }
    }
  }

  if (tags.length > 0 && condition) {
    const group = await prisma.telegramGroup.findUnique({
      where: {
        chatId: ctx.chat.id.toString(),
      }
    });
    if (!group) {
      await prisma.tradeSignal.create({
        data: {
          condition: condition,
          groupId: ctx.chat.id.toString(),
        },
      });
      ctx.reply(`Tags: ${tags.join(', ')}, Condition: ${condition}. Trigger is generated`);
    } else {
      ctx.reply('Please provide tags and a condition using --tag and --condition.');
    }
  }
});

bot.launch();

console.log('Bot is running...');