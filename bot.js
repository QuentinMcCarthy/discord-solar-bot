const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const Enmap = require('enmap');
const winston = require('winston');
const { token } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Logging
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'log.log' }),
    ],
    format: winston.format.printf(log => '[' + log.level.toUpperCase() + '] - ' + log.message),
});

// Enmap initialisation
client.settings = new Enmap({
    name: "settings",
    fetchAll: true,
    autoFetch: true,
    cloneLevel: 'deep'
});

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

// Bot startup
client.once('ready', () => {
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
});

client.on('guildDelete', guild => {
    // If the bot disconnects from a server, delete the settings
    client.settings.delete(guild.id);
});

// Commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

//https://discordjs.guide/creating-your-bot/command-handling.html#reading-command-files

// Command response
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    // Command responses
})

client.login(token);