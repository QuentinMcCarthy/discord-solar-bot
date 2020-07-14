module.exports = {
	name: 'ping',
	description: 'Pings the bot, used to check if the bot is running properly and to check the command delay',
	cooldown: 1,
	execute(client, message, args) {
		message.channel.send('Pong recieved after '+(Date.now() - message.createdTimestamp)+'ms');

		console.log('Returned pong to '+message.author.username+' ('+message.author.id+')');

		// Returned pong may be negative due to system clock
	},
};
