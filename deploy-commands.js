const fs = require('node:fs');
const path = require('node:path');
const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientID, guildID, token } = require('./config.json');
const winston = require('winston');

// Logging
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'log.log' }),
    ],
    format: winston.format.printf(log => '[' + log.level.toUpperCase() + '] - ' + log.message),
});

const commands = []
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

const rest = new REST({version: '10'}).setToken(token);

(async () => {
    try {
        logger.log('info', 'Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(clientID),
            { body: commands },
        );

        logger.log('info', 'Successfully reloaded application (/) commands.');
    } catch (error) {
        logger.log('error', error);
    }
})();