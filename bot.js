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
			fs.writeFileSync('./guild_data/'+key+'/settings.json', '{"prefix": "!"}');

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
			case 'commands':
				bot.sendMessage({
					to: channelID,
					message: 'Commands:\n```General:\nping\n\nAdmin:\nsettings```'
				});

				rtrn = 'commandlist';

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
							message: '```Setting: Prefix\nUsage: '+guildSettings.prefix+'settings prefix <newPrefix>\nThe prefix is the character(s) used at the start of a command to get the bot to listen.```'
						});

						rtrn = 'prefixhelp';
					}
				} else {
					bot.sendMessage({
						to: channelID,
						message: '```General:\nprefix\n\n'+guildSettings.prefix+'settings <setting> to see more details```'
					});

					rtrn = 'settingslist';
				}

				break;
         }

		 console.log('Returned '+rtrn+' to '+user+' ('+userID+')');
     } else {

     }
});
