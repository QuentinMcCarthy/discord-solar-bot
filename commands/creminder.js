const Enmap = require('enmap');

module.exports = {
	name: 'creminder',
	description: 'Reminds users in a channel every set amount of messages of a specified message.',
	usage: '<message/off> [delay]',
	cooldown: 2,
	admin: true,
	execute(client, logger, message, args) {
		const guildID = message.guild.id;
		var rtrn = '';

		if (args[0] != undefined && args[1] != undefined && typeof args[1] != 'number') {
			let crmessage = args[0];
			let crdelay = args[1];

			// Find the full string if there's a quotation
			if (crmessage.substring(0, 1) == '"' && crmessage.substring(crmessage.length-1) != '"') {
				for (var i = 1; i < args.length; i++) {
					if (args[i].substring(args[i].length-1) == '"') {
						crmessage += ' '+args[i];
						crdelay = args[i+1];

						break;
					} else {
						crmessage += ' '+args[i];
						crdelay = args[i+1];
					}
				}
			}

			// Ensure that everything is correct
			if (parseInt(crdelay, 10) >= 1 && crdelay != undefined) {
				// Remove quotes
				crmessage = crmessage.replace(/"/g, '');
				crdelay = crdelay.replace(/"/g, '');

				client.settings.set(guildID, crmessage, 'channels.'+message.channel.id+'.creminder.message');
				client.settings.set(guildID, crdelay, 'channels.'+message.channel.id+'.creminder.delay');
				client.settings.set(guildID, crdelay, 'channels.'+message.channel.id+'.creminder.current');

				message.channel.send('Will remind users in <#'+message.channel.id+'> every '+crdelay+' messages about "'+crmessage+'"');

				rtrn = 'creminderset';
			} else {
				message.channel.send(`\`\`\`Command: ${this.name}\nUsage: ${client.settings.get(message.guild.id, 'prefix')}${this.name} ${this.usage}\n${this.description}\`\`\``);

				rtrn = 'creminderfail';
			}
		} else if (args[0] == 'off') {
			if (client.settings.has(guildID, 'channels.' + message.channel.id + 'creminder')) {
				client.settings.set(guildID, 'N/A', 'channels.'+message.channel.id+'.creminder.message');
				client.settings.set(guildID, '0', 'channels.'+message.channel.id+'.creminder.delay');
				client.settings.set(guildID, '0', 'channels.'+message.channel.id+'.creminder.current');

				message.channel.send('Stopped reminding users in <#'+message.channel.id+'>');

				rtrn = 'creminderoff';
			} else {
				message.channel.send('No reminders set for this channel');

				rtrn = 'creminderfail'
			}
		} else {
			message.channel.send(`\`\`\`Command: ${this.name}\nUsage: ${client.settings.get(message.guild.id, 'prefix')}${this.name} ${this.usage}\n${this.description}\`\`\``);

			rtrn = 'creminderex';
		}

		logger.log('info', 'Returned '+rtrn+' to '+message.author.username+' ('+message.author.id+')');
	},
};
