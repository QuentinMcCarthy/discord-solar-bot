const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const {token, perms} = require('./auth.json');
const settingsPath = './bot_data/settings.json';

// Dynamic command files
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require('./commands/'+file);

	client.commands.set(command.name, command);
}

// Cooldowns
const cooldowns = new Discord.Collection();

// Save settings into a variable from the file
var botSettings = JSON.parse('{}');

// Bot startup
client.once('ready', () => {
	// Check if the settings file exists and load it up
	if (fs.existsSync(settingsPath)) {
		botSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

		console.log('Settings file successfully loaded');
	} else {
		fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

		console.log('Settings file doesn\'t exist; new file saved');
	}

	// Ensure each guild the bot is in has an entry in settings
	for (var key in client.servers) {
		if (key in botSettings) {
			console.log(key+' data reported exists');
		} else {
			botSettings[key] = JSON.parse('{"prefix":"!","channels":{},"filter":{}}');

			fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

			console.log('Created guild entry for '+key);
		}
	}

	console.log('\n'+client.user.username+' loaded and logged in\n');
});

client.on('message', message => {
	// Get necessary variables
	const channelID = message.channel.id;
	const guildID = message.channel.guild.id;
	const userID = message.author.id;
	const prefix = botSettings[guildID].prefix;

	// Cancel code execution if it was executed by the bot itself
	// This will prevent loops of the bot talking to itself
	if (message.author.bot) {
		return;
	}

	if (channelID in botSettings[guildID].channels) {
		let channelSettings = botSettings[guildID].channels[channelID];
		let current = channelSettings.creminder.current;
		let delay = channelSettings.creminder.delay;
		let msg = channelSettings.creminder.message;

		if (delay > 0 && message.content.length > 0) {
			if (current - 1 <= 0) {
				client.sendMessage({
					to: channelID,
					message: msg
				});

				botSettings[guildID].channels[channelID].creminder.current = delay;

				console.log('Reminded users in '+channelID);
			} else {
				botSettings[guildID].channels[channelID].creminder.current = botSettings[guildID].channels[channelID].creminder.current - 1;
			}
		}
	}

	// Listen for messages that start with the prefix, or if the bot is mentioned
	if (message.content.startsWith(prefix)) {
		const args = message.content.slice(prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();
		let rtrn = '';

		if (!client.commands.has(commandName)) {
			return;
		}

		const command = client.commands.get(commandName);

		if (!cooldowns.has(command.name)) {
			cooldowns.set(command.name, new Discord.Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || 3) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now / 1000);
				return console.log(message.author.username+' attempted to use '+command.name+' but it was on cooldown');
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		// Dynamic command execution
		try {
			command.execute(prefix, message, args);
		} catch (err) {
			console.log(err);

			message.channel.send('Unrecognized command. Use '+prefix+'help to see a list of commands and their usage');

			rtrn = 'nocmd';
		}
	} else if (message.content.startsWith('<@!'+client.user.id+'>')) {
		if (message.content.split(' ')[1] == 'help') {
			message.channel.send(prefix+' is the prefix for the bot. To see the commands list use '+prefix+'help');

			console.log('Returned mentionhelp to '+message.author.username+' ('+message.author.id+')');
		}
	} else {
		let toFilter = message.content.toLowerCase();

		for (var i = 0; i < botSettings[guildID].filter.list.length; i++) {
			if (toFilter.includes(botSettings[guildID].filter.list[i])) {
				message.delete();

				message.channel.send(botSettings[guildID].filter.list[i]+' is a banned word!');
			}
		}
	}
});

client.login(token);
