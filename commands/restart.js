module.exports = {
	name: 'restart',
	description: 'Restarts the bot, used in dev. Restricted to dev use only',
	cooldown: 5,
	dev: true,
	execute(client, logger, message, args) {
		message.channel.send('Restarting...');

		logger.log('info', 'Recieved restart command from '+message.author.username+'. Restarting...');

		setTimeout(function(){process.exit()}, 1000);
	},
};
