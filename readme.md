Project Name: WoWIRCBot

Version: 0.0.4

### Documentation Link

[Google Doc - WoWIRCBot Documentation](https://docs.google.com/document/d/1aJnlQNTLbJNXT9SnUhEwFzi4lXuZIIx6qd7uM4MbZpA/edit?usp=sharing)


# What IS WoWIRCBot?

WoWIRCBot is a nodejs-based IRC bot designed to provide fun and useful functions for WoW-related IRC channels. Through its use of ‘!’ commands, it can provide data about characters, realm status, (links to guides and encounters, and tell silly WoW jokes - future development).

It consumes the [battle.net WoW API](http://dev.battle.net).

# Bot Setup

## Prerequisites

### Source Code

The source code for the WoWIRCBot can be found here: 

    https://github.com/DSurguy/WoWIRCBot


Clone the repo or download the source as a zip (I recommend cloning the repo, this allows you to `git pull` and update things)

### NodeJS

To get started, please make sure you have node installed on your machine:

    http://nodejs.org/


## Building

This step isn’t so much a build process as it is dependency installation. Make sure you’ve got npm set up, and navigate to your WoWIRCBot directory. Then run `npm install`.

    cd ./WoWIRCBot
    npm install


### Configuration

Now for the fun part. Here you get to personalize your bot and make sure it’s going to connect where you want it to!

Secret.js

In your repo folder you’ll find a file called sampleSecret.js. Specifically, it’s located at:

    ./WoWIRCBot/bot/sampleSecret.js

This file contains all the connection information and administrative information for your specific bot.

#WoWIRCBot Command Reference

##!wowis ~0.0.1

####Syntax
    !wowis <character> [<realm>] [<region>]

####Sample
    !wowis Zuulika Draenor us

####Functionality
This command allows a user to check if a character exists and request a direct link to their armory page in advanced view mode. The bot will use the default home realm if one is not passed in.

####Private Command Enabled
Whisper this message directly to WoWIRCBot to keep your query private!


##!amr ~0.0.2

####Syntax
    !amr <character> [<realm>] [<region>]

####Sample
    !amr Zuulika Draenor us

####Functionality
This function generates a link to the specified character’s Ask Mr. Robot gear optimizer. It will also check to see if the character exists, and cache the character if they do.

####Private Command Enabled
Whisper this message directly to WoWIRCBot to keep your query private!


##!help ~0.0.3

####Syntax
    !help <!command|’list’>

####Samples
    !help list
    !help !amr

####Functionality
This command requests some help documentation from WoWIRCBot for a given command.

####Private Command Mandatory
WoWIRCBot will only display results to this command as a private message directly to the user!


##!realm ~0.0.3

####Syntax
    !realm [<realm>] [<region>]

####Samples
    !realm
    !realm Draenor us

####Functionality
This command will display the status of the requested realm, including population, up/down status and queue status.

####Private Command Enabled
Whisper this message directly to WoWIRCBot to keep your query private!
