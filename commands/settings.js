module.exports = {
	name: 'settings',
	description: 'Lists and sets settings for the bot',
	cooldown: 2,
	usage: '[setting]',
	admin: true,
	execute(client, message, args) {
		// If this file does not exist in the commands folder
		// The command will not appear in the command list
		// and the functions will not fire

		// This is not a bug, it's a feature.
	},
};
