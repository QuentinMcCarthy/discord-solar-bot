const Discord = require('discord.js');
const fs = require('fs');
const Enmap = require('enmap');
const client = new Discord.Client();
const {token, perms} = require('./auth.json');

client.settings = new Enmap({
	fetchAll: true,
	autoFetch: true,
	cloneLevel: 'deep'
});

// Default settings
const defaultSettings = {
	prefix: '!',
	channels: {},
	filter: {
		list: [],
		response: 'Please don\'t use banned words'
	}
}

// Dynamic command files
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require('./commands/'+file);

	client.commands.set(command.name, command);
}

// Cooldowns
const cooldowns = new Discord.Collection();

// Bot startup
client.once('ready', () => {
	client.guilds.cache.forEach(guild => {
		client.settings.ensure(guild.id, defaultSettings);

		console.log('Settings loaded for '+guild.name);
	});

	console.log('\n'+client.user.username+' loaded and logged in\n');
});

client.on('guildDelete', guild => {
	// If the bot disconnects from a server, delete the settings
	client.settings.delete(guild.id);
});

client.on('message', message => {
	// Don't respond to commands in DMs or from bots
	if (!message.guild || message.author.bot) {
		return;
	}

	// Get necessary variables
	const channelID = message.channel.id;
	const guildID = message.guild.id;
	const userID = message.author.id;
	const guildSettings = client.settings.ensure(guildID, defaultSettings);
	const prefix = guildSettings.prefix;

	if (channelID in guildSettings.channels) {
		let channelSettings = guildSettings.channels[channelID];
		let current = channelSettings.creminder.current;
		let delay = channelSettings.creminder.delay;
		let msg = channelSettings.creminder.message;

		if (delay > 0 && message.content.length > 0) {
			if (current - 1 <= 0) {
				message.channel.send(msg);

				client.settings.set(guildID, delay, 'channels.'+channelID+'.creminder.current');

				console.log('Reminded users in '+channelID);
			} else {
				client.settings.set(guildID, current-1, 'channels.'+channelID+'.creminder.current')
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
			command.execute(client, message, args);
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
	} else if (client.settings.has(guildID, 'filter.list')) {
		let toFilter = message.content.toLowerCase();

		for (var i = 0; i < guildSettings.filter.list.length; i++) {
			if (toFilter.includes(guildSettings.filter.list[i])) {
				message.delete();

				message.channel.send(guildSettings.filter.response);
			}
		}
	}
});

client.login(token);
