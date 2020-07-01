module.exports = {
	name: 'help',
	description: 'Lists all commands and info on specific commands',
	usage: '[command]',
	cooldown: 1,
	execute(prefix, message, args) {
		const data = [];
		const {commands} = message.client;

		if (!args.length) {
			data.push('```Commands:');
			data.push(commands.map(command => command.name).join(', '));
			data.push('\nUse '+prefix+'help <command> to see more details```');

			return message.channel.send(data, {split:true})
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name);

		if (!command) {
			return message.channel.send('Unrecognized command. Use '+prefix+'help to see a list of commands and their usage')
		}

		data.push('Command: '+command.name);

		if (command.usage) {
			data.push('Usage: '+prefix+command.name+' '+command.usage);
		}
		if (command.description) {
			data.push(command.description);
		}

		message.channel.send(data, {split:true});

		console.log('Returned '+rtrn+' to '+message.author.username+' ('+message.author.id+')');
	},
}
