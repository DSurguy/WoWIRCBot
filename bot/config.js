//build the mongo data
if(process.env.VCAP_SERVICES){
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
    var mongo = {
        "hostname":"localhost",
        "port":27017,
        "username":"",
        "password":"",
        "name":"",
        "db":"db"
    }
}
var generate_mongo_url = function(obj){
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
}
var mongourl = generate_mongo_url(mongo);

//export the config options
module.exports = {
	connect: {
		host: 'us.quakenet.org',
		nick: 'WoWIRCBot',
		channels: ['#mfdguild']
	},
	mongo: {
		url: mongourl
	},
	bot: {
		homeServ: 'Draenor',
		apiPath: 'http://us.battle.net/api/wow/'
	},
	/*
	*	key-value pairs of Nicknames and associated passwords allowed to use admin commands
	*/
	adminList: {
		'Zuulika': 'testpass'
	}
}