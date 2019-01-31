# MMM-MusicOnDemand
A module for the [MagicMirror](https://github.com/MichMich/MagicMirror) using a music on demand service.

This module allows you to play music form [Deezer](https://www.deezer.com) with [puppeteer](https://pptr.dev/). That means you need at least a free account from Deezer. It is meant to be used with a speech recognition module like [MMM-AssistantMk2](https://github.com/eouia/MMM-AssistantMk2), but it should work with other modules as long as you send the correct notifications as described below. Since this module opens up a chromium instance and navigates through the deezer website to play music, it may take some time or you may get timeouts on low end hardware like a Raspberry Pi. (Working on Raspberry Pi 3b+, no other hardware confirmed yet)

### Screenshot
![](https://raw.githubusercontent.com/ptrk95/MMM-MusicOnDemand/master/img/Example.png)
## Installation and Configuration
```
cd ~/MagicMirror/modules/
git clone https://github.com/ptrk95/MMM-MusicOnDemand.git
cd MMM-MusicOnDemand
npm install
```
