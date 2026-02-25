import 'dotenv/config';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';

const token = process.env.DISCORD_TOKEN;
const channelId = process.env.TARGET_CHANNEL_ID;
const intervalSecondsRaw = process.env.MESSAGE_INTERVAL_SECONDS;
const messageText = process.env.RECURRING_MESSAGE;

if (!token) {
  throw new Error('Missing DISCORD_TOKEN env var');
}

const intervalSeconds = Number.parseInt(intervalSecondsRaw ?? '0', 10);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

async function sendRecurringMessage() {
  if (!channelId) return;
  if (!messageText) return;

  const channel = await client.channels.fetch(channelId);
  if (!channel) throw new Error(`Channel not found: ${channelId}`);

  if (!('send' in channel)) {
    throw new Error(`Channel is not a text-based channel: ${channelId}`);
  }

  await channel.send({ content: messageText });
}

client.once('ready', async () => {
  if (!client.user) return;

  client.user.setPresence({
    activities: [
      {
        name: '𝐃𝐚𝐫𝐤 𝐕𝐢𝐩 𝐂𝐨𝐦𝐩𝐥𝐞𝐱',
        type: ActivityType.Playing,
      },
    ],
    status: 'online',
  });

  if (channelId && messageText && intervalSeconds > 0) {
    try {
      await sendRecurringMessage();
    } catch (err) {
      console.error('[sendRecurringMessage:init] failed:', err);
    }

    setInterval(async () => {
      try {
        await sendRecurringMessage();
      } catch (err) {
        console.error('[sendRecurringMessage] failed:', err);
      }
    }, intervalSeconds * 1000);
  }

  console.log(`Logged in as ${client.user.tag}`);
});

client.login(token);
