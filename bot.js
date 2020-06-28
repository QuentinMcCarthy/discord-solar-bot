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
			fs.writeFileSync('./guild_data/'+key+'/settings.json', '{\n\t"prefix": "!"\n}');

			console.log('Created guild dir for '+key+' and necessary files');
		}
	}

	console.log('\n'+bot.username+' loaded and logged in\n');
});

// On message in the server
bot.on('message', function (user, userID, channelID, message, evt) {
    // Listen for messages starting with '!'
    if (message.substring(0, 1) == '!') {
        let args = message.substring(1).split(' ');
        let cmd = args[0];

		let rtrn = ';

        // args = args.splice(1);
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
					message: 'Commands:\n```General:\nping```'
				});

				rtrn = 'commandlist';

				break;
			case 'settings':
				bot.sendMessage({
					to: channelID,
					message: '```Settings:\nPrefix: ```'
				});

				break;
         }

		 console.log('Returned '+rtrn+' to '+user+' ('+userID+')');
     } else {

     }
});
