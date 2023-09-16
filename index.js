const { Client, Events, GatewayIntentBits, Routes } = require('discord.js');
const { token, CLIENT_ID, GUILD_ID, URL } = require('./config.json');
const { REST } = require('@discordjs/rest');
//import './functions.js'

const timeTable = [
	{	name: '1. 8:00-8:45', value: '1'},
	{	name: '2. 8:55-9:40', value: '2'},
	{	name: '3. 9:50-10:35', value: '3'},
	{	name: '4. 10:45-11:30',	value: '4'},
	{	name: '5. 11:40-12:25',	value: '5'},
	{	name: '6. 12:30-13:15',	value: '6'},
	{	name: '7. 13:45-14:30',	value: '7'},
	{	name: '8. 14:35-15:20',	value: '8'},
	{	name: '9. 15:30-16:15',	value: '9'},
	{	name: '10. 16:25-17:10', value: '10'},
	{	name: '11. 17:20-18:05', value: '11'}
];

const daysTable = [
	{	name: 'poniedziałek', value: '1'},
	{	name: 'wtorek', value: '2'},
	{	name: 'środa', value: '3'},
	{	name: 'czwartek', value: '4'},
	{	name: 'piątek', value: '5'}
]

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

client.on('interactionCreate', (async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	if (interaction.user.bot) return;
	//console.log(interaction)

	if (interaction.commandName == 'test') {
		interaction.reply({ content: 'hi! ' + interaction.options.data[0].value});
	};
	if (interaction.commandName == 'n') {
		let hour = '';
		let day = '';
		let teacherName = '';

		if (interaction.options.data[0]) teacherName = `?nauczyciel=${interaction.options.data[0].value}`
		if (interaction.options.data[1]) hour = `&czas=${interaction.options.data[1].value}`
		if (interaction.options.data[2]) day = `&day=${interaction.options.data[2].value}`

		try {
			const data = await fetch(`${URL}${teacherName}${hour}${day}`);
			const json = await data.json()
			interaction.reply({ content: `nauczyciel: ${json[0].nauczyciel}\nklasa: ${json[0].klasa}\nsala: ${json[0].sala}`});
		} catch (err) {
			console.log(err);
			interaction.reply({ content: 'napotkano błąd podczas wykonywania polecenia'});
		};

		
	}
}));

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
		{
			name: 'n',
			description: 'polecenie wyświetla informacje o nauczycielu',
			options: [
				{
					name: 'nauczyciel',
					description: 'imię i nazwisko lub skrót nauczycziela',
					type: 3,
					required: true
				},
				{
					name: 'godzina',
					description: 'godzina lekcyjna, która cię interesuje',
					type: 3,
					required: false,
					choices: timeTable
				},
				{
					name: 'dzień',
					description: 'dzień, który cię interesuje',
					type: 3,
					required: false,
					choices: daysTable
				}
			]
		}
	];

	try {
		await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {	body: []	}); //delete all commands
		await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {	body: commands	}); //deploy commands
		//await rest.put(Routes.applicationCommands(CLIENT_ID), {	body: []	}); //delete all global commands
		//await rest.put(Routes.applicationCommands(CLIENT_ID), {	body: commands	}); //deploy global commands
	} catch (err) {
		console.log(err);
	};
};

main();