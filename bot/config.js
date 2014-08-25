var secret,
    config = {};

//attempt to include the secret data file
try{
    secret = require("./secret.js");
} catch (e){
    secret = {};
}

/**
* API CONFIG
**/
if( secret.api ){
    config.api = {
        key: secret.api.key ? secret.api.key : undefined,
        locale: secret.api.locale ? secret.api.locale : "en_US"
    };
}
else{
    config.api = {
        key: undefined,
        locale: "en_US"
    };
}

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