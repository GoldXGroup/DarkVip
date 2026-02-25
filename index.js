import 'dotenv/config';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';

const token = process.env.DISCORD_TOKEN;
const channelId = process.env.TARGET_CHANNEL_ID;
const intervalSecondsRaw = process.env.MESSAGE_INTERVAL_SECONDS;
const messageText = {
  content: '@everyone @here',
  embeds: [{
    title: '<:aura:1189991219270834229> <:red_dot:1189991217571520542> **TCC OFICIAL** - Tienda Oficial',
    description: '',
    color: 0xFF0000,
    fields: [
      {
        name: '<:ticket:1178619312112834670> Compras',
        value: '¡Realiza tus compras únicamente en el canal de tickets!\n\n<:orange_arrow:1189991215176001606> Usa #<:ticket:1178619312112834670> Ticket',
        inline: false
      },
      {
        name: '<:shield:1189991213451747358> Garantía',
        value: '• Productos verificados\n• Soporte 24/7\n• Entrega inmediata',
        inline: true
      },
      {
        name: '<:card:1189991210876403712> Metodo de pago',
        value: '• PayPal\n• Transferencia',
        inline: true
      },
      {
        name: '<:clock:1189991209353283624> Horario',
        value: '• Disponible 24/7\n• Respuesta rápida\n• Atención personalizada',
        inline: true
      }
    ],
    image: {
      url: 'https://i.imgur.com/yourimage.png'
    },
    footer: {
      text: '<:aura:1189991219270834229> Tcc Oficial © 2026 | By Linox'
    }
  }]
};

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

  await channel.send(messageText);
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
        name: `��� 𝐎𝐟��𝐢𝐚� 𝐂𝐨𝐦𝐩𝐥𝐞𝐱 | ${uptime}`,
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
