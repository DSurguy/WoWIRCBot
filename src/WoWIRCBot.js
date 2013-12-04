var irc = require('irc'),
	http = require('http'),
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
	var bot = this,
		args = params.split(" "),
		link = "http://us.battle.net/wow/en/character/";
	if( args[1] ){
		//the server name has been passed in, use it
		link += args[1]+"/";
	}
	else{
		//use the home server
		if( config.bot.homeServ ){
			link += config.bot.homeServ+"/";
		}
		else{
			//we don't have a server to use!
			bot.client.notice(from, "Unable to complete !wowis. No server specified in request or in config. Please contact channel admin.");
			return false;
		}
	}

	if( args[0].length == 0 ){
		//this is a malformed request, alert the sender
		bot.client.notice(from, "Malformed !wowis. Expected !wowis <characterName> [<serverName>], got !wowis <"+args[0]+"> [<"+args[1]+">]");
		return false;
	}
	else{
		//this is a proper request, add the character name
		link += args[0]+"/advanced";
	}
	//send the link to the target of the request
	bot.client.say(target, "!wowis for "+args[0]+": "+link);
};

/*
*	Manage API calls
*/
WoWIRCBot.prototype.callAPI = function(type, params, options){
	var url = "http://us.battle.net/api/wow/data/"
	switch( type ){
		case "character":
			url += "character/"+params.server+"/"+params.character;
			//now add all the available fields and store them for this request.
			
			break;
	}
};

/*
*	Bind Commands!
*/

WoWIRCBot.prototype.commands = {
	wowis: true
};