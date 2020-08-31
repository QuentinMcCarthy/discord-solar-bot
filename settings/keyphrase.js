const Enmap = require('enmap');

module.exports = {
    name: 'keyphrase',
    description: 'Set keyphrases to add/remove roles from users.',
    usage: '<list/add/remove> "[keyphrase]" [add/remove] [role]',
    execute(client, logger, message, args) {
        if (args[0] == 'list') {
            if (client.settings.has(message.guild.id, 'keyphrases')) {
                let returnList = 'Keyphrases:';

                for (var i = 0; i < client.settings.get(message.guild.id, 'keyphrases').length; i++) {
                    let phrase = i+'. '+client.settings.get(message.guild.id, 'keyphrases')[i].phrase;
                    let add = client.settings.get(message.guild.id, 'keyphrases')[i].add;
                    let remove = client.settings.get(message.guild.id, 'keyphrases')[i].remove;

                    if (add) {
                        returnList += `\n${phrase}: Adds '${add}'`;
                    } else if (remove) {
                        returnList += `\n${phrase}: Removes '${remove}'`;
                    } else {
                        returnList += `\n${phrase}: ERR_NO_ENTRY`;
                        logger.log('error', 'Keyphrase "' + keyphrase.phrase + '" has no add/remove!');
                    }
                }

                message.channel.send('```' + returnList + '```');

                logger.log('info', 'Returned filterlist to ' + message.author.username + ' (' + message.author.id + ')');
            } else {
                message.channel.send('```Keyphrases:```');

                logger.log('info', 'Returned filterlist to ' + message.author.username + ' (' + message.author.id + ')');
            }
        } else if (args[0] == 'add') {
            let phrase = args[1];

            if (phrase) {
                phrase = phrase.toLowerCase();

                let hasQuotes = false;
                let endingArg = 1;

                // The phrase must be surrounded by quotes
                if (args[1].substring(0, 1) == '"') {
                    hasQuotes = true;

                    if (args[1].substring(args[1].length - 1) != '"') {
                        for (var i = 2; i < args.length; i++) {
                            if (args[i].substring(args[i].length - 1) == '"') {
                                phrase += ' ' + args[i];

                                endingArg = i;

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

                    if (args[endingArg+1] == 'add') {
                        let roleName = args[endingArg + 2];

                        if (args[endingArg + 2].substring(0, 1) == '"' && args[endingArg + 2].substring(args[endingArg + 2].length - 1) != '"') {
                            for (var i = endingArg+3; i < args.length; i++) {
                                if (args[i].substring(args[i].length - 1) == '"') {
                                    roleName += ' ' + args[i];
                                    
                                    endingArg = i;

                                    break;
                                } else {
                                    phrase += ' ' + args[i];
                                }
                            }
                        }

                        if (guild.roles.cache.some(role => role.name === roleName)) {
                            let obj = {phrase: phrase, add: roleName};

                            if (client.settings.has(message.guild.id, 'keyphrases')) {
                                client.settings.push(message.guild.id, obj, 'keyphrases');
                            } else {
                                logger.log('info', 'Keyphrases list being created');
                                client.settings.set(message.guild.id, [obj], 'keyphrases');
                            }
                        } else {
                            logger.log('info', 'Returned keyphraseaddfail to ' + message.author.username + ' (' + message.author.id + ')')
                            message.channel.send("That role doesn't exist");
                        }
                        // Working here
                    } else if (args[2] == 'remove') {
                        let roleName = args[endingArg + 2];

                        if (args[endingArg + 2].substring(0, 1) == '"' && args[endingArg + 2].substring(args[endingArg + 2].length - 1) != '"') {
                            for (var i = endingArg + 3; i < args.length; i++) {
                                if (args[i].substring(args[i].length - 1) == '"') {
                                    roleName += ' ' + args[i];

                                    endingArg = i;

                                    break;
                                } else {
                                    phrase += ' ' + args[i];
                                }
                            }
                        }

                        if (guild.roles.cache.some(role => role.name === roleName)) {
                            let obj = {phrase: phrase, remove: roleName};

                            if (client.settings.has(message.guild.id, 'keyphrases')) {
                                client.settings.push(message.guild.id, obj, 'keyphrases');
                            } else {
                                logger.log('info', 'Keyphrases list being created');
                                client.settings.set(message.guild.id, [obj], 'keyphrases');
                            }
                        } else {
                            logger.log('info', 'Returned keyphraseaddfail to ' + message.author.username + ' (' + message.author.id + ')')
                            message.channel.send("That role doesn't exist");
                        }
                    }
                }
            } else {
                message.channel.send('```Setting: filter\nUsage: ' + client.settings.get(message.guild.id, 'prefix') + 'settings filter <list/add/remove/clear> [word/phrase]\nAdd/remove words from the filter list, or list all filter words, or clear the filter list to disable the filter.```');

                logger.log('info', 'Returned filteraddfail to ' + message.author.username + ' (' + message.author.id + ')');
            }
        } else if (args[0] == 'remove') {
            let term = args[1];

            if (term) {
                // Find the full string if there's a quotation
                if (args[1].substring(0, 1) == '"' && args[1].substring(args[1].length - 1) != '"') {
                    for (var i = 2; i < args.length; i++) {
                        if (args[i].substring(args[i].length - 1) == '"') {
                            term += ' ' + args[i];

                            break;
                        } else {
                            term += ' ' + args[i];
                        }
                    }
                }

                // Remove quotes
                term = term.replace(/"/g, '');

                // Check if the list exists, if not, inform user
                if (client.settings.has(message.guild.id, 'keyphrases')) {
                    // Is the term a string or an number
                    if (parseInt(term, 10) > 0) {
                        term = parseInt(term, 10);

                        let tempList = client.settings.get(message.guild.id, 'keyphrases');

                        // Remove the given index from the array
                        let removed = tempList.splice(term, 1);

                        message.channel.send('Removed ' + removed + ' from the keyphrase list');

                        client.settings.remove(message.guild.id, removed, 'keyphrases');

                        logger.log('info', 'Returned keyphraseremove to ' + message.author.username + ' (' + message.author.id + ')');
                    } else {
                        let removed = '';

                        // Find and remove the entry from the array
                        for (var i = 0; i < client.settings.get(message.guild.id, 'keyphrases').length; i++) {
                            if (client.settings.get(message.guild.id, 'keyphrases')[i] == term) {
                                removed = client.settings.get(message.guild.id, 'keyphrases')[i];

                                client.settings.remove(message.guild.id, removed, 'keyphrases');

                                break;
                            }
                        }

                        if (removed == '') {
                            message.channel.send(term + ' was not found in the list');

                            logger.log('info', 'Returned keyphraseremovefail to ' + message.author.username + ' (' + message.author.id + ')');
                        } else {
                            message.channel.send('Removed ' + removed + ' from the keyphrase list');

                            logger.log('info', 'Returned keyphraseremove to ' + message.author.username + ' (' + message.author.id + ')');
                        }
                    }
                } else {
                    message.channel.send('There are no keyphrases');

                    logger.log('info', 'Returned keyphraseremovefail to ' + message.author.username + ' (' + message.author.id + ')');
                }
            }
        }
    },
}