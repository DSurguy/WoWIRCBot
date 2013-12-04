var irc = require('irc'),
	http = require('http'),
	mongo = require('mongodb').MongoClient,
	config = require('./config.js');

module.exports = WoWIRCBot;

function WoWIRCBot(){
	var bot = this;

	//before connecting to the IRC network, create a mongo connection
	mongo.connect(config.mongo.url, function(err, db){

		bot.db = db;

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
		armoryLink = "http://us.battle.net/wow/en/character/",
		character, realm;

	if( args[1] ){
		//the server name has been passed in, use it
		realm = args[1]
	}
	else{
		//use the home server
		if( config.bot.homeServ ){
			realm = config.bot.homeServ;
		}
		else{
			//we don't have a server to use!
			bot.client.notice(from, "Unable to complete !wowis. No realm specified in request or in bot config. Please contact channel admin or supply a realm.");
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
		character = args[0];
	}
	//check to see if this character exists
	bot.getCharacter(realm, character, true, function(charExists){
		if( charExists ){
			//send the link to the target of the request
			bot.client.say(target, "!wowis for "+args[0]+": "+armoryLink+realm+"/"+character+"/advanced");
		}
		else{
			//send a message that the char doesn't exist to the target of the request
			bot.client.say(target, "!wowis for "+args[0]+": Character not found!");	
		}
	});
};

WoWIRCBot.prototype.getCharacter = function(realm, character, justChecking, callback){
	//build the request string
	var url = config.bot.apiPath+"/character/"+realm+"/"+character+"?fields=guild,hunterPets,items,professions,progression,pvp,reputation,stats,talents",
		bot = this;
	//check the local database to see if we already have the character
	console.log("Looking for char in database");
	bot.db.collection("characters").find({name: character, realm: realm}).toArray(function(err,chars){
		if( err ){
			console.log("Error looking for character. "+e.message);
			return false;
		}
		//see if we got data
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
						bot.db.collection("characters").insert(newChar, function(err){
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

/*
*	Enable/Disable commands
*/

WoWIRCBot.prototype.commands = {
	wowis: true
};