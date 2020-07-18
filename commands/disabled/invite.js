const {perms} = require('../auth.json');

module.exports = {
	name: 'invite',
	description: 'Provides an invite for the bot',
	cooldown: 1,
	execute(client, message, args) {
		message.channel.send('https://discordapp.com/oauth2/authorize?client_id='+id+'&scope=bot&'+perms);

		console.log('Returned inviteurl to '+message.author.username+' ('+message.author.id+')');
	},
};
