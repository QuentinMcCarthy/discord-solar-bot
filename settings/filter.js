const Enmap = require('enmap');

module.exports = {
	name: 'filter',
	description: 'Add/remove words from the filter list, or list all filter words, or clear the filter list to disable the filter, or change the response.',
	usage: '<list/add/remove/clear/response> [word/phrase]',
	execute(client, logger, message, args) {
		if (args[0] == 'list') {
			if (client.settings.has(message.guild.id, 'filter.list')) {
				let returnList = 'Filtered Words/Phrases:';

				for (var i = 0; i < client.settings.get(message.guild.id, 'filter.list').length; i++) {
					returnList += '\n'+(i+1)+'. '+client.settings.get(message.guild.id, 'filter.list')[i];
				}

				message.channel.send('```'+returnList+'```');

				logger.log('info', 'Returned filterlist to '+message.author.username+' ('+message.author.id+')');
			} else {
				message.channel.send('```Filter Words/Phrases:```');

				logger.log('info', 'Returned filterlist to '+message.author.username+' ('+message.author.id+')');
			}
		} else if (args[0] == 'add') {
			let phrase = args[1];

			if (phrase) {
				phrase = phrase.toLowerCase();

				// Find the full string if there's a quotation
				if (args[1].substring(0, 1) == '"' && args[1].substring(args[1].length-1) != '"') {
					for (var i = 2; i < args.length; i++) {
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
				if (client.settings.has(message.guild.id, 'filter.list')) {
					client.settings.push(message.guild.id, phrase, 'filter.list')
				} else {
					logger.log('info', "List getting cleared");
					client.settings.set(message.guild.id, [phrase], 'filter.list')
				}

				message.channel.send('Added "'+phrase+'" to filter list');

				logger.log('info', 'Returned filteradd to '+message.author.username+' ('+message.author.id+')');
			} else {
				message.channel.send(`\`\`\`Setting: ${this.name}\nUsage: ${client.settings.get(message.guild.id, 'prefix')}settings ${this.name} ${this.usage}\n${this.description}\`\`\``);

				logger.log('info', 'Returned filteraddfail to '+message.author.username+' ('+message.author.id+')');
			}
		} else if (args[0] == 'remove') {
			let term = args[1];

			if (term) {
				// Find the full string if there's a quotation
				if (args[1].substring(0, 1) == '"' && args[1].substring(args[1].length-1) != '"') {
					for (var i = 2; i < args.length; i++) {
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
				if (client.settings.has(message.guild.id, 'filter.list')) {
					// Is the term a string or an number
					if(parseInt(term, 10) > 0) {
						// The given index will be higher than the actual index
						term = parseInt(term, 10)-1;

						let tempList = client.settings.get(message.guild.id, 'filter.list');

						// Remove the given index from the array
						let removed = tempList.splice(term, 1);

						message.channel.send('Removed '+removed+' from the filter list');

						client.settings.remove(message.guild.id, removed, 'filter.list');

						logger.log('info', 'Returned filterremove to '+message.author.username+' ('+message.author.id+')');
					} else {
						let removed = '';

						// Find and remove the entry from the array
						for(var i = 0; i < client.settings.get(message.guild.id, 'filter.list').length; i++){
							if (client.settings.get(message.guild.id, 'filter.list')[i] == term) {
								removed = client.settings.get(message.guild.id, 'filter.list')[i];

								client.settings.remove(message.guild.id, removed, 'filter.list');

								break;
							}
						}

						if (removed == '') {
							message.channel.send(term+' was not found in the list');

							logger.log('info', 'Returned filterremovefail to '+message.author.username+' ('+message.author.id+')');
						} else {
							message.channel.send('Removed '+removed+' from the filter list');

							logger.log('info', 'Returned filterremove to '+message.author.username+' ('+message.author.id+')');
						}
					}
				} else {
					message.channel.send('There are no words being filtered');

					logger.log('info', 'Returned filterremovefail to '+message.author.username+' ('+message.author.id+')');
				}
			}
		} else if (args[0] == 'clear') {
			// Set a new array
			client.settings.set(message.guild.id, [], 'filter.list');

			message.channel.send('Filter list cleared');

			logger.log('info', 'Returned filterclear to '+message.author.username+' ('+message.author.id+')');
		} else if (args[0] == 'response') {
			let newResponse = args[1];

			if (!newResponse || !newResponse.length) {
				return message.channel.send('The response cannot be blank');
			}

			// Find the full string if there's a quotation
			if (args[1].substring(0, 1) == '"' && args[1].substring(args[2].length-1) != '"') {
				for (var i = 2; i < args.length; i++) {
					if (args[i].substring(args[i].length-1) == '"') {
						newResponse += ' '+args[i];

						break;
					} else {
						newResponse += ' '+args[i];
					}
				}

				// Remove quotes
				newResponse = newResponse.replace(/"/g, '');

				client.settings.set(message.guild.id, newResponse, 'filter.response');

				message.channel.send('Filter response set as: "'+newResponse+'"');

				logger.log('info', 'Returned filterresponse to '+message.author.username+' ('+message.author.id+')');
			}
		} else {
			message.channel.send(`\`\`\`Setting: ${this.name}\nUsage: ${client.settings.get(message.guild.id, 'prefix')}settings ${this.name} ${this.usage}\n${this.description}\`\`\``);

			logger.log('info', 'Returned filterhelp to '+message.author.username+' ('+message.author.id+')');
		}
	},
}
