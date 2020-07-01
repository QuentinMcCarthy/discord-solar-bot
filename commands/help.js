const Enmap = require('enmap');

module.exports = {
	name: 'help',
	description: 'Lists all commands and info on specific commands',
	usage: '[command]',
	cooldown: 1,
	execute(client, message, args) {
		const data = [];
		const {commands} = client;

		if (!args.length) {
			data.push('```Commands:');
			data.push(commands.map(command => command.name).join(', '));
			data.push('\nUse '+client.settings.get(guildID, 'prefix')+'help <command> to see more details```');

			console.log('Returned commandlist to '+message.author.username+' ('+message.author.id+')');

			return message.channel.send(data, {split:true})
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name);

		if (!command) {
			console.log('Returned nocmd to '+message.author.username+' ('+message.author.id+')');

			return message.channel.send('Unrecognized command. Use '+client.settings.get(guildID, 'prefix')+'help to see a list of commands and their usage')
		}

		data.push('Command: '+command.name);

		if (command.usage) {
			data.push('Usage: '+client.settings.get(guildID, 'prefix')+command.name+' '+command.usage);
		}
		if (command.description) {
			data.push(command.description);
		}

		message.channel.send(data, {split:true});

		console.log('Returned '+command.name+'help to '+message.author.username+' ('+message.author.id+')');
	},
}
