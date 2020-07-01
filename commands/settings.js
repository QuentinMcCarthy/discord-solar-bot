module.exports = {
	name: 'settings',
	description: 'Lists and sets settings for the bot',
	cooldown: 2,
	usage: '[setting]',
	execute(prefix, message, args) {
		if (args[0] == 'prefix') {
			if (args[1]) {
				botSettings[guildID].prefix = args[1];

				// Write the settings back into the file
				fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

				message.channel.send('New Prefix set as: '+args[1]);

				rtrn = 'prefixset';
			} else {
				message.channel.send('```Setting: prefix\nUsage: '+prefix+'settings prefix <newPrefix>\nSet the prefix for bot commands```');

				rtrn = 'prefixhelp';
			}
		} else if (args[0] == 'filter') {
			if (args[1] == 'list') {
				if ('list' in botSettings[guildID].filter) {
					let filterList = botSettings[guildID].filter.list;
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
					if (args[2].substring(0, 1) == '"' && args[2].substring(args[3].length-1) != '"') {
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
					if ('list' in botSettings[guildID].filter) {
						botSettings[guildID].filter.list.push(phrase);
					} else {
						botSettings[guildID].filter = JSON.parse('{"list":["'+phrase+'"]}')
					}

					fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

					message.channel.send('Added "'+phrase+'" to filter list');

					rtrn = 'filteradd';
				} else {
					message.channel.send('```Setting: filter\nUsage: '+prefix+'settings filter <list/add/remove/clear> [word/phrase]\nAdd/remove words from the filter list, or list all filter words, or clear the filter list to disable the filter.```');

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
					if ('list' in botSettings[guildID].filter) {
						// Is the term a string or an number
						if(parseInt(term, 10) > 0) {
							// The given index will be higher than the actual index
							term = parseInt(term, 10)-1;

							// Remove the given index from the array
							let removed = botSettings[guildID].filter.list.splice(term, 1);

							message.channel.send('Removed '+removed+' from the filter list');

							fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

							rtrn = 'filterremove';
						} else {
							let removed = '';
							let filterList = botSettings[guildID].filter.list;

							// Find and remove the entry from the array
							for(var i = 0; i < filterList.length; i++){
								if (filterList[i] == term) {
									removed = filterList[i];

									botSettings[guildID].filter.list.splice(i, 1);

									break;
								}
							}

							if (removed == '') {
								message.channel.send(term+' was not found in the list');

								rtrn = 'filterremovefail';
							} else {
								message.channel.send('Removed '+removed+' from the filter list');

								fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

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
				botSettings[guildID].filter.list = JSON.parse('[]');

				fs.writeFileSync(settingsPath, JSON.stringify(botSettings));

				message.channel.send('Filter list cleared');

				rtrn = 'filterclear';
			} else {
				message.channel.send('```Setting: filter\nUsage: '+prefix+'settings filter <list/add/remove/clear> [word/phrase/id]\nAdd/remove words from the filter list, or list all filter words, or clear the filter list to disable the filter.```');

				rtrn = 'filterhelp';
			}
		} else {
			message.channel.send('```General:\nprefix\n\nAdmin:\nfilter\n\n'+prefix+'settings <setting> to see more details```');

			rtrn = 'settingslist';
		}

		console.log('Returned '+rtrn+' to '+message.author.username+' ('+message.author.id+')');
	},
};
