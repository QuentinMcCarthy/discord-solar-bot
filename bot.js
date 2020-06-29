const Discord = require('discord.io');
const logger = require('winston');
const fs = require('fs');
const auth = require('./auth.json');

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

// Report initialization
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');

	console.log('\n');

	// Check if each guild has a folder for data
	for(var key in bot.servers){
		if (fs.existsSync('./guild_data/'+key)) {
			console.log(key+' data reported exists');
		} else {
			fs.mkdirSync('./guild_data/'+key);
			fs.writeFileSync('./guild_data/'+key+'/settings.json', '{"prefix":"!","channels":{}}');

			console.log('Created guild dir for '+key+' and necessary files');
		}
	}

	console.log('\n'+bot.username+' loaded and logged in\n');
});

// On message in the server
bot.on('message', function (user, userID, channelID, message, evt) {
	// Get the settings for the message's guild
	let guildID = evt.d.guild_id;
	let guildSettings = JSON.parse(fs.readFileSync('./guild_data/'+guildID+'/settings.json', 'utf-8'));

	// Listen for messages that start with the prefix
	if (message.substring(0, 1) == guildSettings.prefix) {
        let args = message.substring(1).split(' ');
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
						message: 'Command: ping\nUsage: '+guildSettings.prefix+'ping\nPings the bot, used to check if the bot is running properly and to check the command delay'
					});

					rtrn = 'pinghelp';
				} else if (args[1] == 'settings') {
					bot.sendMessage({
						to: channelID,
						message: 'Command: settings\nUsage: '+guildSettings.prefix+'settings [setting] [value]\nLists and sets settings for the bot'
					});

					rtrn = 'settingshelp';
				} else if (args[1] == 'creminder') {
					bot.sendMessage({
						to: channelID,
						message: 'Command: creminder\nUsage: '+guildSettings.prefix+'creminder [message] [delay]\nReminds users in a channel every set amount of messages of a specified message'
					});

					rtrn = 'creminderhelp';
				} else {
					bot.sendMessage({
						to: channelID,
						message: 'Commands:\n```General:\nping\n\nAdmin:\nsettings, creminder\n\n'+guildSettings.prefix+'help <command> to see more details```'
					});

					rtrn = 'helplist';
				}

				break;
			case 'settings':
				if (args[1] == 'prefix') {
					if (args[2]) {
						guildSettings.prefix = args[2];

						// Write the settings back into the file
						fs.writeFileSync('./guild_data/'+guildID+'/settings.json', JSON.stringify(guildSettings));

						bot.sendMessage({
							to: channelID,
							message: 'New Prefix set as: '+args[2]
						});

						rtrn = 'prefixset';
					} else {
						bot.sendMessage({
							to: channelID,
							message: '```Setting: prefix\nUsage: '+guildSettings.prefix+'settings prefix <newPrefix>\nSet the prefix for bot commands```'
						});

						rtrn = 'prefixhelp';
					}
				} else {
					bot.sendMessage({
						to: channelID,
						message: '```General:\nprefix\nAdmin:\n\n'+guildSettings.prefix+'settings <setting> to see more details```'
					});

					rtrn = 'settingslist';
				}

				break;
			case 'creminder':
				if (args[1] != undefined && args[2] != undefined && typeof args[2] != 'number'){
					let rrmessage = args[1];
					let rrdelay = args[2];

					// Find the full string if there's a quotation
					if (rrmessage.substring(0, 1) == '"' && rrmessage.substring(rrmessage.length-1) != '"') {
						for (var i = 2; i < args.length; i++) {
							if (args[i].substring(args[i].length-1) == '"') {
								rrmessage += ' '+args[i];
								rrdelay = args[i+1];

								break;
							} else {
								rrmessage += ' '+args[i];
								rrdelay = args[i+1];
							}
						}
					}

					// Ensure that everything is correct
					if (parseInt(rrdelay, 10) != 0 && rrdelay != undefined) {
						// Remove quotes
						rrmessage = rrmessage.replace(/"/g, '');
						rrdelay = rrdelay.replace(/"/g, '');

						guildSettings.channels = JSON.parse('{"'+channelID+'":{"creminder":{"message":"'+rrmessage+'","delay":"'+rrdelay+'"}}}');

						fs.writeFileSync('./guild_data/'+guildID+'/settings.json', JSON.stringify(guildSettings));

						bot.sendMessage({
							to: channelID,
							message: 'Will remind users in <#'+channelID+'> every '+rrdelay+' messages about "'+rrmessage+'"'
						});

						rtrn = 'creminderset';
					} else {
						bot.sendMessage({
							to: channelID,
							message: 'Usage: '+guildSettings.prefix+'creminder [message] [delay]'
						});

						rtrn = 'creminderfail';
					}
				} else {
					bot.sendMessage({
						to: channelID,
						message: 'Usage: '+guildSettings.prefix+'creminder [message] [delay]'
					});

					rtrn = 'creminderex';
				}

				break;
			default:
				bot.sendMessage({
					to: channelID,
					message: 'Unrecognized command. Use '+guildSettings.prefix+'help to see a list of commands and their usage'
				});

				rtrn = 'help';
         }

		 console.log('Returned '+rtrn+' to '+user+' ('+userID+')');
     } else {

     }
});
