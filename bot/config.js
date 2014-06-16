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
        hostname: secret.mongo.hostname ? secret.mongo.hostname : "localhost",
        port: secret.mongo.port ? secret.mongo.port : 27017,
        username: secret.mongo.username ? secret.mongo.username : undefined,
        password: secret.mongo.password ? secret.mongo.password : undefined,
        db: secret.mongo.db ? secret.mongo.db : "db"
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
    };
}
var generate_mongo_url = function(obj){
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
};
config.mongo = {
    url: generate_mongo_url(mongo)
};


/**
* IRC DATA CONFIG
**/
if( secret.irc ){
    //pull from secret data and fallback to defaults
    config.irc = {
        host: secret.irc.host ? secret.irc.host : 'us.quakenet.org',
        nick: secret.irc.nick ? secret.irc.nick : '['+String.fromCharCode(95+Date.now()%10) + ']WoWBot',
        channels: secret.irc.channels ? secret.irc.channels : ['#WoWIRCBot']
    }
}
else{
    //use defaults
    config.irc = {
        host: 'us.quakenet.org',
        nick: '['+String.fromCharCode(96+Date.now()%10) + ']WoWBot',
        channels: ['#WoWIRCBot']
    }
}


/**
* WOW DATA CONFIG
**/
if( secret.wow ){
    //pull from secret data and fallback to defaults
    config.wow = {
        homeRealm: secret.wow.homeRealm ? secret.wow.homeRealm : 'Draenor',
        homeRegion: secret.wow.homeRegion ? secret.wow.homeRegion : 'us'
    };
}
else{
    //use defaults
    config.wow = {
        homeRealm: 'Draenor',
        homeRegion: 'us'
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

/**
*   DEBUGGING
**/
if( secret.debug ){
    config.debug = {
        logLevel: secret.debug.logLevel ? secret.debug.logLevel : 1,
        console: secret.debug.console ? secret.debug.console : false,
        logFile: secret.debug.logFile ? secret.debug.logFile : true,
        logFilePath: secret.debug.logFilePath ? secret.debug.logFilePath : './log/botLog.log',
        breakOnError: secret.debug.breakOnError ? secret.debug.breakOnError : false
    }
}
else{
    //use defaults
    config.debug = {
        logLevel: 1,
        console: false,
        logFile: true,
        logFilePath: './log/botLog.log',
        breakOnError: false
    }
}

//export the config options
module.exports = config;