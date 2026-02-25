import 'dotenv/config';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';

const token = process.env.DISCORD_TOKEN;
const channelId = process.env.TARGET_CHANNEL_ID;
const intervalSecondsRaw = process.env.MESSAGE_INTERVAL_SECONDS;
const messageText = `@everyone @here

<:aura:1189991219270834229> <:red_dot:1189991217571520542> **DARK VIP** - Tienda Oficial

<:ticket:1178619312112834670> ¡Realiza tus compras únicamente en el canal de tickets!

<:orange_arrow:1189991215176001606> Usa #<:ticket:1178619312112834670> Ticket

<:shield:1189991213451747358> **Garantía**

• Productos verificados

• Soporte 24/7

• Entrega inmediata

<:card:1189991210876403712> **Metodo de pago**

• PayPal

• Transferencia

<:clock:1189991209353283624> **Horario**

• Disponible 24/7

• Respuesta rápida

• Atención personalizada

https://i.imgur.com/yourimage.png

<:aura:1189991219270834229> Dark Vip © 2026 | By Linox`;

if (!token) {
  throw new Error('Missing DISCORD_TOKEN env var');
}

const intervalSeconds = Number.parseInt(intervalSecondsRaw ?? '0', 10);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

async function sendRecurringMessage() {
  if (!channelId) return;

  const channel = await client.channels.fetch(channelId);
  if (!channel) throw new Error(`Channel not found: ${channelId}`);

  if (!('send' in channel)) {
    throw new Error(`Channel is not a text-based channel: ${channelId}`);
  }

  await channel.send({ content: messageText });
}

let startTime = Date.now();

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const h = hours % 24;
  const m = minutes % 60;
  const s = seconds % 60;
  return `${days}d ${h}h ${m}m ${s}s`;
}

function updatePresence() {
  if (!client.user) return;
  const uptime = formatUptime(Date.now() - startTime);
  client.user.setPresence({
    activities: [
      {
        name: `𝐃𝐚𝐫𝐤 𝐕𝐢𝐩 𝐂𝐨𝐦𝐩𝐥𝐞𝐱 | ${uptime}`,
        type: ActivityType.Playing,
      },
    ],
    status: 'online',
  });
}

client.once('ready', async () => {
  if (!client.user) return;

  updatePresence();
  setInterval(updatePresence, 15000);

  try {
    await sendRecurringMessage();
  } catch (err) {
    console.error('[sendRecurringMessage:init] failed:', err);
  }

  if (channelId && intervalSeconds > 0) {
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
