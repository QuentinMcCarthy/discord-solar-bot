module.exports = {
    name: 'welcome',
    description: 'Welcomes users based on a condition. Use [user] for the user\'s name',
    usage: '<"keyphrase"/join/off> "[message]"',
    execute(client, logger, message, args) {
        const guildID = message.guild.id;
        var rtrn = '';

        if (args[0] != undefined && args[1] != undefined && args[2] != undefined) {
            let cond = args[0];
            let msg = args[1];

            // Find the full string if there's a quotation
            if (cond.substring(0, 1) == '"' && cond.substring(cond.length - 1) != '"') {
                for (var i = 1; i < args.length; i++) {
                    if (args[i].substring(args[i].length - 1) == '"') {
                        cond += ' ' + args[i];
                        msg = args[i + 1];

                        break;
                    } else {
                        cond += ' ' + args[i];
                        msg = args[i + 1];
                    }
                }
            }

            // Same with the msg string
            if (msg.substring(0, 1) == '"' && msg.substring(msg.length - 1) != '"') {
                for (var i = 1; i < args.length; i++) {
                    if (args[i].substring(args[i].length - 1) == '"') {
                        msg += ' ' + args[i];

                        break;
                    } else {
                        msg += ' ' + args[i];
                    }
                }
            }

            // Ensure everything is correct
            if (cond != undefined && msg != undefined) {
                // Remove quotes
                cond = cond.replace(/"/g, '');
                msg = msg.replace(/"/g, '');

                client.settings.set(guildID, cond, 'welcome.condition');
                client.settings.set(guildID, msg, 'welcome.message');
                client.settings.set(guildID, message.channel.id, 'welcome.channel');

                message.channel.send('Welcome message set with for <#' + message.channel.id + '>. Message: "' + msg + '"');

                rtrn = 'welcomeset';
            } else {
                message.channel.send(`\`\`\`Command: ${this.name}\nUsage: ${client.settings.get(message.guild.id, 'prefix')}${this.name} ${this.usage}\n${this.description}\`\`\``);

                rtrn = 'welcomefail';
            }
        } else if (args[0] == 'off') {
            if (client.settings.has(guildID, 'channels.' + message.channel.id + 'welcome') || client.settings.get(guildID, 'welcome.channel') != 0) {
                client.settings.set(guildID, 'N/A', 'welcome.condition');
                client.settings.set(guildID, 'N/A', 'welcome.message');
                client.settings.set(guildID, 0, 'welcome.channel');

                message.channel.send('Welcome messages disabled');

                rtrn = 'welcomeoff';
            } else {
                message.channel.send('No welcome set');

                rtrn = 'welcomefail'
            }
        } else {
            message.channel.send(`\`\`\`Command: ${this.name}\nUsage: ${client.settings.get(message.guild.id, 'prefix')}${this.name} ${this.usage}\n${this.description}\`\`\``);

            rtrn = 'welcomeex';
        }

        logger.log('info', 'Returned ' + rtrn + ' to ' + message.author.username + ' (' + message.author.id + ')');
    },
};
