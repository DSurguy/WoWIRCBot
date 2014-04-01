var config = require('./config.js');

var Articles = {
    //This contains a map of commands supported by help, and their associated help document
    Manifest: [
        {cmd: "wowis,!wowis", docMap: this.Commands.wowis},
        {cmd: "amr,!amr", docMap: this.Commands.amr},
        {cmd: "list", docMap: this.List}
    ],

    List: [
        "wowis, amr"
    ],

    //WoWIRCBot command documentation
    Commands: {
        wowis: [
            "\x0311"+"Syntax: !wowis <Character> [<Realm>] [<Region>]",
            "This command will generate a link to the official Battle.net armory page for the requested character.",
            "The realm and region are optional, they will default to the following: ",
            "Realm: "+config.wow.homeRealm+"   Region: "+config.wow.homeRegion,
            "\x0314"+"Whisper this command to the bot for a private response!" ],
        amr: [
            "\x0311"+"Syntax: !amr <Character> [<Realm>] [<Region>]",
            "This command will generate a link to AskMrRobot Gear Optimizer for the requested character.",
            "The realm and region are optional, they will default to the following: ",
            "Realm: "+config.wow.homeRealm+"   Region: "+config.wow.homeRegion,
            "\x0314"+"Whisper this command to the bot for a private response!" ]
    },

    //Error report stating help command was not recognized
    Error: [
        "The command !help {0} was not recognized as a supported help document.",
        "Please enter !help list to see supported documents"
    ]
};

module.exports = Articles;