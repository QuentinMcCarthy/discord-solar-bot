const { SlashCommandBuilder } = require('discord.js');
const Enmap = require('enmap');
const { loggers } = require('winston');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('creminder')
		.setDescription('Reminds users in a channel every set amount of messages of a specified message.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('on')
				.setDescription('Turn creminder on')
				.addIntegerOption(option =>
					option.setName('count')
						.setDescription('The amount of messages to wait for')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('message')
						.setDescription('The message to send')
						.setRequired(true)))
		.addSubcommand(subcommand => 
			subcommand
				.setName('off')
				.setDescription('Turn creminder off'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'on') {
			if (interaction.options.getInteger('count') > 0) {
				await interaction.reply({ content: `Will remind users in #${interaction.channel.id} every ${interaction.options.getInteger('count')} messages about ${interaction.options.getString('message')}`, ephemeral: true });

				client.settings.set(guildID, interaction.options.getString('message'), `channels.${interaction.channel.id}.creminder.message`);
				client.settings.set(guildID, interaction.options.getInteger('count'), `channels.${interaction.channel.id}.creminder.delay`);
				client.settings.set(guildID, interaction.options.getInteger('count'), `channels.${interaction.channel.id}.creminder.current`);

				logger.log('info', `Creminder set in ${interaction.channel.id} by ${interaction.user.tag}`);

			} else {
				await interaction.reply({ content: 'Message count was too short', ephemeral: true });

				logger.log('info', `Creminder failed to be set by ${interaction.user.tag}`);
			}
		} else if (interaction.options.getSubcommand() === 'off') {
			await interaction.reply({ content: 'Creminder off', ephemeral: true });

			loggers.log('info', `Creminder disabled in ${interaction.channel.id} by ${interaction.user.tag}`);
		}
	}
}