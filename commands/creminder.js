module.exports = {
	name: 'creminder',
	description: 'Reminds users in a channel every set amount of messages of a specified message.',
	usage: '<message/off> [delay]',
	cooldown: 2,
	execute(prefix, message, args) {
		if (args[0] != undefined && args[1] != undefined && typeof args[1] != 'number') {
			let crmessage = args[0];
			let crdelay = args[1];

			// Find the full string if there's a quotation
			if (crmessage.substring(0, 1) == '"' && crmessage.substring(crmessage.length-1) != '"') {
				for (var i = 2; i < args.length; i++) {
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

				botSettings[guildID].channels = JSON.parse('{"'+channelID+'":{"creminder":{"message":"'+crmessage+'","delay":"'+crdelay+'","current":"'+crdelay+'"}}}');

				fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

				message.channel.send('Will remind users in <#'+channelID+'> every '+crdelay+' messages about "'+crmessage+'"');

				rtrn = 'creminderset';
			} else {
				message.channel.send('Usage: '+botSettings[guildID].prefix+'creminder [message] [delay]');

				rtrn = 'creminderfail';
			}
		} else if (args[0] == 'off') {
			if (channelID in botSettings[guildID].channels) {
				botSettings[guildID].channels = JSON.parse('{"'+channelID+'":{"creminder":{"message":"N/A","delay":"0","current":"0"}}}');

				fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

				message.channel.send('Stopped reminding users in <#'+channelID+'>');

				rtrn = 'creminderoff';
			}
		} else {
			message.channel.send('Usage: '+prefix+'creminder [message] [delay]');

			rtrn = 'creminderex';
		}

		console.log('Returned '+rtrn+' to '+message.author.username+' ('+message.author.id+')');
	},
};
