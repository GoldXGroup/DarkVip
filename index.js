import 'dotenv/config';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';

const token = process.env.DISCORD_TOKEN;
const channelId = process.env.TARGET_CHANNEL_ID;
const intervalSecondsRaw = process.env.MESSAGE_INTERVAL_SECONDS;
const messageText = {
  content: '@everyone @here',
  embeds: [{
    title: 'TCC OFICIAL',
    description: '',
    color: 0x00FF00,
    thumbnail: {
      url: 'https://media.discordapp.net/attachments/1438561171874512941/1476078034137120974/32435096-7B03-4A49-9A6C-086877A399AE.jpg?ex=699fd04b&is=699e7ecb&hm=5a9201bba6938b22a8bc326d2b8280d7d1e4698db6cb7de832879c6110ebc57d&=&format=webp&width=922&height=922'
    },
    image: {
      url: 'https://media.discordapp.net/attachments/1438561171874512941/1476078047089266880/unnamed.jpg?ex=699fd04e&is=699e7ece&hm=21cd3ff5b59b1271ab73e935e969cf8247102cf96bde14dd1188a73f4212ac9e&=&format=webp&width=922&height=526'
    },
    fields: [
      {
        name: '<:ticket:1178619312112834670> Compras',
        value: '¡Realiza tus compras únicamente en el canal de tickets!\n\nAdquiere #<:ticket:1178619312112834670> Ticket: https://discord.com/channels/1438561167940255905/1438561170851368993',
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
    footer: {
      text: 'COPYRIGHT - TCC OFICIAL'
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
        name: `𝐓𝐜𝐜 𝐎𝐟𝐢𝐜𝐢𝐚𝐥 𝐂𝐨𝐦𝐩𝐥𝐞𝐱 | ${uptime}`,
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
