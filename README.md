# MMM-MusicOnDemand
A module for the [MagicMirror](https://github.com/MichMich/MagicMirror) using a music on demand service.

This module allows you to play music from [Deezer](https://www.deezer.com) with [puppeteer](https://pptr.dev/). That means you need at least a free account from Deezer. It is meant to be used with a speech recognition module like [MMM-AssistantMk2](https://github.com/eouia/MMM-AssistantMk2), but it should work with other modules as long as you send the correct notifications as described below. Since this module opens up a chromium instance and navigates through the deezer website to play music in the background, it may take some time or you may get timeouts on low end hardware like a Raspberry Pi.

Confirmed working environment:
- Raspberry Pi 3b+ with Raspbian Stretch 9.6 (32-Bit) with preinstalled chromium **Version 65.0.3325.181** , a node installation and latest [MagicMirror](https://github.com/MichMich/MagicMirror) (v.2.6.0) with electron v.2.0.16 preinstalled (v.1.4.15 may not work)

### Screenshot
![](https://raw.githubusercontent.com/ptrk95/MMM-MusicOnDemand/master/img/Example.png)
## Installation

#### Have a look at the Troubleshooting section if it says "Initializing..." all the time or throws other errors

Install like that:

```
cd ~/MagicMirror/modules/
git clone https://github.com/ptrk95/MMM-MusicOnDemand.git
cd MMM-MusicOnDemand
npm install
```
It installs a puppeteer package with a chromium browser (~100mb-270mb). If you don't want to use the puppeteer browser or if you're running on a Raspberry Pi you may want to delete this extra chromium browser:

```
cd ~/MagicMirror/modules/MMM-MusicOnDemand/node_modules/puppeteer
rm -r .local-chromium
```


## Configuration

Copy the following to your config.txt:
```
{
	module: "MMM-MusicOnDemand",
	position: "upper_third",
	config: {
		chromiumPath : "/usr/bin/chromium-browser",  // chromiumPath : null, if you want to use puppeteer browser
		showCover : true,
		showBrowser : false,    // change to true if you want to see whats going on in the browser
		userDataDir : "/home/pi/.config/chromium" //the directory of your user data from the browser, default is for raspberry pi without changes
	 }
 },
```
# Update 17.03.2019 reCaptcha problem:

Since Deezer uses reCaptcha you need to use a preinstalled browser! 
Open up the browser you use for puppeteer (e.g. Pi users: chromium). Log in to Deezer. Close the Browser and make sure the next time you go to the Deezer website, you should already be logged in!

Change the userDataDir in your config file to your needs. For example the path of your user data directory using a Raspberry Pi without any changes should be: "/home/pi/.config/chromium" 


#### The module is now READY and should log you in, which looks similar to the screenshot! But you can't control it if you don't send any notifications to it, as described below.

## Setup
### This explains how to use the module but you can copy paste most of the time

The module has for now 7 features:
- Play music 
- Pause music
- Play next title
- Play previous title (if available)
- Stop music (closes browser, but module remains active)
- Search a title and play it
- Search a artist and play the top titles

#### Hint: Wait for initialization and log in process before sending any notifications to this module! When the module is ready it looks like the screenshot.

To use the above features you have to send predefined notifications to this module. This is a table of the notifications:

| Notification | payload | Description |
|:------------ |:------- |:----------- |
| "AtMusicOnDemand" | payload.message="Play" | Plays music |
| "AtMusicOnDemand" | payload.message="Pause" | Pauses music |
| "AtMusicOnDemand" | payload.message="Next" | Plays next Title |
| "AtMusicOnDemand" | payload.message="Previous" | Plays previous Title |
| "AtMusicOnDemand" | payload.message="Close" | Closes Browser |
| "AtMusicOnDemand" | payload.message="Artist"; payload.Artist="NAME_OF_ARTIST" | Searches for a Artist and plays hits |
| "AtMusicOnDemand" | payload.message="Title"; payload.Title="NAME_OF_TITLE" | Searches for a Title and plays it |

For example, this will search for the title "Losing it" if you send this with your module:
```
this.sendNotification('AtMusicOnDemand', {message:Title, Title: 'Losing it'});
```
As you can see the information about the name of the title is needed for this action, this is where a speech recognition software comes in handy. I already set up a couple of "transcription hooks" and even two [gactions](https://developers.google.com/actions/) in combination with [MMM-AssistantMk2](https://github.com/eouia/MMM-AssistantMk2), so that all the features are available. 

### The following only works with [MMM-AssistantMk2](https://github.com/eouia/MMM-AssistantMk2)
#### If you don't know where you have to place the code, click on the link above
First you have to add the following commands to your config file:
```
command: {
"CLOSE_MUSIC": {
		notificationExec: {
		      notification: "AtMusicOnDemand",
		      payload: {
			message: "Close",		      
      			}
		},
	},
	"SEARCHTITLE": {
		notificationExec: {
			notification :() =>{
			return "AtMusicOnDemand"
			},	
		      payload:(params, key)=> {
			return {
			 message:"Title", 
			 Title: params.Title,	
		    		}
			}
		},
	},
	"SEARCHARTIST": {
		notificationExec: {
			notification :() =>{
			return "AtMusicOnDemand"
			},	
		      payload:(params, key)=> {
			return {
			 message:"Artist", 
			 Artist: params.Artist,	
		    		}
			}
		},
	},
	"PLAYMUSIC": {
		notificationExec: {
		      notification: "AtMusicOnDemand",
		      payload: {
			message: "Play",		      
      			}
		},
	},
	"NEXT_TITLE": {
		notificationExec: {
		      notification: "AtMusicOnDemand",
		      payload: {
			message: "Next",		      
      			}
		},
	},
	"PAUSE_MUSIC": {
		notificationExec: {
		      notification: "AtMusicOnDemand",
		      payload: {
			message: "Pause",		      
      			}
		},
	},
	"PREV_TITLE": {
		notificationExec: {
		      notification: "AtMusicOnDemand",
		      payload: {
			message: "Previous",		      
      			}
		},
	},
	
},
```

Then add this transcription hooks to the config file.
Of course you can change the patterns to what ever you wish, for example translate it in your language:
```
transcriptionHook: {
		"PLAYMUSIC":{
			pattern: "play music",
			command: "PLAYMUSIC",
		},
		"NEXT_TITLE":{
			pattern: "next song",
			command: "NEXT_TITLE",
		},
		"PAUSE_MUSIC":{
			pattern: "pause",
			command: "PAUSE_MUSIC",
		},
		"PREV_TITLE":{
			pattern: "previous song",
			command: "PREV_TITLE",
		},
		"CLOSE_MUSIC":{
			pattern: "stop music",
			command: "CLOSE_MUSIC",
		},
},
```

For the search features you have to add gactions to the config file **and followed the last chapter** [here](https://github.com/eouia/MMM-AssistantMk2/blob/master/USAGE.md)!:
```
action:{
	"SEARCHTITLE" : {
		command: "SEARCHTITLE"
	},
	"SEARCHARTIST" : {
		command: "SEARCHARTIST"
	},
},
```
Now download gactions (if you haven't done it as described [here](https://github.com/eouia/MMM-AssistantMk2/blob/master/gaction/README.md)):
```
#example for RPI
cd ~/MagicMirror/modules/MMM-AssistantMk2/gaction
wget https://dl.google.com/gactions/updates/bin/linux/arm/gactions
chmod +x gactions
```
You can use and modify my actions.js as you please. I commented german phrases besides the english ones, so you can copy and paste it if you know german. But remember to place it here: MagicMirror/modules/MMM-AssistantMk2/gaction
And also don't forget to do the following: 
 ```
 cd ~/MagicMirror/modules/MMM-AssistantMk2/gaction
./gactions update --action_package actions.json --project YOUR_PROJECT_ID
./gactions test --action_package actions.json --project YOUR_PROJECT_ID
```

## Troubleshooting

#### Preinstalled Chromium/Chrome not launching or "Initializing..." all the time
That's most likely a versioning error between puppeteer and your installation of Chromium/Chrome! 

Try: 
```
cd ~/MagicMirror/modules/MMM-MusicOnDemand
npm install puppeteer@1.11.0
```
And make sure your Chromium version is at least Version 65.0.3325.181! 

Update with:
```
sudo apt-get install chromium-browser
```

Also make sure you set the correct path in the config.txt file. 

For Raspberry Pi 3 it is: "/usr/bin/chromium-browser"
