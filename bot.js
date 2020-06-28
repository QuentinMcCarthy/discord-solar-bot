const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const settings = require('./bot_data/settings.json');

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

	console.log("\n"+bot.username+" loaded and logged in\n");
});

// On message in the server
bot.on('message', function (user, userID, channelID, message, evt) {
    // Listen for messages starting with '!'
    if (message.substring(0, 1) == '!') {
        let args = message.substring(1).split(' ');
        let cmd = args[0];

		let rtrn = "";

        // args = args.splice(1);
        switch(cmd) {
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });

				rtrn = "pong";

	            break;
            case 'invite':
                bot.sendMessage({
                    to: channelID,
                    message: bot.inviteurl+auth.perms
                });

				rtrn = "invite url";

	            break;
			case 'commands':
				bot.sendMessage({
					to: channelID,
					message: 'Commands:\n```General:\nping, invite, commands, date\n\nDebug:\nchannel, mention```'
				});

				rtrn = "commandlist";

				break;
			case 'date':
				var baseDate = new Date();

				bot.sendMessage({
					to: channelID,
					message: 'The date is: '+baseDate
				});

				rtrn = "date";

				break;
			case 'channel':
				bot.sendMessage({
					to: channelID,
					message: 'The ID for <#'+channelID+'> is: '+channelID
				});

				rtrn = "channel ID";

				break;
			case 'mention':
				bot.sendMessage({
					to: channelID,
					message: '<@'+userID+'>'
				});

				rtrn = "mention";

				break;
			case 'say':
				let msgA = message.split(' ');
				msgA.splice(0, 1);

				let msg = "";

				for(var i = 0; i < msgA.length; i++){
					msg += msgA[i]+" ";
				}

				bot.sendMessage({
					to: channelID,
					message: msg
				});

				rtrn = "message";

				break;
         }

		 //console.log("Returned "+rtrn+" to "+user+" ("+userID+") in "+guild.id);
		 console.log(bot);
     } else {

     }
});
