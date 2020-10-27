module.exports = {
	name: 'prefix',
	description: 'Set the prefix for bot commands',
	usage: '<newPrefix>',
	execute(client, logger, message, args) {
		if (args[0]) {
			client.settings.set(message.guild.id, args[0], 'prefix');

			message.channel.send('New prefix set as: '+args[0]);

			logger.log('info', 'Returned prefixset to '+message.author.username+' ('+message.author.id+')');
		} else {
			message.channel.send(`\`\`\`Setting: ${this.name}\nUsage: ${client.settings.get(message.guild.id, 'prefix')}settings ${this.name} ${this.usage}\n${this.description}\`\`\``);

			logger.log('info', 'Returned prefixhelp to '+message.author.username+' ('+message.author.id+')');
		}
	},
}
