module.exports = {
	name: 'reload',
	description: 'Reloads a command, used in dev',
	usage: '<command>',
	cooldown: 2,
	admin: true,
	execute(client, message, args) {
		// Need to specify a command to reload
		if (!args.length) {
			return message.channel.send('You didn\'t pass any command to reload');
		}

		const commandName = args[0].toLowerCase();
		const command = client.commands.get(commandName);

		// If the command doesn't exist, return an error
		if (!command) {
			return message.channel.send(commandName+' is not an existing command');
		}

		// Delete the command from the bot's cache.
		delete require.cache[require.resolve('./'+command.name+'.js')];

		// Try to reload the command.
		try {
			const newCommand = require('./'+command.name+'.js');
			message.client.commands.set(newCommand.name, newCommand);

			message.channel.send(command.name+' successfully reloaded');

			console.log('Reloaded '+command.name);
		} catch (err) {
			console.log(err);
			console.log('Failed to reload '+command.name);

			message.channel.send('There was an error while reloading the command, '+command.name+'; \n'+err.message);
		}
	},
}
