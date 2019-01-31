# MMM-MusicOnDemand
A module for the [MagicMirror](https://github.com/MichMich/MagicMirror) using a music on demand service.

This module allows you to play music from [Deezer](https://www.deezer.com) with [puppeteer](https://pptr.dev/). That means you need at least a free account from Deezer. It is meant to be used with a speech recognition module like [MMM-AssistantMk2](https://github.com/eouia/MMM-AssistantMk2), but it should work with other modules as long as you send the correct notifications as described below. Since this module opens up a chromium instance and navigates through the deezer website to play music in the background, it may take some time or you may get timeouts on low end hardware like a Raspberry Pi.

Confirmed working environment:
- Raspberry Pi 3b+ with Raspbian Stretch (with preinstalled chromium), a node installation and latest [MagicMirror](https://github.com/MichMich/MagicMirror) (v.2.6.0) with electron v.2.0.16 preinstalled (v.1.4.15 may not work)

### Screenshot
![](https://raw.githubusercontent.com/ptrk95/MMM-MusicOnDemand/master/img/Example.png)
## Installation

Before you install you may want to do a quick scroll through the whole README.

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
		email : "yourDeezer-email",
		password : "your-Deezer-password",
	 }
 },
```
Edit email and password to your Deezer credentials. The default value of chromiumPath works for Raspberry Pi with Raspbian Stretch. Change it to null if you want to use the puppeteer browser (maybe on Mac OS) or to another path with a installed chromium (chrome) version.

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

To use the above features you have to send predefined notifications to this module. This is a table of how the notifications have to be:

| Notification | payload | Description |
|:------------ |:------- |:----------- |
| "AtMusicOnDemand" | payload.message="Play" | Plays music |
| "AtMusicOnDemand" | payload.message="Pause" | Pauses music |
| "AtMusicOnDemand" | payload.message="Next" | Plays next Title |
| "AtMusicOnDemand" | payload.message="Previous" | Plays previous Title |
| "AtMusicOnDemand" | payload.message="Close" | Closes Browser |
| "AtMusicOnDemand" | payload.message="Artist"; payload.Artist="NAME_OF_ARTIST" | Searches for a Artist and plays hits |
| "AtMusicOnDemand" | payload.message="Title"; payload.Title="NAME_OF_TITLE" | Searches for a Title and plays it |
