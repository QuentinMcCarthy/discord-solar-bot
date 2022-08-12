module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
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