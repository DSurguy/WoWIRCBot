var WoWIRCBot = require("./WoWIRCBot.js");

process.on('uncaughtException', function (err) {
  	console.trace(err.stack);
  	process.exit(0);
});

var myBot = new WoWIRCBot();