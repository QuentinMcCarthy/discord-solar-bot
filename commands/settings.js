const Enmap = require('enmap');

module.exports = {
	name: 'settings',
	description: 'Lists and sets settings for the bot',
	cooldown: 2,
	usage: '[setting]',
	admin: true,
	execute(client, message, args) {
		const guildID = message.guild.id;
		let rtrn = '';

		// Settings are not dynamic due to limitations,
		if (args[0] == 'prefix') {
			if (args[1]) {
				client.settings.set(guildID, args[1], 'prefix');

				message.channel.send('New prefix set as: '+args[1]);

				rtrn = 'prefixset';
			} else {
				message.channel.send('```Setting: prefix\nUsage: '+client.settings.get(guildID, 'prefix')+'settings prefix <newPrefix>\nSet the prefix for bot commands```');

				rtrn = 'prefixhelp';
			}
		} else if (args[0] == 'filter') {
			if (args[1] == 'list') {
				if (client.settings.has(guildID, 'filter.list')) {
					let returnList = 'Filtered Words/Phrases:';

					for (var i = 0; i < client.settings.get(guildID, 'filter.list').length; i++) {
						returnList += '\n'+(i+1)+'. '+client.settings.get(guildID, 'filter.list')[i];
					}

					message.channel.send('```'+returnList+'```');

					rtrn = 'filterlist';
				} else {
					message.channel.send('```Filter Words/Phrases:```');

					rtrn = 'filterlist';
				}
			} else if (args[1] == 'add') {
				let phrase = args[2];

				if (phrase) {
					phrase = phrase.toLowerCase();

					// Find the full string if there's a quotation
					if (args[2].substring(0, 1) == '"' && args[2].substring(args[2].length-1) != '"') {
						for (var i = 3; i < args.length; i++) {
							if (args[i].substring(args[i].length-1) == '"') {
								phrase += ' '+args[i];

								break;
							} else {
								phrase += ' '+args[i];
							}
						}
					}

					// Remove quotes
					phrase = phrase.replace(/"/g, '');

					// Check if the list already exists. If not, create it.
					if (client.settings.has(guildID, 'filter.list')) {
						client.settings.push(guildID, phrase, 'filter.list')
					} else {
						console.log("List getting cleared");
						client.settings.set(guildID, [phrase], 'filter.list')
					}

					message.channel.send('Added "'+phrase+'" to filter list');

					rtrn = 'filteradd';
				} else {
					message.channel.send('```Setting: filter\nUsage: '+client.settings.get(guildID, 'prefix')+'settings filter <list/add/remove/clear> [word/phrase]\nAdd/remove words from the filter list, or list all filter words, or clear the filter list to disable the filter.```');

					rtrn = 'filteraddfail';
				}
			} else if (args[1] == 'remove') {
				let term = args[2];

				if (term) {
					// Find the full string if there's a quotation
					if (args[2].substring(0, 1) == '"' && args[2].substring(args[2].length-1) != '"') {
						for (var i = 3; i < args.length; i++) {
							if (args[i].substring(args[i].length-1) == '"') {
								term += ' '+args[i];

								break;
							} else {
								term += ' '+args[i];
							}
						}
					}

					// Remove quotes
					term = term.replace(/"/g, '');

					// Check if the list exists, if not, inform user
					if (client.settings.has(guildID, 'filter.list')) {
						// Is the term a string or an number
						if(parseInt(term, 10) > 0) {
							// The given index will be higher than the actual index
							term = parseInt(term, 10)-1;

							let tempList = client.settings.get(guildID, 'filter.list');

							// Remove the given index from the array
							let removed = tempList.splice(term, 1);

							message.channel.send('Removed '+removed+' from the filter list');

							client.settings.remove(guildID, removed, 'filter.list');

							rtrn = 'filterremove';
						} else {
							let removed = '';

							// Find and remove the entry from the array
							for(var i = 0; i < client.settings.get(guildID, 'filter.list').length; i++){
								if (client.settings.get(guildID, 'filter.list')[i] == term) {
									removed = client.settings.get(guildID, 'filter.list')[i];

									client.settings.remove(guildID, removed, 'filter.list');

									break;
								}
							}

							if (removed == '') {
								message.channel.send(term+' was not found in the list');

								rtrn = 'filterremovefail';
							} else {
								message.channel.send('Removed '+removed+' from the filter list');

								rtrn = 'filterrremove';
							}
						}
					} else {
						message.channel.send('There are no words being filtered');

						rtrn = 'filterremovefail';
					}
				}
			} else if (args[1] == 'clear') {
				// Set a new array
				client.settings.set(guildID, [], 'filter.list');

				message.channel.send('Filter list cleared');

				rtrn = 'filterclear';
			} else if (args[1] == 'response') {
				let newResponse = args[2];

				if (!newResponse || !newResponse.length) {
					return message.channel.send('The response cannot be blank');
				}

				// Find the full string if there's a quotation
				if (args[2].substring(0, 1) == '"' && args[2].substring(args[3].length-1) != '"') {
					for (var i = 3; i < args.length; i++) {
						if (args[i].substring(args[i].length-1) == '"') {
							newResponse += ' '+args[i];

							break;
						} else {
							newResponse += ' '+args[i];
						}
					}

					// Remove quotes
					newResponse = newResponse.replace(/"/g, '');

					client.settings.set(guildID, newResponse, 'filter.response');

					message.channel.send('Filter response set as: "'+newResponse+'"');

					rtrn = 'filterresponse';
				}
			} else {
				message.channel.send('```Setting: filter\nUsage: '+client.settings.get(guildID, 'prefix')+'settings filter <list/add/remove/clear/response> [word/phrase/id]\nAdd/remove words from the filter list, or list all filter words, or clear the filter list to disable the filter. Response is customisable.```');

				rtrn = 'filterhelp';
			}
		} else if (args[0] == 'adminrole') {
				if (args[1]) {
					let isRoleValid = message.guild.roles.cache.some(role => role.name === args[1]);

					if (!isRoleValid) {
						message.channel.send('That role doesn\'t exist');

						return;
					}

					client.settings.set(guildID, args[1], 'adminrole');

					message.channel.send('New adminrole set as: '+args[1]);

					rtrn = 'adminroleset';
				} else {
					message.channel.send('```Setting: adminrole\nUsage: '+client.settings.get(guildID, 'prefix')+'settings adminrole <newRole>\nSet the Admin role for bot commands. New role must already exist```');

					rtrn = 'adminrolehelp';
				}
		} else {
			message.channel.send('```Settings:\nprefix, filter, adminrole\n\n'+client.settings.get(guildID, 'prefix')+'settings <setting> to see more details```');

			rtrn = 'settingslist';
		}

		console.log('Returned '+rtrn+' to '+message.author.username+' ('+message.author.id+')');
	},
};
