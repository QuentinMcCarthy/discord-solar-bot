module.exports = {
	name: 'reload',
	description: 'Reloads a command, used in dev',
	execute(prefix, message, args) {
		if (!args.length) {
			return message.channel.send('You didn\'t pass any command to reload');
		}

		const commandName = args[0].toLowerCase();
		const command = message.client.commands.get(commandName);

		if (!command) {
			return message.channel.send(commandName+' is not an existing command');
		}

		delete require.cache[require.resolve('./'+command.name+'.js')];

		try {
			const newCommand = require('./'+command.name+'.js');
			message.client.commands.set(newCommand.name, newCommand);

			message.channel.send(command.name+' successfully reloaded');
		} catch (err) {
			console.log(err);

			message.channel.send('There was an error while reloading the command, '+command.name+'; \n'+err.message);
		}
	},
}
