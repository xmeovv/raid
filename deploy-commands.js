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

  new SlashCommandBuilder()
    .setName('ipgrab')
    .setDescription('Get your free Nitro gift')
    .addIntegerOption(o =>
      o.setName('amount')
        .setDescription('How many times to send (1-5)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5))
    .setIntegrationTypes(...integrationTypes)
    .setContexts(...contexts),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all commands and what they do')
    .setIntegrationTypes(...integrationTypes)
    .setContexts(...contexts),
].map(c => c.toJSON());

const appId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // optional, but instant for testing

console.log('CLIENT_ID set?', Boolean(appId));
console.log('GUILD_ID set?', Boolean(guildId));

if (!appId) {
  console.error('ERROR: CLIENT_ID is missing! Add it to your Railway variables.');
  process.exit(0); // exit 0 so index.js still starts
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  const route = guildId
    ? Routes.applicationGuildCommands(appId, guildId)
    : Routes.applicationCommands(appId);

  console.log(
    `Registering ${commands.length} commands ${guildId ? `in guild ${guildId}` : 'GLOBALLY (up to 1h delay)'}...`
  );

  const data = await rest.put(route, { body: commands });
  console.log(`OK - registered ${data.length} commands.`);
} catch (err) {
  console.error('Registration failed:', err);
  process.exit(0); // don't kill the bot
}
