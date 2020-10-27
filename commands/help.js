const Enmap = require('enmap');

module.exports = {
	name: 'help',
	description: 'Lists all commands and info on specific commands',
	usage: '[command]',
	cooldown: 1,
	execute(client, logger, message, args) {
		const data = [];
		const {commands} = client;

		// If no arguments were provided, list all commands
		if (!args.length) {
			data.push('```Commands:');
			data.push(commands.map(command => command.name).join(', '));
			data.push('\nUse '+client.settings.get(message.guild.id, 'prefix')+'help <command> to see more details```');

			logger.log('info', 'Returned commandlist to '+message.author.username+' ('+message.author.id+')');

			return message.channel.send(data, {split:true})
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name);

		// If the command doesn't exist, return an error
		if (!command) {
			logger.log('info', 'Returned nocmd to '+message.author.username+' ('+message.author.id+')');

			return message.channel.send('Unrecognized command. Use '+client.settings.get(message.guild.id, 'prefix')+'help to see a list of commands and their usage')
		}

		data.push(`\`\`\`Command: ${command.name}`);

		// Return the command's usage
		if (command.usage) {
			data.push(`Usage: ${client.settings.get(message.guild.id, 'prefix')}${command.name} ${command.usage}`);
		}
		if (command.description) {
			data.push(`${command.description}\`\`\``);
		}

		message.channel.send(data, {split:true});

		logger.log('info', 'Returned '+command.name+'help to '+message.author.username+' ('+message.author.id+')');
	},
}
