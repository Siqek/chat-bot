const { Client, Events, GatewayIntentBits, Routes } = require('discord.js');
const { token, CLIENT_ID, URL } = require('./config.json');
const { REST } = require('@discordjs/rest');

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
];

var teachersTab = [];
getTeachers();

async function getTeachers () {
	try {
		const data = await fetch(`${URL}nauczyciele`);
		const json = await data.json();
		let teachers = []
		let i = 0;
		Object.keys(json).forEach(element => {
			if (!json[element].includes('vacat') && i <= 24) teachers.push( { name: `${json[element]} (${element})`, value: `${element}` });
			i++; //moze byc maksymalnie 25 wyborow w jednym poleceniu//
		});
		teachersTab = teachers;
	} catch (err) {
		console.log(err);
	};
};

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

	if (interaction.commandName == 'n') {
		let params = interaction.options.data;
		let time =fillData(params);
		let lesson = time.lesson;
		let day = time.day;
		let teacherName = params[0].value;

		try {
			if (whichLesson() === 'no lessons') {
				interaction.reply({ content: 'nie ma już zajęć'});
				return;
			};
			const data = await fetch(`${URL}?nauczyciel=${teacherName}&czas=${lesson}&day=${day}`);
			const json = await data.json();
			if (!json.length) {
				interaction.reply({ content: 'nauczycziel nie ma lekcji'});
			} else {
				let klasy = '';
				for (let i=0; i<=json[0].klasa.length-1; i++) {
					klasy += `${json[0].klasa[i]} `;
				};
				let reply = [
					`nauczyciel: **${json[0].nauczyciel}**\n`,
					`klasa: **${klasy}**\n`,
					`sala: **${json[0].sala}**\n`,
					`przedmiot: **${json[0].lekcja}**\n`,
					`dane na ${daysTable[day-1].name}, lekcja: ${timeTable[lesson-1].name}`
				];
				interaction.reply({ content: reply.join('')});
			};
		} catch (err) {
			console.log(err);
			interaction.reply({ content: 'napotkano błąd podczas wykonywania polecenia'});
		};
	};

	if (interaction.commandName == 's') {
		let params = interaction.options.data;
		let time =fillData(params);
		let lesson = time.lesson;
		let day = time.day;
		let classNum = params[0].value;
		
		try {
			if (whichLesson() === 'no lessons') {
				interaction.reply({ content: 'nie ma już zajęć'});
				return;
			};
			const data = await fetch(`${URL}?sala=${classNum}&czas=${lesson}&day=${day}`);
			const json = await data.json();
			if (!json.length) {
				interaction.reply({ content: 'w sali nie ma lekcji'});
			} else {
				let klasy = '';
				for (let i=0; i<=json[0].klasa.length-1; i++) {
					klasy += `${json[0].klasa[i]} `;
				};
				let reply = [
					`nauczyciel: **${json[0].nauczyciel}**\n`,
					`klasa: **${klasy}**\n`,
					`sala: **${json[0].sala}**\n`,
					`przedmiot: **${json[0].lekcja}**\n`,
					`dane na ${daysTable[day-1].name}, lekcja: ${timeTable[lesson-1].name}`
				];
				interaction.reply({ content: reply.join('')});
			};
		} catch (err) {
			console.log(err);
			interaction.reply({ content: 'napotkano błąd podczas wykonywania polecenia'});
		};
	};
}));

async function main() {
	const commands = [
		{
			name: 'n',
			description: 'polecenie wyświetla informacje o nauczycielu',
			options: [
				{
					name: 'nauczyciel',
					description: 'imię i nazwisko lub skrót nauczycziela',
					type: 3,
					required: true,
					choices: teachersTab
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
		},
		{
			name: 's',
			description: 'polecenie wyświetli informacje o sali',
			options: [
				{
					name: 'sala',
					description: 'numer sali',
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
		await getTeachers();
		await rest.put(Routes.applicationCommands(CLIENT_ID), {	body: [] }); //delete all global commands
		await rest.put(Routes.applicationCommands(CLIENT_ID), {	body: commands }); //deploy global commands
	} catch (err) {
		console.log(err);
	};
};

main();

function whatTime () {
	const date = new Date();
	let day = date.getDay();
	let hour = date.getHours();
	let minute = date.getMinutes();

	return { day: day, hour: hour, minute: minute };
};

function whichLesson () {
	const lessons = [[0, 0], [8, 45], [9, 40], [10, 35], [11, 30], [12, 25], [13, 15], [14, 30], [15, 20], [16, 15], [17, 10], [18, 5]];

	let time = whatTime();
	let minutes = time.minute + (time.hour * 60);

	for (let i=0; i<=lessons.length-2; i++) {
		let mins = (lessons[i][0] * 60) + lessons[i][1];
		let mins2 = (lessons[i+1][0] * 60) + lessons[i+1][1];
		if (minutes >= mins && minutes < mins2) {
			let h = lessons[i+1][0];
			let min = lessons[i+1][1];
			if ( min >= 45) {
				min -= 45;
			}	else {
				h--;
				min = 60 + (min - 45);
			}
			return { lesson : i+1, time : `${timeTable[i].name}` };
		};
	};
	return 'no lessons';
};

function fillData (params) {
	let day = whatTime().day;
	let lesson = whichLesson().lesson;

	if (params[1]) {
		if (params[1].name == 'godzina') {
			lesson = params[1].value;
			if (params[2]) {
				day = params[2].value;
			};
		};
	};

	return { day: day, lesson: lesson};
};