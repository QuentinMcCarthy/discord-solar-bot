module.exports = {
	name: 'ping',
	description: 'Pings the bot, used to check if the bot is running properly and to check the command delay',
	cooldown: 1,
	execute(prefix, message, args) {
		message.channel.send('Pong recieved after '+(Date.now() - message.createdTimestamp)+'ms');
		
		console.log('Returned pong to '+message.author.username+' ('+message.author.id+')');
	},
};
