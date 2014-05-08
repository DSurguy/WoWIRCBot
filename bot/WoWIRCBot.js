var irc = require('irc'),
	http = require('http'),
	mongo = require('mongodb').MongoClient,
	config = require('./config.js'),
	fs = require('fs'),
    Docs = require('./Docs.js');

module.exports = WoWIRCBot;

function WoWIRCBot(){
	var bot = this;

	//handle any sort of exit
	process.on("exit", function(code){

		//finish writing out the log and then log an exit
		
		if( config.debug.logFile ){
			bot.logFile.writing = false;
			for( var i=0; i<bot.logFile.queue.length; i++ ){
				fs.appendFileSync(config.debug.logFilePath, bot.logFile.queue.shift());
			}
		}

		//now write an exit
		if( config.debug.logFile ){
			fs.appendFileSync(config.debug.logFilePath, "\n"+(new Date()).toISOString()+"EXIT: Bot exited with code "+code);
		}
		if( config.debug.console ){
			console.log( "\n"+(new Date()).toISOString()+"EXIT: Bot exited with code "+code );
		}

	});


	//before connecting to the IRC network, create a mongo connection
	bot.log("\n-----\nBot started, attempting to connect to db...", 1);
	mongo.connect(config.mongo.url, function(err, db){


		if( err ){
			bot.error(err.message);
		}
		else{
			bot.log("Successfully connected to db.", 1);
		}

		bot.db = db;

		//create a new IRC client
		bot.client = new irc.Client(
			config.irc.host, 
			config.irc.nick, 
			{
				channels: config.irc.channels,
				autoConnect: false
			}
		);

		//bind a listener for the messages
		bot.client.addListener('message', function (from, to, message) {
		    if( message[0] === "!" ){
		    	//determine which command has been sent
		    	var cmdEnd = message.indexOf(" ") !== -1 ? message.indexOf(" ") : message.length;
		    	var command = message.slice(1, cmdEnd);
		    	bot.log( "Received command : '"+command+"' from user '"+from+"' for target '"+to+"'", 2);
		    	//check to see if we're handling the command
		    	if( bot.commands[command] ){
		    		//this is a command we can handle, parse it!
		    		bot.parseMessage(from, to, command, message.slice(cmdEnd+1) );
		    	}
		    }
		});

		bot.client.addListener('error', function(message) {
		    console.error('IRC error: '+message);
		});

		//attempt to connect to the IRC server
		bot.log("Attempting to connect to IRC on channels: "+config.irc.channels.join(","), 1);
		bot.client.connect(1, function(){
			bot.log("Connection to IRC server successful. Listening for messages.", 1);
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


//!help [<command>]
WoWIRCBot.prototype.help = function(from, to, params){
    var bot = this,
        args = params.split(" "),
        target = from;
    //get the doc the user requested
    var requestedDoc = bot.routeHelp(args[0]);
    //loop through the lines of the doc and spit them out to the user
    for( var i=0; i<requestedDoc.length; i++ ){
        bot.client.say(target, requestedDoc[i]);
    }
};

//Router for help command
WoWIRCBot.prototype.routeHelp = function(requestedArticle){
	if( requestedArticle == "" ){
		return Docs.Error("undefined");
	}
    //grab the related help doc
    var regex = new RegExp("\\b"+requestedArticle+"\\b", "g");
    for( var i=0; i<Docs.Manifest.length; i++ ){
        if( Docs.Manifest[i].cmd.search(regex) !== -1 ){
            //we have a match, return this doc!
            var docPath = Docs,
                map = Docs.Manifest[i].docMap.split(".");
            for( var j=0; j<map.length; j++ ){
                docPath = docPath[map[j]];
            }
            return docPath;
        }
    }
    //if we make it here, we haven't found a document! Return the error message, replacing {0} with the request
    return Docs.Error(requestedArticle);
};

// !wowis <character> [<realm>] [<region>]
WoWIRCBot.prototype.wowis = function(from, target, params){
	var bot = this,
		args = params.split(" "),
		region, character, realm;

	if( args[0].length == 0 ){
		//this is a malformed request, alert the sender
		bot.client.notice(from, "Malformed !wowis. Expected !wowis <characterName> [<serverName>] [<region>], got !wowis <"+args[0]+"> [<"+args[1]+">] [<"+args[2]+">]. See '!help wowis' for more information.");
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
		bot.client.notice(from, "Unable to complete !wowis. No realm specified in request or in bot config. Please contact channel admin or supply a realm. See '!help wowis' for more information.");
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
		bot.client.notice(from, "Unable to complete !wowis. No region specified in request or in bot config. Please contact channel admin or supply a realm. See '!help wowis' for more information.");
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
		bot.client.notice(from, "Malformed !amr. Expected !amr <character> [<realm>] [<region>], got !amr <"+args[0]+"> [<"+args[1]+">] [<"+args[2]+">]. See '!help amr' for more information.");
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
		bot.client.notice(from, "Unable to complete !amr. No realm specified in request or in bot config. Please contact channel admin or supply a realm. See '!help amr' for more information.");
	}

	if( args[2] ){
		region = bot.amr_Region(args[2]);
	}
	else if( config.wow.homeRegion) {
		region = bot.amr_Region(config.wow.homeRegion);
	}
	else{
		bot.client.notice(from, "Unable to complete !amr. No region specified in request or in bot config. Please contact channel admin or supply a region. See '!help amr' for more information.");
	}

	//check to see if this character exists
	bot.getCharacter(realm, character, region, true, function(charExists){
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
};


WoWIRCBot.prototype.getCharacter = function(realm, character, region, justChecking, callback){
	//build the request string
	var url = "http://"+this.db_region(region)+".battle.net/api/wow/character/"+realm+"/"+character+"?fields=guild,hunterPets,items,professions,progression,pvp,reputation,stats,talents",
		bot = this;

	//check the local database to see if we already have the character
	bot.db.collection("characters_"+region).find({name: character, realm: realm}).toArray(function(err,chars){
		if( err ){
			bot.error("Unable to search database for character, e: "+err.message);
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
						bot.db.collection("characters_"+region).insert(newChar, function(err){
							if( err ){
								console.error("Unable to add character to database. e: "+err.message);
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
				console.error("Unable to retrieve character from API. e: "+e.message);
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
};
/*
*	Enable/Disable commands
*/

WoWIRCBot.prototype.commands = {
	wowis: true,
	amr: true,
    help: true
};


/*
* 	Logging and Error Handling
*/
WoWIRCBot.prototype.log = function(message, level){
	//format this message
	var logMessage = "\n"+(new Date()).toISOString()+" LOG: "+message;

	//attempt to log this to console
	if( config.debug.console && config.debug.logLevel >= level && config.debug.logLevel > 0 ){
		console.log(logMessage);
	}

	//attempt to log to file
	if( config.debug.logFile && config.debug.logLevel >= level && config.debug.logLevel > 0 ){
		this.addToLogFileQueue(logMessage);
	}
};

WoWIRCBot.prototype.error = function(message){
	//format this message
	var errMessage = "\n"+(new Date()).toISOString()+" ERR: "+message;

	//attempt to log this to console
	if( config.debug.console && config.debug.logLevel > 0 ){
		console.error(errMessage);
	}

	//attempt to log to file
	if( config.debug.logFile && config.debug.logLevel > 0 ){
		this.addToLogFileQueue(errMessage);
	}

	//see if we should die on error
	if( config.debug.breakOnError ){
		process.exit(1);
	}
};


WoWIRCBot.prototype.logFile = {
	queue: [],
	writing: false
}

WoWIRCBot.prototype.addToLogFileQueue = function(message){
	this.logFile.queue.push(message);
	this.processLogFileQueue();
};

WoWIRCBot.prototype.processLogFileQueue = function(){
	var bot = this;
	if( bot.logFile.writing == false && bot.logFile.queue.length > 0 ){
		bot.logFile.writing = true;
		fs.appendFile(config.debug.logFilePath, bot.logFile.queue.shift(), function (err){
			bot.logFile.writing = false;
			//an error inside the log handler? Better just die.
			if( err ){
				console.log("Error while writing to log. " + logMessage);
				process.exit(1);
			}
			else{
				bot.processLogFileQueue();
			}
		});
	}
};