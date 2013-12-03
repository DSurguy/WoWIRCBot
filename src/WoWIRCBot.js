var irc = require('irc'),
	config = require('./config.js');

module.exports = WoWIRCBot;

function WoWIRCBot(){
	var bot = this;
	//create a new IRC client
	bot.client = new irc.Client(
		config.connect.host, 
		config.connect.nick, 
		{
			channels: config.connect.channels
		}
	);
	//bind a listener for the messages
	bot.client.addListener('message', function (from, to, message) {
	    if( message[0] === "!" ){
	    	//determine which command has been sent
	    	var cmdEnd = message.indexOf(" ") !== -1 ? message.indexOf(" ") : message.length;
	    	var command = message.slice(1, cmdEnd);
	    	console.log(command);
	    	//check to see if we're handling the command
	    	if( bot.commands[command] ){
	    		//this is a command we can handle, parse it!
	    		bot.parseMessage(from, to, command, message.slice(cmdEnd+1) );
	    	}
	    }
	});

	bot.client.addListener('error', function(message) {
	    console.log('error: ', message);
	});
}

WoWIRCBot.prototype.parseMessage = function(from, to, command, params){
	//determine who we need to send this message to
	var target = "";
	if( to[0] === "#" || to[0] === "&" ){
		//this message was sent to a channel, so we should output to the channel
		target = to;
	}
	else{
		//this was sent directly to the bot, send it only to the sender
		target = from;
	}
	//now actually process the command
	this[command](from, target, params);
};

WoWIRCBot.prototype.wowis = function(from, target, params){
	var bot = this;
	bot.client.say(target, "You asked for a !wowis, but that's not quite implemented yet!");
};

/*
*	Bind Commands!
*/

WoWIRCBot.prototype.commands = {
	wowis: true
};