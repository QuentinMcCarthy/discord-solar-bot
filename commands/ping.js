module.exports = {
	name: 'ping',
	description: 'Pings the bot, used to check if the bot is running properly and to check the command delay',
	cooldown: 1,
	execute(client, logger, message, args) {
		// Returned pong may be negative if sent from the system
		let delay = Date.now() - message.createdTimestamp;

		if (delay < 0) {
			message.channel.send('Pong recieved about '+delay+'ms in the past? Well that\'s odd.');

			logger.log('warn', 'Ping returned negative result');
			logger.log('info', 'Returned pong to '+message.author.username+' ('+message.author.id+')');
		} else {
			message.channel.send('Pong recieved after '+(Date.now() - message.createdTimestamp)+'ms');

			logger.log('info', 'Returned pong to '+message.author.username+' ('+message.author.id+')');
		}
	},
};
