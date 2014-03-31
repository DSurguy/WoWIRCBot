var config = require('./config.js');

var Articles = {
    Commands: {
        help: [
            "\x0314"+"Syntax: !wowis <Character> [<Realm>] [<Region>]",
            "This command will generate a link to the official Battle.net armory page for the requested character.",
            "The realm and region are optional, they will default to the following: ",
            "Realm: "+config.wow.homeRealm+"   Region: "+config.wow.homeRegion ]

    }
};

module.exports = Articles;