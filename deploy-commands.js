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

const appId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // optional, aber für sofortiges Testen setzen

console.log('CLIENT_ID gesetzt?', Boolean(appId));
console.log('GUILD_ID gesetzt?', Boolean(guildId));

if (!appId) {
  console.error('FEHLER: CLIENT_ID fehlt! Variable auf Railway anlegen.');
  process.exit(0); // wichtig: exit 0, damit index.js trotzdem startet
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  const route = guildId
    ? Routes.applicationGuildCommands(appId, guildId)
    : Routes.applicationCommands(appId);

  console.log(
    `Registriere ${commands.length} Commands ${guildId ? `im Guild ${guildId}` : 'GLOBAL (bis 1h Wartezeit)'}...`
  );

  const data = await rest.put(route, { body: commands });
  console.log(`OK - ${data.length} Commands registriert.`);
} catch (err) {
  console.error('Registrierung fehlgeschlagen:', err);
  process.exit(0); // nicht den Bot killen
}
