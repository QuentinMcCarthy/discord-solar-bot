module.exports = {
    name: 'guildDelete',
    execute(guild) {
        // If the bot disconnects from a server, delete the settings
        client.settings.delete(guild.id);
    }
}