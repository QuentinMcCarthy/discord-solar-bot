module.exports = {
	name: 'restart',
	description: 'Restarts the bot, used in dev. Restricted to dev use only',
	cooldown: 5,
	dev: true,
	execute(client, logger, message, args) {
		logger.log('debug', 'Bot restart command received, restarting...');

		process.exit();
	},
};
