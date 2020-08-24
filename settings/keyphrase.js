const Enmap = require('enmap');

module.exports = {
    name: 'keyphrase',
    description: 'Set keyphrases to add/remove roles from users.',
    usage: '<list/add/remove> [keyphrase] [add/remove] [role]',
    execute(client, logger, message, args) {
        if (args[0] == 'list') {
            if (client.settings.has(message.guild.id, 'keyphrases')) {
                let returnList = 'Keyphrases:';

                if (client.settings.has(message.guild.id, 'keyphrases')) {
                    client.settings.get(message.guild.id, 'keyphrases').forEach(keyphrase => {
                        if (keyphrase.add) {
                            returnList += `\n${keyphrase.phrase}: Adds ${keyphrase.add}`;
                        } else if (keyphrase.remove) {
                            returnList += `\n${keyphrase.phrase}: Removes ${keyphrase.remove}`;
                        } else {
                            logger.log('error', 'Keyphrase "'+keyphrase.phrase+'" has no add/remove!');
                        }
                    });
                }

                // Working here

                if (client.settings.has(message.guild.id, 'keywords.add')) {
                    for (var i = 0; i < client.settings.get(message.guild.id, 'keywords.add').length; i++) {
                        returnList += '\n' + (i + 1) + '. ' + client.settings.get(message.guild.id, 'keywords.add')[i];
                    }
                }

                returnList += '\n\nRemove:';

                if (client.settings.has(message.guild.id, 'keywords.remove')) {
                    for (var i = 0; i < client.settings.get(message.guild.id, 'keywords.remove').length; i++) {
                        returnList += '\n' + (i + 1) + '. ' + client.settings.get(message.guild.id, 'keywords.remove')[i];
                    }
                }

                message.channel.send('```' + returnList + '```');

                logger.log('info', 'Returned filterlist to ' + message.author.username + ' (' + message.author.id + ')');
            } else {
                message.channel.send('```Keywords:\nAdd:\n\nRemove:```');

                logger.log('info', 'Returned filterlist to ' + message.author.username + ' (' + message.author.id + ')');
            }
        } else if (args[0] == 'add') {
            let phrase = args[1];

            if (phrase) {
                phrase = phrase.toLowerCase();

                let hasQuotes = false;

                // The phrase must be surrounded by quotes
                if (args[1].substring(0, 1) == '"') {
                    hasQuotes = true;

                    if (args[1].substring(args[1].length - 1) != '"') {
                        for (var i = 3; i < args.length; i++) {
                            if (args[i].substring(args[i].length - 1) == '"') {
                                phrase += ' ' + args[i];

                                break;
                            } else {
                                phrase += ' ' + args[i];
                            }
                        }
                    }
                }

                if (hasQuotes) {
                    // Remove the quotes
                    phrase = phrase.replace(/"/g, '');

                    if (args[2] == 'add') {
                        if (client.settings.has(message.guild.id, 'keywords.add')) {
                            client.settings.push(message.guild.id, phrase, 'keywords.add');
                        } else {
                            logger.log('info', 'Keyword add list being created');
                            client.settings.set(message.guild.id, [phrase], 'keywords.add');
                        }


                    } else if (args[2] == 'remove') {

                    }
                }

                // Check if the list already exists. If not, create it.
                if (client.settings.has(message.guild.id, 'filter.list')) {
                    client.settings.push(message.guild.id, phrase, 'filter.list')
                } else {
                    logger.log('info', "List getting cleared");
                    client.settings.set(message.guild.id, [phrase], 'filter.list')
                }

                message.channel.send('Added "' + phrase + '" to filter list');

                logger.log('info', 'Returned filteradd to ' + message.author.username + ' (' + message.author.id + ')');
            } else {
                message.channel.send('```Setting: filter\nUsage: ' + client.settings.get(message.guild.id, 'prefix') + 'settings filter <list/add/remove/clear> [word/phrase]\nAdd/remove words from the filter list, or list all filter words, or clear the filter list to disable the filter.```');

                logger.log('info', 'Returned filteraddfail to ' + message.author.username + ' (' + message.author.id + ')');
            }
        }
    },
}