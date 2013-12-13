var irc = require('irc'),
	http = require('http'),
	mongo = require('mongodb').MongoClient,
	config = require('./config.js');

module.exports = WoWIRCBot;

function WoWIRCBot(){
	var bot = this;

	//before connecting to the IRC network, create a mongo connection
	console.log("Attempting to connect to db...");
	mongo.connect(config.mongo.url, function(err, db){

		bot.db = db;

		//create a new IRC client
		console.log("Attempting to connect to IRC on channels: "+config.irc.channels.join(","));
		bot.client = new irc.Client(
			config.irc.host, 
			config.irc.nick, 
			{
				channels: config.irc.channels
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
	});
};

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

// !wowis <character> [<realm>] [<region>]
WoWIRCBot.prototype.wowis = function(from, target, params){
	var bot = this,
		args = params.split(" "),
		region, character, realm;

	if( args[0].length == 0 ){
		//this is a malformed request, alert the sender
		bot.client.notice(from, "Malformed !wowis. Expected !wowis <characterName> [<serverName>] [<region>], got !wowis <"+args[0]+"> [<"+args[1]+">] [<"+args[2]+">]");
		return false;
	}
	else{
		//this is a proper request, add the character name
		character = args[0];
	}

	if( args[1] ){
		//the server name has been passed in, use it
		realm = args[1]
	}
	else if( config.wow.homeRealm ){
		//use the home server
		realm = config.wow.homeRealm;
	}
	else{
		//we don't have a server to use!
		bot.client.notice(from, "Unable to complete !wowis. No realm specified in request or in bot config. Please contact channel admin or supply a realm.");
		return false;
	}


	if( args[2] ){
		//the server region was passed in
		region = args[2]
	}
	else if( config.wow.homeRegion ){
		//use the home region
		region = config.wow.homeRegion;
	}
	else{
		//we don't have a region to use!
		bot.client.notice(from, "Unable to complete !wowis. No region specified in request or in bot config. Please contact channel admin or supply a realm.");
		return false;
	}	
	
	//check to see if this character exists
	bot.getCharacter(realm, character, region, true, function(charExists){
		if( charExists ){
			//send the link to the target of the request
			bot.client.say(target, "\x0314"+"!wowis for "+args[0]+": http://"+region+".battle.net/wow/en/character/"+realm+"/"+character+"/advanced");
		}
		else{
			//send a message that the char doesn't exist to the target of the request
			bot.client.say(target, "\x0314"+"!wowis for <"+args[0]+"> [<"+args[1]+">] [<"+args[2]+">]: Character not found!");	
		}
	});
};

// !amr <character> [<realm>] [<region>]
WoWIRCBot.prototype.amr = function(from, target, params){
	var bot = this,
		args = params.split(" "),
		region, character, realm;

	if( args[0].length == 0 ){
		//this is a malformed request, alert the sender
		bot.client.notice(from, "Malformed !amr. Expected !amr <character> [<realm>] [<region>], got !amr <"+args[0]+"> [<"+args[1]+">] [<"+args[2]+">]");
		return false;
	}
	else{
		character = args[0];
	}

	if( args[1] ){
		realm = args[1];
		
	}
	else if( config.wow.homeRealm) {
		realm = config.wow.homeRealm;
	}
	else{
		bot.client.notice(from, "Unable to complete !amr. No realm specified in request or in bot config. Please contact channel admin or supply a realm.");
	}

	if( args[2] ){
		region = bot.amr_Region(args[2]);
	}
	else if( config.wow.homeRegion) {
		region = bot.amr_Region(config.wow.homeRegion);
	}
	else{
		bot.client.notice(from, "Unable to complete !amr. No region specified in request or in bot config. Please contact channel admin or supply a region.");
	}

	//check to see if this character exists
	bot.getCharacter(realm, character, true, function(charExists){
		if( charExists ){
			//send the link to the target of the request
			bot.client.say(target, "\x0314"+"!amr for "+args[0]+": http://www.askmrrobot.com/wow/gear/"+region+"/"+realm+"/"+character);
		}
		else{
			//send a message that the char doesn't exist to the target of the request
			bot.client.say(target, "\x0314"+"!amr for <"+args[0]+"> [<"+args[1]+">] [<"+args[2]+">]: Character not found!");	
		}
	});
};
WoWIRCBot.prototype.amr_Region = function(region){
	switch(region){
		case "us":
		case "usa":
		default:
			return "usa";
			break;
		case "eu":
			return "eu";
			break;
	}
}


WoWIRCBot.prototype.getCharacter = function(realm, character, region, justChecking, callback){
	//build the request string
	var url = "http://"+this.db_region(region)+".battle.net/api/wow/character/"+realm+"/"+character+"?fields=guild,hunterPets,items,professions,progression,pvp,reputation,stats,talents",
		bot = this;
	//check the local database to see if we already have the character
	console.log("Looking for char in database: "+character+" on "+realm+" for region "+region);
	bot.db.collection("characters_"+region).find({name: character, realm: realm}).toArray(function(err,chars){
		if( err ){
			console.log("Error looking for character. "+e.message);
			return false;
		}
		//see if we got data
		console.log(chars.length);
		if( chars.length > 0 ){
			//we got data, are we just checking to see if it exists?
			if( justChecking ){
				//yep it exists
				callback(true);
			}
			else{
				//return the character
				callback(chars[0]);
			}
		}
		else{
			//make a get request to see if we can nab some data
			console.log("Attempting to get char from API");
			http.get(url, function(result){
				var newChar,
					data = "";
				result.on("data", function(chunk){
					data += chunk;
				});
				result.on("end", function(){
					newChar = JSON.parse(data);
					if( newChar.status === "nok" ){
						//this character does NOT exists
						//are we just checking to see if it exists?
						if( justChecking ){ 
							callback(false); 
						}
						else{
							//return the character
							callback(undefined);
						}
					}
					else{
						//we need to add this character to the database
						console.log("Attempting to add character to the database");
						bot.db.collection("characters_"+region).insert(newChar, function(err){
							if( err ){
								console.log("Error looking for character. "+e.message);
								return false;
							}
							if( justChecking ){ 
								callback(true); 
							}
							else{
								//return the character
								callback(newChar);
							}
						});
					}
				});
			}).on('error', function(e){
				console.log("ERRRROR: "+e.message);
			});
		}
	});
};
WoWIRCBot.prototype.db_region = function(region){
	switch(region){
		case "us":
		case "usa":
		default:
			return "us";
		case "eu":
			return "eu";
	}
}
/*
*	Enable/Disable commands
*/

WoWIRCBot.prototype.commands = {
	wowis: true,
	amr: true
};