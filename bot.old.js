const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const {token, perms} = require('./auth.json');
const settingsPath = './bot_data/settings.json';

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
	let channelID = message.channel.id;
	let guildID = message.channel.guild.id;
	let userID = message.author.id;
	let prefix = botSettings[guildID].prefix;

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
		let args = message.content.slice(prefix.length).split(/ +/);
		let cmd = args.shift().toLowerCase();
		let rtrn = '';

		switch(cmd){
            case 'ping':
				message.channel.send('Pong recieved after '+(Date.now() - message.createdTimestamp)+'ms');

				rtrn = 'pong';

	            break;
            case 'invite':
				message.channel.send('https://discordapp.com/oauth2/authorize?client_id=726760083857473597&scope=bot&'+perms);

				rtrn = 'invite url';

	            break;
			case 'help':
				if (args[0] == 'ping') {
					message.channel.send('Command: ping\nUsage: '+prefix+'ping\nPings the bot, used to check if the bot is running properly and to check the command delay');

					rtrn = 'pinghelp';
				} else if (args[0] == 'settings') {
					message.channel.send('Command: settings\nUsage: '+prefix+'settings [setting] [value]\nLists and sets settings for the bot');

					rtrn = 'settingshelp';
				} else if (args[0] == 'creminder') {
					message.channel.send('Command: creminder\nUsage: '+prefix+'creminder <message/off> [delay]\nReminds users in a channel every set amount of messages of a specified message. "'+prefix+'creminder off" will disable the reminder');

					rtrn = 'creminderhelp';
				} else {
					message.channel.send('Commands:\n```General:\nping\n\nAdmin:\nsettings, creminder\n\n'+prefix+'help <command> to see more details```');

					rtrn = 'helplist';
				}

				break;
			case 'settings':
				if (args[0] == 'prefix') {
					if (args[1]) {
						botSettings[guildID].prefix = args[1];

						// Write the settings back into the file
						fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

						message.channel.send('New Prefix set as: '+args[1]);

						rtrn = 'prefixset';
					} else {
						message.channel.send('```Setting: prefix\nUsage: '+prefix+'settings prefix <newPrefix>\nSet the prefix for bot commands```');

						rtrn = 'prefixhelp';
					}
				} else if (args[0] == 'filter') {
					if (args[1] == 'list') {
						if ('list' in botSettings[guildID].filter) {
							let filterList = botSettings[guildID].filter.list;
							let returnList = 'Filtered Words/Phrases:';

							for (var i = 0; i < filterList.length; i++) {
								returnList += '\n'+(i+1)+'. '+filterList[i];
							}

							message.channel.send('```'+returnList+'```');

							rtrn = 'filterlist';
						} else {
							message.channel.send('```Filter Words/Phrases:```');

							rtrn = 'filterlist';
						}
					} else if (args[1] == 'add') {
						let phrase = args[2];

						if (phrase) {
							// Find the full string if there's a quotation
							if (args[2].substring(0, 1) == '"' && args[2].substring(args[3].length-1) != '"') {
								for (var i = 3; i < args.length; i++) {
									if (args[i].substring(args[i].length-1) == '"') {
										phrase += ' '+args[i];

										break;
									} else {
										phrase += ' '+args[i];
									}
								}
							}

							// Remove quotes
							phrase = phrase.replace(/"/g, '');

							// Check if the list already exists. If not, create it.
							if ('list' in botSettings[guildID].filter) {
								botSettings[guildID].filter.list.push(phrase);
							} else {
								botSettings[guildID].filter = JSON.parse('{"list":["'+phrase+'"]}')
							}

							fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

							message.channel.send('Added "'+phrase+'" to filter list');

							rtrn = 'filteradd';
						} else {
							message.channel.send('```Setting: filter\nUsage: '+prefix+'settings filter <list/add/remove/clear> [word/phrase]\nAdd/remove words from the filter list, or list all filter words, or clear the filter list to disable the filter.```');

							rtrn = 'filteraddfail';
						}
					} else if (args[1] == 'remove') {
						let term = args[2];

						if (term) {
							// Find the full string if there's a quotation
							if (args[2].substring(0, 1) == '"' && args[2].substring(args[2].length-1) != '"') {
								for (var i = 3; i < args.length; i++) {
									if (args[i].substring(args[i].length-1) == '"') {
										term += ' '+args[i];

										break;
									} else {
										term += ' '+args[i];
									}
								}
							}

							// Remove quotes
							term = term.replace(/"/g, '');

							// Check if the list exists, if not, inform user
							if ('list' in botSettings[guildID].filter) {
								// Is the term a string or an number
								if(parseInt(term, 10) > 0) {
									// The given index will be higher than the actual index
									term = parseInt(term, 10)-1;

									// Remove the given index from the array
									let removed = botSettings[guildID].filter.list.splice(term, 1);

									message.channel.send('Removed '+removed+' from the filter list');

									fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

									rtrn = 'filterremove';
								} else {
									let removed = '';
									let filterList = botSettings[guildID].filter.list;

									// Find and remove the entry from the array
									for(var i = 0; i < filterList.length; i++){
										if (filterList[i] == term) {
											removed = filterList[i];

											botSettings[guildID].filter.list.splice(i, 1);

											break;
										}
									}

									if (removed == '') {
										message.channel.send(term+' was not found in the list');

										rtrn = 'filterremovefail';
									} else {
										message.channel.send('Removed '+removed+' from the filter list');

										fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

										rtrn = 'filterrremove';
									}
								}
							} else {
								message.channel.send('There are no words being filtered');

								rtrn = 'filterremovefail';
							}
						}
					} else if (args[1] == 'clear') {
						// Set a new array
						botSettings[guildID].filter.list = JSON.parse('[]');

						fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

						message.channel.send('Filter list cleared');

						rtrn = 'filterclear';
					} else {
						message.channel.send('```Setting: filter\nUsage: '+prefix+'settings filter <list/add/remove/clear> [word/phrase/id]\nAdd/remove words from the filter list, or list all filter words, or clear the filter list to disable the filter.```');

						rtrn = 'filterhelp';
					}
				} else {
					message.channel.send('```General:\nprefix\n\nAdmin:\nfilter\n\n'+prefix+'settings <setting> to see more details```');

					rtrn = 'settingslist';
				}

				break;
			case 'creminder':
				if (args[0] != undefined && args[1] != undefined && typeof args[1] != 'number') {
					let crmessage = args[0];
					let crdelay = args[1];

					// Find the full string if there's a quotation
					if (crmessage.substring(0, 1) == '"' && crmessage.substring(crmessage.length-1) != '"') {
						for (var i = 2; i < args.length; i++) {
							if (args[i].substring(args[i].length-1) == '"') {
								crmessage += ' '+args[i];
								crdelay = args[i+1];

								break;
							} else {
								crmessage += ' '+args[i];
								crdelay = args[i+1];
							}
						}
					}

					// Ensure that everything is correct
					if (parseInt(crdelay, 10) >= 1 && crdelay != undefined) {
						// Remove quotes
						crmessage = crmessage.replace(/"/g, '');
						crdelay = crdelay.replace(/"/g, '');

						botSettings[guildID].channels = JSON.parse('{"'+channelID+'":{"creminder":{"message":"'+crmessage+'","delay":"'+crdelay+'","current":"'+crdelay+'"}}}');

						fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

						message.channel.send('Will remind users in <#'+channelID+'> every '+crdelay+' messages about "'+crmessage+'"');

						rtrn = 'creminderset';
					} else {
						message.channel.send('Usage: '+botSettings[guildID].prefix+'creminder [message] [delay]');

						rtrn = 'creminderfail';
					}
				} else if (args[0] == 'off') {
					if (channelID in botSettings[guildID].channels) {
						botSettings[guildID].channels = JSON.parse('{"'+channelID+'":{"creminder":{"message":"N/A","delay":"0","current":"0"}}}');

						fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

						message.channel.send('Stopped reminding users in <#'+channelID+'>');

						rtrn = 'creminderoff';
					}
				} else {
					message.channel.send('Usage: '+prefix+'creminder [message] [delay]');

					rtrn = 'creminderex';
				}

				break;
			default:
				message.channel.send('Unrecognized command. Use '+prefix+'help to see a list of commands and their usage');

				rtrn = 'help';
		}

		console.log('Returned '+rtrn+' to '+message.author.username+' ('+message.author.id+')');
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
