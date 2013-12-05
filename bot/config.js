var secret, 
    mongo, 
    config = {};

//attempt to include the secret data file
try{
    secret = require("./secret.js");
} catch (e){
    secret = {};
}

/**
* MONGO DATA CONFIG
**/
if(secret.mongo){
    //use the secret mongo data and fallback to defaults
    mongo = {
        hostname: secret.mongo.hostname || "localhost",
        port: secret.mongo.port || 27017,
        username: secret.mongo.username || undefined,
        password: secret.mongo.password || undefined,
        db: secret.mongo.db || "db"
    };
}
else{
    //use defaults
    mongo = {
        hostname: "localhost",
        port: 27017,
        username: undefined,
        password: undefined,
        db: "db"
    }
}
var generate_mongo_url = function(obj){
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
}
config.mongo = {
    url: generate_mongo_url(mongo)
};


/**
* IRC DATA CONFIG
**/
if( secret.irc ){
    //pull from secret data and fallback to defaults
    config.irc = {
        host: secret.irc.host || 'us.quakenet.org',
        nick: secret.irc.nick || 'WoWIRCBot',
        channels: secret.irc.channels || ['#WoWIRCBot']
    }
}
else{
    //use defaults
    config.irc = {
        host: 'us.quakenet.org',
        nick: 'WoWIRCBot',
        channels: ['#WoWIRCBot']
    }
}


/**
* WOW DATA CONFIG
**/
if( secret.wow ){
    //pull from secret data and fallback to defaults
    config.wow = {
        homeRealm: secret.wow.homeRealm || 'Draenor',
        apiPath: secret.wow.apiPath || 'http://us.battle.net/api/wow/'
    };
}
else{
    //use defaults
    config.wow = {
        homeRealm: 'Draenor',
        apiPath: 'http://us.battle.net/api/wow/'
    };
}

/**
*   ADMIN LIST CONFIG
**/
if( secret.adminList ){
    config.adminList = secret.adminList;
}
else{
    config.adminList = undefined;
}


//export the config options
module.exports = config