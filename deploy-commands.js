import 'dotenv/config';
import {
  REST, Routes, SlashCommandBuilder,
  ApplicationIntegrationType, InteractionContextType,
} from 'discord.js';

const integrationTypes = [
  ApplicationIntegrationType.UserInstall,
  ApplicationIntegrationType.GuildInstall,
];

const contexts = [
  InteractionContextType.Guild,
  InteractionContextType.BotDM,
  InteractionContextType.PrivateChannel,
];

const commands = [
  new SlashCommandBuilder()
    .setName('raid')
    .setDescription('Start a raid')
    .setIntegrationTypes(...integrationTypes)
    .setContexts(...contexts),

  new SlashCommandBuilder()
    .setName('spam')
    .setDescription('Spam a message of your choice')
    .addStringOption(o =>
      o.setName('message')
        .setDescription('The message to spam')
        .setRequired(true))
    .setIntegrationTypes(...integrationTypes)
    .setContexts(...contexts),

  new SlashCommandBuilder()
    .setName('blame')
    .setDescription('Blame someone')
    .addUserOption(o =>
      o.setName('victim')
        .setDescription('Who to blame')
        .setRequired(true))
    .setIntegrationTypes(...integrationTypes)
    .setContexts(...contexts),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

await rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: commands }
);

console.log('Slash commands registered.');