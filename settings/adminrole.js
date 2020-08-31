const Enmap = require('enmap');

module.exports = {
	name: 'adminrole',
	description: 'Set the Admin role for bot commands. New role must already exist',
	usage: '<newRole>',
	execute(client, logger, message, args) {
		if (args[0]) {
			let newRole = args[0];

			// Find the full string if there's a quotation
			if (newRole.substring(0, 1) == '"' && newRole.substring(args[1].length - 1) != '"') {
				for (var i = 1; i < args.length; i++) {
					if (args[i].substring(args[i].length - 1) == '"') {
						newRole += ' ' + args[i];

						break;
					} else {
						newRole += ' ' + args[i];
					}
				}
			}

			// Remove quotes
			newRole = newRole.replace(/"/g, '');

			if (message.guild.roles.cache.some(role => role.name === newRole)) {
				client.settings.set(message.guild.id, newRole, 'adminrole');

				message.channel.send('New adminrole set as: '+newRole);

				logger.log('info', 'Returned adminroleset to ' + message.author.username + ' (' + message.author.id + ')');
			} else {
				logger.log('info', 'Returned adminrolesetfail to ' + message.author.username + ' (' + message.author.id + ')')
				message.channel.send('That role doesn\'t exist');
			}
		} else {
			message.channel.send('```Setting: adminrole\nUsage: '+client.settings.get(message.guild.id, 'prefix')+'settings adminrole <newRole>\nSet the Admin role for bot commands. New role must already exist```');

			logger.log('info', 'Returned adminrolehelp to '+message.author.username+' ('+message.author.id+')');
		}
	},
}
