const Enmap = require('enmap');

module.exports = {
	name: 'settings',
	description: 'Lists and sets settings for the bot',
	cooldown: 2,
	usage: '[setting]',
	execute(client, message, args) {
		const guildID = message.guild.id;
		const guildSettings = client.settings.get(guildID);
		let rtrn = '';

		if (args[0] == 'prefix') {
			if (args[1]) {
				client.settings.set(guildID, args[1], 'prefix');

				message.channel.send('New prefix set as: '+args[1]);

				rtrn = 'prefixset';
			} else {
				message.channel.send('```Setting: prefix\nUsage: '+guildSettings.prefix+'settings prefix <newPrefix>\nSet the prefix for bot commands```');

				rtrn = 'prefixhelp';
			}
		} else if (args[0] == 'filter') {
			if (args[1] == 'list') {
				if (client.settings.has('${guildID}.filter.list')) {
					let filterList = guildSettings.filter.list;
					let returnList = 'Filtered Words/Phrases:';

					for (var i = 0; i < filterList.length; i++) {
						returnList += '\n'+(i+1)+'. '+filterList[i];
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

					console.log(client.settings.has('channels'));

					// Check if the list already exists. If not, create it.
					if (client.settings.has(guildID+'.filter.list')) {
						client.settings.push(guildID, phrase, 'filter.list')
					} else {
						console.log("List getting cleared");
						client.settings.set(guildID, [phrase], 'filter.list')
					}

					console.log(client.settings.get(guildID));

					message.channel.send('Added "'+phrase+'" to filter list');

					rtrn = 'filteradd';
				} else {
					message.channel.send('```Setting: filter\nUsage: '+guildSettings.prefix+'settings filter <list/add/remove/clear> [word/phrase]\nAdd/remove words from the filter list, or list all filter words, or clear the filter list to disable the filter.```');

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
					if (client.settings.has('${guildID}.filter.list')) {
						// Is the term a string or an number
						if(parseInt(term, 10) > 0) {
							// The given index will be higher than the actual index
							term = parseInt(term, 10)-1;

							let tempList = guildSettings.filter.list;

							// Remove the given index from the array
							let removed = tempList.splice(term, 1);

							message.channel.send('Removed '+removed+' from the filter list');

							client.settings.remove(guildID, removed, 'filter.list');

							rtrn = 'filterremove';
						} else {
							let removed = '';
							let filterList = guildSettings.filter.list;

							// Find and remove the entry from the array
							for(var i = 0; i < filterList.length; i++){
								if (filterList[i] == term) {
									removed = filterList[i];

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
				client.settings.set(guildID, [], '.filter.list');

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
				}
			} else {
				message.channel.send('```Setting: filter\nUsage: '+guildSettings.prefix+'settings filter <list/add/remove/clear/response> [word/phrase/id]\nAdd/remove words from the filter list, or list all filter words, or clear the filter list to disable the filter. Response is customisable.```');

				rtrn = 'filterhelp';
			}
		} else {
			message.channel.send('```Settings:\nprefix, filter\n\n'+guildSettings.prefix+'settings <setting> to see more details```');

			rtrn = 'settingslist';
		}

		console.log('Returned '+rtrn+' to '+message.author.username+' ('+message.author.id+')');
	},
};
