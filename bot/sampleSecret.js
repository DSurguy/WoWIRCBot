module.exports = {
	mongo: {
		hostname: "sub.domain.ext", //ex: www.mymongoserver.com or an ip address
		port: 0, //default for localhost is 27017
		username: "dbuser", 
		password: "1234",
		db: "wowircbot",
	},
	irc: {
		host: "sub.domain.ext", //ex: us.quakenet.org
		nick: "WoWIRCBot", //ex: JimmyWoWBot
		channels: ["#Zuultest"] //Ex: ["#myGuild","#yourGuild","#AllTheGuilds"]
	},
	wow: {
		homeRealm: "Draenor", //This is my home, it might not be yours!
		homeRegion: "us", //region being us, eu, etc
		apiPath: 'http://us.battle.net/api/wow/' //If you're in the eu, change to eu.battle.net etc etc
	},
	adminList: {
		//Users should be added here in key:value pairs of name:pass, such as "Jimmy":"12345"
	}
};