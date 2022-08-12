const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pings the bot, used to check if the bot is running properly and to check the command delay'),
	async execute(interaction) {
		let delay = Math.abs(Date.now() - interaction.createdTimestamp);

		if (delay < 0) {
			await interaction.reply({ content: `Pong recieved about ${delay}ms in the past? Well that's odd.`, ephemeral: true });

			logger.log('warn', 'Ping returned negative result');
			logger.log('info', `Returned pong to ${interaction.user.tag}`);
		} else {
			await interaction.reply({ content: `Pong recieved after ${delay}ms`, ephemeral: true });

			logger.log('info', `Returned pong to ${interaction.user.tag}`);
		}
	},
};