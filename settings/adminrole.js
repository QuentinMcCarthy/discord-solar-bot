const Enmap = require('enmap');

module.exports = {
	name: 'adminrole',
	description: 'Set the Admin role for bot commands. New role must already exist',
	usage: '<newRole>',
	execute(client, message, args) {
		if (args[0]) {
			let isRoleValid = message.guild.roles.cache.some(role => role.name === args[0]);

			if (!isRoleValid) {
				message.channel.send('That role doesn\'t exist');

				return;
			}

			client.settings.set(message.guild.id, args[0], 'adminrole');

			message.channel.send('New adminrole set as: '+args[0]);

			console.log('Returned adminroleset to '+message.author.username+' ('+message.author.id+')');
		} else {
			message.channel.send('```Setting: adminrole\nUsage: '+client.settings.get(message.guild.id, 'prefix')+'settings adminrole <newRole>\nSet the Admin role for bot commands. New role must already exist```');

			console.log('Returned adminrolehelp to '+message.author.username+' ('+message.author.id+')');
		}
	},
}
