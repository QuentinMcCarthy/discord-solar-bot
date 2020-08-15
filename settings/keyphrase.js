const Enmap = require('enmap');

module.exports = {
    name: 'keyphrase',
    description: 'Set keyphrases to add/remove roles from users',
    usage: '<list/add/remove> [keyphrase] [add/remove] [role]',
    execute(client, logger, message, args) {
        if (args[0] == 'list') {
            if (client.settings.has(message.guild.id, 'keywords')) {
                let returnList = 'Keywords:';

                if (client.settings.has(message.guild.id, 'add')) {
                    returnList += '\n Add:';

                    for (var i = 0; i < client.settings.get(message.guild.id, 'keywords.add').length; i++) {
                        returnList += '\n' + (i + 1) + '. ' + client.settings.get(message.guild.id, 'filter.list')[i];
                    }
                } else {

                }

                for (var i = 0; i < client.settings.get(message.guild.id, 'filter.list').length; i++) {
                    returnList += '\n' + (i + 1) + '. ' + client.settings.get(message.guild.id, 'filter.list')[i];
                }

                message.channel.send('```' + returnList + '```');

                logger.log('info', 'Returned filterlist to ' + message.author.username + ' (' + message.author.id + ')');
            } else {
                message.channel.send('```Filter Words/Phrases:```');

                logger.log('info', 'Returned filterlist to ' + message.author.username + ' (' + message.author.id + ')');
            }
        }
    },
}