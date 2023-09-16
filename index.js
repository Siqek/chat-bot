const { Client, Events, GatewayIntentBits, Routes } = require('discord.js');
const { token, CLIENT_ID, GUILD_ID, URL } = require('./config.json');
const { REST } = require('@discordjs/rest');
//import './functions.js'

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
 });

const rest = new REST({ version: '10'}).setToken(token);
 
client.login(token);

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on('interactionCreate', (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	if (interaction.user.bot) return;
	//console.log(interaction)

	if (interaction.isChatInputCommand) {
		interaction.reply({ content: 'hi! ' + interaction.options.data[0].value});
		console.log(interaction.commandName)
		//console.log(interaction.options)
		try {
			//console.log(interaction.options.data[0].value)
		} catch (err) {
			console.log(err)
		}
	};
});

async function main() {

	const commands = [
		{
			name: 'test',
			description: 'just test command',
			options: [
				{
					name: "testowy",
					description: "test argsów",
					type: 3,
					required: true,
				},
			],
		},
	];

	try {
		await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {	body: commands	});
	} catch (err) {
		console.log(err);
	};
};

main();