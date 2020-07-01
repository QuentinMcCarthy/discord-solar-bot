const Discord = require('discord.io');
const logger = require('winston');
const fs = require('fs');
const auth = require('./auth.json');

// File paths
const settingsPath = './bot_data/settings.json';

// Configure logger settings
logger.remove(logger.transports.Console);

logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

// Initialize Discord Bot
const bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

// Save settings into a variable from the file
var botSettings = JSON.parse('{}');

// Report initialization
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');

	console.log('\n');

	// Check if the settings file exists and load it up
	if (fs.existsSync(settingsPath)) {
		botSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

		console.log('Settings file successfully loaded');
	} else {
		fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

		console.log('Settings file doesn\'t exist; new file saved');
	}

	// Ensure each guild the bot is in has an entry in settings
	for (var key in bot.servers) {
		if (key in botSettings) {
			console.log(key+' data reported exists');
		} else {
			botSettings[key] = JSON.parse('{"prefix":"!","channels":{},"filter":{}}');

			fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

			console.log('Created guild entry for '+key);
		}
	}

	console.log('\n'+bot.username+' loaded and logged in\n');
});

// On message in the server
bot.on('message', function (user, userID, channelID, message, evt) {
	// Guild ID for where the message came from
	let guildID = evt.d.guild_id;

	// Cancel code execution if it was executed by the bot itself
	// This will prevent loops of the bot talking to itself
	if (userID == bot.id) {
		return;
	}

	if (channelID in botSettings[guildID].channels) {
		let channelSettings = botSettings[guildID].channels[channelID];
		let current = channelSettings.creminder.current;
		let delay = channelSettings.creminder.delay;
		let message = channelSettings.creminder.message;

		if (delay > 0 && message.length > 0) {
			if (current - 1 <= 0) {
				bot.sendMessage({
					to: channelID,
					message: message
				});

				botSettings[guildID].channels[channelID].creminder.current = delay;

				console.log('Reminded users in '+channelID);
			} else {
				botSettings[guildID].channels[channelID].creminder.current = botSettings[guildID].channels[channelID].creminder.current - 1;
			}
		}
	}

	// Listen for messages that start with the prefix, or if the bot is mentioned
	if (message.substring(0, botSettings[guildID].prefix.length) == botSettings[guildID].prefix) {
        let args = message.substring(botSettings[guildID].prefix.length).split(' ');
        let cmd = args[0];

		let rtrn = '';

        switch(cmd) {
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });

				rtrn = 'pong';

	            break;
            // case 'invite':
            //     bot.sendMessage({
            //         to: channelID,
            //         message: bot.inviteurl+auth.perms
            //     });
			//
			// 	rtrn = 'invite url';
			//
	        //     break;
			case 'help':
				if (args[1] == 'ping') {
					bot.sendMessage({
						to: channelID,
						message: 'Command: ping\nUsage: '+botSettings[guildID].prefix+'ping\nPings the bot, used to check if the bot is running properly and to check the command delay'
					});

					rtrn = 'pinghelp';
				} else if (args[1] == 'settings') {
					bot.sendMessage({
						to: channelID,
						message: 'Command: settings\nUsage: '+botSettings[guildID].prefix+'settings [setting] [value]\nLists and sets settings for the bot'
					});

					rtrn = 'settingshelp';
				} else if (args[1] == 'creminder') {
					bot.sendMessage({
						to: channelID,
						message: 'Command: creminder\nUsage: '+botSettings[guildID].prefix+'creminder <message/off> [delay]\nReminds users in a channel every set amount of messages of a specified message. "'+botSettings[guildID].prefix+'creminder off" will disable the reminder'
					});

					rtrn = 'creminderhelp';
				} else {
					bot.sendMessage({
						to: channelID,
						message: 'Commands:\n```General:\nping\n\nAdmin:\nsettings, creminder\n\n'+botSettings[guildID].prefix+'help <command> to see more details```'
					});

					rtrn = 'helplist';
				}

				break;
			case 'settings':
				if (args[1] == 'prefix') {
					if (args[2]) {
						botSettings[guildID].prefix = args[2];

						// Write the settings back into the file
						fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

						bot.sendMessage({
							to: channelID,
							message: 'New Prefix set as: '+args[2]
						});

						rtrn = 'prefixset';
					} else {
						bot.sendMessage({
							to: channelID,
							message: '```Setting: prefix\nUsage: '+botSettings[guildID].prefix+'settings prefix <newPrefix>\nSet the prefix for bot commands```'
						});

						rtrn = 'prefixhelp';
					}
				} else if (args[1] == 'filter') {
					if (args[2] == 'list') {
						if ('list' in botSettings[guildID].filter) {
							let filterList = botSettings[guildID].filter.list;
							let returnList = 'Filtered Words/Phrases:';

							for (var i = 0; i < filterList.length; i++) {
								returnList += '\n'+(i+1)+'. '+filterList[i];
							}

							bot.sendMessage({
								to: channelID,
								message: '```'+returnList+'```'
							});

							rtrn = 'filterlist';
						} else {
							bot.sendMessage({
								to: channelID,
								message: '```Filter Words/Phrases:```'
							});

							rtrn = 'filterlist';
						}
					} else if (args[2] == 'add') {
						let phrase = args[3];

						if (phrase) {
							// Find the full string if there's a quotation
							if (args[3].substring(0, 1) == '"' && args[3].substring(args[3].length-1) != '"') {
								for (var i = 4; i < args.length; i++) {
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

							bot.sendMessage({
								to: channelID,
								message: 'Added "'+phrase+'" to filter list'
							});

							rtrn = 'filteradd';
						} else {
							bot.sendMessage({
								to: channelID,
								message: '```Setting: filter\nUsage: '+botSettings[guildID].prefix+'settings filter <list/add/remove/clear> [word/phrase]\nAdd/remove words from the filter list, or list all filter words, or clear the filter list to disable the filter.```'
							});

							rtrn = 'filteraddfail';
						}
					} else if (args[2] == 'remove') {
						let term = args[3];

						if (term) {
							// Find the full string if there's a quotation
							if (args[3].substring(0, 1) == '"' && args[3].substring(args[3].length-1) != '"') {
								for (var i = 4; i < args.length; i++) {
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

									bot.sendMessage({
										to: channelID,
										message: 'Removed '+removed+' from the filter list'
									});

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
										bot.sendMessage({
											to: channelID,
											message: term+' was not found in the list'
										});

										rtrn = 'filterremovefail';
									} else {
										bot.sendMessage({
											to: channelID,
											message: 'Removed '+removed+' from the filter list'
										});

										fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

										rtrn = 'filterrremove';
									}
								}
							} else {
								bot.sendMessage({
									to: channelID,
									message: 'There are no words being filtered'
								});

								rtrn = 'filterremovefail';
							}
						}
					} else if (args[2] == 'clear') {
						// Set a new array
						botSettings[guildID].filter.list = JSON.parse('[]');

						fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

						bot.sendMessage({
							to: channelID,
							message: 'Filter list cleared'
						});

						rtrn = 'filterclear';
					} else {
						bot.sendMessage({
							to: channelID,
							message: '```Setting: filter\nUsage: '+botSettings[guildID].prefix+'settings filter <list/add/remove/clear> [word/phrase/id]\nAdd/remove words from the filter list, or list all filter words, or clear the filter list to disable the filter.```'
						});

						rtrn = 'filterhelp';
					}
				} else {
					bot.sendMessage({
						to: channelID,
						message: '```General:\nprefix\n\nAdmin:\nfilter\n\n'+botSettings[guildID].prefix+'settings <setting> to see more details```'
					});

					rtrn = 'settingslist';
				}

				break;
			case 'creminder':
				if (args[1] != undefined && args[2] != undefined && typeof args[2] != 'number') {
					let crmessage = args[1];
					let crdelay = args[2];

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

						bot.sendMessage({
							to: channelID,
							message: 'Will remind users in <#'+channelID+'> every '+crdelay+' messages about "'+crmessage+'"'
						});

						rtrn = 'creminderset';
					} else {
						bot.sendMessage({
							to: channelID,
							message: 'Usage: '+botSettings[guildID].prefix+'creminder [message] [delay]'
						});

						rtrn = 'creminderfail';
					}
				} else if (args[1] == 'off') {
					if (channelID in botSettings[guildID].channels) {
						botSettings[guildID].channels = JSON.parse('{"'+channelID+'":{"creminder":{"message":"N/A","delay":"0","current":"0"}}}');

						fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

						bot.sendMessage({
							to: channelID,
							message: 'Stopped reminding users in <#'+channelID+'>'
						});

						rtrn = 'creminderoff';
					}
				} else {
					bot.sendMessage({
						to: channelID,
						message: 'Usage: '+botSettings[guildID].prefix+'creminder [message] [delay]'
					});

					rtrn = 'creminderex';
				}

				break;
			default:
				bot.sendMessage({
					to: channelID,
					message: 'Unrecognized command. Use '+botSettings[guildID].prefix+'help to see a list of commands and their usage'
				});

				rtrn = 'help';
        }

		console.log('Returned '+rtrn+' to '+user+' ('+userID+')');
    } else if (message.split(' ')[0] == '<@!'+bot.id+'>') {
		if (message.split(' ')[1] == 'help') {
			bot.sendMessage({
				to: channelID,
				message: botSettings[guildID].prefix+' is the prefix for the bot. To see the commands list use '+botSettings[guildID].prefix+'help'
			});

			console.log('Returned mentionhelp to '+user+' ('+userID+')');
		}
    }
});