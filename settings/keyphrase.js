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
                    let phrase = (i+1)+'. '+client.settings.get(message.guild.id, 'keyphrases')[i].phrase;
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

                logger.log('info', 'Returned keyphraselist to ' + message.author.username + ' (' + message.author.id + ')');
            } else {
                message.channel.send('```Keyphrases:```');

                logger.log('info', 'Returned keyphraselist to ' + message.author.username + ' (' + message.author.id + ')');
            }
        } else if (args[0] == 'add') {
            let phrase = args[1];

            if (phrase) {
                phrase = phrase;

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
                        if (args[endingArg + 2]) {
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

                            if (message.guild.roles.cache.some(role => role.name === roleName)) {
                                let obj = { phrase: phrase, add: roleName };

                                if (client.settings.has(message.guild.id, 'keyphrases')) {
                                    client.settings.push(message.guild.id, obj, 'keyphrases');
                                } else {
                                    logger.log('info', 'Keyphrases list being created');
                                    client.settings.set(message.guild.id, [obj], 'keyphrases');
                                }

                                message.channel.send(`Phrase "${phrase}" will give role "${roleName}"`);
                            } else {
                                logger.log('info', 'Returned keyphraseaddfail to ' + message.author.username + ' (' + message.author.id + ')')
                                message.channel.send("That role doesn't exist");
                            }
                        } else {
                            message.channel.send(`\`\`\`Setting: ${this.name}\nUsage: ${client.settings.get(message.guild.id, 'prefix')}settings ${this.name} ${this.usage}\n${this.description}\`\`\``);

                            logger.log('info', 'Returned keyphraseaddfail to ' + message.author.username + ' (' + message.author.id + ')');
                        }
                    } else if (args[2] == 'remove') {
                        if (args[endingArg + 2]) {
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

                            if (message.guild.roles.cache.some(role => role.name === roleName)) {
                                let obj = {phrase: phrase, remove: roleName};

                                if (client.settings.has(message.guild.id, 'keyphrases')) {
                                    client.settings.push(message.guild.id, obj, 'keyphrases');
                                } else {
                                    logger.log('info', 'Keyphrases list being created');
                                    client.settings.set(message.guild.id, [obj], 'keyphrases');
                                }

                                message.channel.send(`Phrase "${phrase}" will remove role "${roleName}"`);
                            } else {
                                logger.log('info', 'Returned keyphraseaddfail to ' + message.author.username + ' (' + message.author.id + ')')
                                message.channel.send("That role doesn't exist");
                            }
                        } else {
                            message.channel.send(`\`\`\`Setting: ${this.name}\nUsage: ${client.settings.get(message.guild.id, 'prefix')}settings ${this.name} ${this.usage}\n${this.description}\`\`\``);

                            logger.log('info', 'Returned keyphraseaddfail to ' + message.author.username + ' (' + message.author.id + ')');
                        }
                    } else {
                        message.channel.send(`\`\`\`Setting: ${this.name}\nUsage: ${client.settings.get(message.guild.id, 'prefix')}settings ${this.name} ${this.usage}\n${this.description}\`\`\``);

                        logger.log('info', 'Returned keyphraseaddfail to ' + message.author.username + ' (' + message.author.id + ')');
                    }
                } else {
                    message.channel.send(`\`\`\`Setting: ${this.name}\nUsage: ${client.settings.get(message.guild.id, 'prefix')}settings ${this.name} ${this.usage}\n${this.description}\`\`\``);

                    logger.log('info', 'Returned keyphraseaddfail to ' + message.author.username + ' (' + message.author.id + ')');
                }
            } else {
                message.channel.send(`\`\`\`Setting: ${this.name}\nUsage: ${client.settings.get(message.guild.id, 'prefix')}settings ${this.name} ${this.usage}\n${this.description}\`\`\``);

                logger.log('info', 'Returned keyphraseaddfail to ' + message.author.username + ' (' + message.author.id + ')');
            }
        } else if (args[0] == 'remove') {
            let term = args[1];

            if (term) {
                // Check if the list exists, if not, inform user
                if (client.settings.has(message.guild.id, 'keyphrases')) {
                    if (parseInt(term, 10) > 0) {
                        term = parseInt(term, 10)-1;

                        let tempList = client.settings.get(message.guild.id, 'keyphrases');

                        // Remove the given index from the array
                        let removed = tempList.splice(term, 1);

                        message.channel.send('Successfully removed keyphrase with index '+(term+1)+' from the keyphrase list');

                        client.settings.remove(message.guild.id, removed, 'keyphrases');

                        logger.log('info', 'Returned keyphraseremove to ' + message.author.username + ' (' + message.author.id + ')');
                    } else {
                        message.channel.send('Please specify an index to remove');

                        logger.log('info', 'Returned keyphraseremovefail to ' + message.author.username + ' (' + message.author.id + ')');
                    }
                } else {
                    message.channel.send('There are no keyphrases');

                    logger.log('info', 'Returned keyphraseremovefail to ' + message.author.username + ' (' + message.author.id + ')');
                }
            }
        }
    },
}