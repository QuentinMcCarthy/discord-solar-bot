const {perms} = require('../auth.json');

module.exports = {
	name: 'invite',
	description: 'Provides an invite for the bot',
	cooldown: 1,
	execute(prefix, message, args) {
		message.channel.send('https://discordapp.com/oauth2/authorize?client_id=726760083857473597&scope=bot&'+perms);

		console.log('Returned inviteurl to '+message.author.username+' ('+message.author.id+')');
	},
};
