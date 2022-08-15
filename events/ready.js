const winston = require('winston');

// Logging
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: '../log.log' }),
    ],
    format: winston.format.printf(log => '[' + log.level.toUpperCase() + '] - ' + log.message),
});

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        // Default guild settings
        const defaultSettings = {
            adminrole: 'Admin',
            channels: {},
            filter: {
                list: [],
                response: 'Please don\'t use banned words'
            },
            keyphrases: [],
            welcome: {
                condition: '',
                message: '',
                channel: 0
            }
        }

        let todayDate = new Date();
        logger.log('info', todayDate.getDate() + '/' + todayDate.getMonth() + '/' + todayDate.getFullYear())

        client.settings.defer;

        logger.log('info', client.settings.size + ' keys loaded');

        // Ensure each guild has a settings entry
        // If a settings entry is not found,
        // Create a new entry with default settings.
        client.guilds.cache.forEach(guild => {
            client.settings.ensure(guild.id, defaultSettings);

            logger.log('info', 'Settings loaded for ' + guild.name);
        });

        logger.log('info', client.user.username + ' loaded and logged in');
    }
}