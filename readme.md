Project Name: WoWIRCBot

Version: 0.0.2

# Documentation Link: 

[Google Doc - WoWIRCBot Documentation](https://docs.google.com/document/d/1aJnlQNTLbJNXT9SnUhEwFzi4lXuZIIx6qd7uM4MbZpA/edit?usp=sharing)


# What IS WoWIRCBot?

WoWIRCBot is a nodejs-based IRC bot designed to provide fun and useful functions for WoW-related IRC channels. Through its use of ‘!’ commands, it can provide data about characters, realm status, links to guides and encounters, and tell silly WoW jokes.

It consumes the [battle.net WoW API](http://blizzard.github.io/api-wow-docs/), and uses a mongo db to store requested data for future use in an attempt to reduce API requests, as the API is limited to 3000 requests from a single IP per day.

# Current Development Status

## Implemented Commands

### Open Commands
wowis

amr

### Admin Commands

## Commands In Active Development

### Open Commands

### Admin Commands

## Future Planned Commands

### Open Commands
silly

confess

char

dps

guild

boss

raid

### Admin Commands
@homeServ

@admin

# Bot Setup

## Prerequisites

### Source Code

The source code for the WoWIRCBot can be found here: 

<code>https://github.com/DSurguy/WoWIRCBot</code>


Clone the repo or download the source as a zip (I recommend cloning the repo, this allows you to `git pull` and update things)

### Mongo DB

You’ll need a mongo installation somewhere. This could be on your local machine, or it could be set up on a host like [http://mongolab.com](http://mongolab.com). As long as you can connect to it using the following URI scheme, we’re good!

<code>mongodb://&lt;dbuser&gt;:&lt;dbpassword&gt;@&lt;host&gt;:&lt;port&gt;/&lt;db&gt;</code>


### NodeJS

To get started, please make sure you have node installed on your machine:

<code>http://nodejs.org/</code>


## Building

This step isn’t so much a build process as it is dependency installation. Make sure you’ve got npm set up, and navigate to your WoWIRCBot directory. Then run `npm install`.

<pre><code>cd ./WoWIRCBot
npm install</code></pre>


### Configuration

Now for the fun part. Here you get to personalize your bot and make sure it’s going to connect where you want it to!

Secret.js

In your repo folder you’ll find a file called sampleSecret.js. Specifically, it’s located at:

<code>./WoWIRCBot/bot/sampleSecret.js</code>


This file contains all the connection information and administrative information for your specific bot.

# WoWIRCBot Command Reference

## wowis

### Syntax

!wowis &lt;character&gt; [&lt;realm&gt;] [&lt;region&gt;]

### Functionality

This command allows a user to check if a character exists and request a direct link to their armory page in advanced view mode. The bot will use the default home realm if one is not passed in.

### Dev Notes

Functions

- wowis

- getCharacter

## amr

### Syntax

!amr &lt;character&gt; [&lt;realm&gt;] [&lt;region&gt;]

### Functionality

This function generates a link to the specified character’s Ask Mr. Robot gear optimizer. It will also check to see if the character exists, and cache the character if they do.

### Dev Notes

Functions

- amr

- getCharacter

