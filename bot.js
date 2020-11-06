const Discord = require('discord.js');
const fs = require('fs');
const Enmap = require('enmap');
const client = new Discord.Client();
const winston = require('winston');
const {token, id, perms, devid} = require('./auth.json');

// Logging
const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'log.log' }),
	],
	format: winston.format.printf(log => '['+log.level.toUpperCase()+'] - '+log.message),
});

// Enmap initialisation
client.settings = new Enmap({
	name: "settings",
	fetchAll: true,
	autoFetch: true,
	cloneLevel: 'deep'
});

// Default guild settings
const defaultSettings = {
	prefix: '~',
	adminrole: 'Admin',
	channels: {},
	filter: {
		list: [],
		response: 'Please don\'t use banned words'
	},
	keyphrases: []
}

// Dynamic command files
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require('./commands/'+file);

	client.commands.set(command.name, command);
}

// Dynamic settings files
client.guildSettings = new Discord.Collection();

const settingsFiles = fs.readdirSync('./settings').filter(file => file.endsWith('.js'));

for (const file of settingsFiles) {
	const setting = require('./settings/'+file);

	client.guildSettings.set(setting.name, setting);
}

// Cooldowns
const cooldowns = new Discord.Collection();

// Bot startup
client.once('ready', () => {
	let todayDate = new Date();
	logger.log('info', todayDate.getDate()+'/'+todayDate.getMonth()+'/'+todayDate.getFullYear())

	client.settings.defer;

	logger.log('info', client.settings.size+' keys loaded');

	// Ensure each guild has a settings entry
	// If a settings entry is not found,
	// Create a new entry with default settings.
	client.guilds.cache.forEach(guild => {
		client.settings.ensure(guild.id, defaultSettings);

		logger.log('info', 'Settings loaded for '+guild.name);
	});

	logger.log('info', client.user.username+' loaded and logged in');
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

	// Creminder countdown
	if (client.settings.has(guildID, 'channels.'+channelID)) {
		if (client.settings.get(guildID, 'channels.'+channelID+'.creminder.delay') > 0 && message.content.length > 0) {
			let deductTimer = (client.settings.get(guildID, 'channels.'+channelID+'.creminder.current')-1)

			if (deductTimer <= 0) {
				message.channel.send(client.settings.get(guildID, 'channels.'+channelID+'.creminder.message'));

				client.settings.set(guildID, client.settings.get(guildID, 'channels.'+channelID+'.creminder.delay'), 'channels.'+channelID+'.creminder.current');

				logger.log('info', 'Reminded users in '+channelID);
			} else {
				client.settings.set(guildID, deductTimer, 'channels.'+channelID+'.creminder.current');
			}
		}
	}
	
	// Listen for messages that start with the prefix, or if the bot is mentioned
	if (message.content.startsWith(client.settings.get(guildID, 'prefix'))) {
		const args = message.content.slice(client.settings.get(guildID, 'prefix').length).split(/ +/);
		const commandName = args.shift().toLowerCase();
		let rtrn = '';

		// If the command does not exist, don't continue
		if (!client.commands.has(commandName)) {
			return;
		}

		const command = client.commands.get(commandName);

		// Put the command on cooldown, if applicable
		if (!cooldowns.has(command.name)) {
			cooldowns.set(command.name, new Discord.Collection());
		}

		// Check the command's cooldown
		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || 3) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now / 1000);
				return logger.log('info', message.author.username+' attempted to use '+command.name+' but it was on cooldown');
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		// restrict commands to specific users
		if (command.admin) {
			// Only those with the adminrole
			// Or the server owner can use admin flagged commands
			let isAdmin = message.member.roles.cache.some(role => role.name === client.settings.get(guildID, 'adminrole'));
			let isOwner = (message.member.id === message.guild.ownerID);

			// If the user is the dev, override the above
			let isDev = message.member.id === devid;

			if (!isAdmin && !isOwner && !isDev) {
				message.channel.send('This command can only be used by Admins');

				return;
			}
		}

		if (command.dev) {
			// Only the dev can use dev flagged commands
			let isDev = message.member.id === devid;

			if (!isDev) {
				message.channel.send('This command can only be used by the developer');

				return;
			}
		}

		// If the command is settings
		if (command.name == 'settings') {
			let data = [];

			if (!args.length) {
				data.push('```Settings:');
				data.push(client.guildSettings.map(setting => setting.name).join(', '));
				data.push('\nUse '+client.settings.get(message.guild.id, 'prefix')+'settings <setting> to see more details```');

				logger.log('info', 'Returned settingslist to '+message.author.username+' ('+message.author.id+')');

				return message.channel.send(data, {split:true})
			}

			let name = args[0].toLowerCase();
			let setting = client.guildSettings.get(name);

			// If the setting doesn't exist, return an error
			if (!setting) {
				logger.log('info', 'Returned nosetting to '+message.author.username+' ('+message.author.id+')');

				return message.channel.send('No such setting. Use '+client.settings.get(message.guild.id, 'prefix')+'settings to see a list of settings and their usage')
			}

			// If no argument is provided, return the setting's usage
			if (!args[1]) {
				data.push('Setting: '+setting.name);

				// Return the setting's usage
				if (setting.usage) {
					data.push('Usage: '+client.settings.get(message.guild.id, 'prefix')+'settings '+setting.name+' '+setting.usage);
				}
				if (setting.description) {
					data.push(setting.description);
				}

				message.channel.send(data, {split:true});

				logger.log('info', 'Returned '+setting.name+'help to '+message.author.username+' ('+message.author.id+')');
			} else {
				args.splice(0, 1);

				try {
					setting.execute(client, logger, message, args);
				} catch (err) {
					logger.log('error', err);

					message.channel.send('An error occurred: '+err.message);
				}
			}
		} else {
			// Dynamic command execution
			try {
				command.execute(client, logger, message, args);
			} catch (err) {
				logger.log('error', err);

				message.channel.send('Unrecognized command. Use '+client.settings.get(guildID, 'prefix')+'help to see a list of commands and their usage');

				rtrn = 'nocmd';
			}
		}
	} else {
		if (message.content.startsWith('<@!'+client.user.id+'>')) {
			if (message.content.split(' ')[1] == 'help') {
				message.channel.send(client.settings.get(guildID, 'prefix')+' is the prefix for the bot. To see the commands list use '+client.settings.get(guildID, 'prefix')+'help');

				logger.log('info', 'Returned mentionhelp to '+message.author.username+' ('+message.author.id+')');
			}
		}
			
		if (message.guild.me.hasPermission('MANAGE_MESSAGES')){
			if (client.settings.has(guildID, 'filter.list')) {
				let toFilter = message.content.toLowerCase();

				for (var i = 0; i < client.settings.get(guildID, 'filter.list').length; i++) {
					if (toFilter.includes(client.settings.get(guildID, 'filter.list')[i])) {
						message.delete();

						message.channel.send(client.settings.get(guildID, 'filter.response'));
					}
				}
			}
		}

		if (client.settings.has(guildID, 'keyphrases') && message.guild.me.hasPermission('MANAGE_ROLES')) {
			let toFilter = message.content;

			for (var i = 0; i < client.settings.get(guildID, 'keyphrases').length; i++) {
				if (toFilter == client.settings.get(guildID, 'keyphrases')[i].phrase) {
					message.delete();

					if (client.settings.get(guildID, 'keyphrases')[i].add && !message.member.roles.cache.some(role => role.name === client.settings.get(guildID, 'keyphrases')[i].add)) {
						let role = message.guild.roles.cache.find(role => role.name === client.settings.get(guildID, 'keyphrases')[i].add)

						message.member.roles.add(role);

						logger.log('info', 'Gave role to ' + message.author.username + ' (' + message.author.id + ')');

						message.reply('you\'ve been given the ' + client.settings.get(guildID, 'keyphrases')[i].add + ' role');
					} else if (client.settings.get(guildID, 'keyphrases')[i].remove && message.member.roles.cache.some(role => role.name === client.settings.get(guildID, 'keyphrases')[i].remove)) {
						let role = message.guild.roles.cache.find(role => role.name === client.settings.get(guildID, 'keyphrases')[i].remove)

						message.member.roles.remove(role);

						logger.log('info', 'Removed role from ' + message.author.username + ' (' + message.author.id + ')');

						message.reply('you\'ve had the ' + client.settings.get(guildID, 'keyphrases')[i].remove + ' role taken away');
					} else {
						logger.log('error', 'Attempted to alter roles of ' + message.author.username + ' (' + message.author.id + ') but failed');
					}
				}
			}
		}
	}
});

client.login(token);
