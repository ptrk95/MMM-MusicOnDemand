"use strict";

var playingMusic = false;
var loggedIn = false;
var page;
var browser;
const puppeteer = require('puppeteer');
var NodeHelper = require("node_helper");
var config = {};
var self = this;
var AdsPlaying = false;

module.exports = NodeHelper.create({

	socketNotificationReceived: function(notification, payload) {
		switch(notification){
			case("CONFIG"):
				self = this;
				config = payload;
				LoginDeezer();
				break;
			case("PLAY"):
				playMusic();
				break;
			case("PAUSE"):
				pauseMusic();
				break;
			case("NEXT"):
				nextTitle();
				break;
			case("PREVIOUS"):
				previousTitle();
				break;
			case("Artist"):
				searchArtist(payload);
				break;
			case("Close"):
				closeBrowser();
				break;
			case("Title"):
				searchTitle(payload);
				break;
			default:
				break;
				
		}
	}, 

	stop : function(){
		closeBrowser();
	}
});

async function closeBrowser(){
	try{
		loggedIn = false;
		playingMusic = false;
		await page.close();
		await browser.close();
		self.sendSocketNotification("Closed", "");
	}catch(error){
		console.error(error);
	}
	
}


async function LoginDeezer(){
	try{
		if(config.chromiumPath != null){
			browser = await puppeteer.launch({ executablePath: config.chromiumPath, ignoreDefaultArgs: ['--mute-audio']}); // headless : false
		}else{
			browser = await puppeteer.launch({ignoreDefaultArgs: ['--mute-audio']}); // headless : false
		}
		
		page = await browser.newPage();
		await page.setDefaultNavigationTimeout(120000);
		//await page.setViewport({width:200, height:80});
		await page.goto("https://www.deezer.com/login");
		await page.type('#login_mail', config.email);
		await page.type('#login_password', config.password);
		await page.evaluate(()=>document.querySelector('#login_form_submit > span').click());
		//await page.keyboard.press('Enter');
		console.error("logging in...");
		self.sendSocketNotification("LogIn", "");
		await page.waitForNavigation({waitUntil:"networkidle0"});
		self.sendSocketNotification("Ready", "");
		console.error("ready to play music");
	// await page.waitFor('.is-highlight')
		loggedIn = true;
		await getCover();
		updateTitleAndArtist();
	}catch(error){
		console.error(error);
	}
	
    //await page.evaluate(()=>document.querySelector('.is-highlight').click())
}

async function update(){
	while(playingMusic){
		await updateTitleAndArtist();
		await delay(1000);
	}
}

function delay(time) {
	return new Promise(function(resolve) { 
		setTimeout(resolve, time)
	});
 }



async function getCover(){
	try{
		if(!playingMusic){
			if(!loggedIn){
				await LoginDeezer()
			}	
		} 
		await delay(1000);
		var link = await page.evaluate(()=>document.querySelector('#page_player > div > div.player-options > ul > li:nth-child(2) > button > figure > div > img').getAttribute('src'));
		var newlink = link.replace("28x28", "380x380");
		self.sendSocketNotification("Cover", newlink);
		console.error("got coverlink: " + newlink); 
	}catch(error){
		console.error(error);
	}

}

async function playMusic (){
	try{
		if(!playingMusic){
			if(!loggedIn){
				await LoginDeezer()
			}
			await page.evaluate(()=>document.querySelector('#page_player > div > div.player-controls > ul > li:nth-child(3) > button').click());
			playingMusic = true;
			update();
			console.error("playing music");
		}   
	}catch(error){
		console.error(error);
	}
	
}

async function pauseMusic (){
	try{
		if(playingMusic){
			if(!loggedIn){
				await LoginDeezer()
			}
			await page.evaluate(()=>document.querySelector('#page_player > div > div.player-controls > ul > li:nth-child(3) > button').click());  // yep, the same as playMusic()
			playingMusic = false;
			console.error("pause music");
		}  
	}catch(error){
		console.error(error);
	}
	
}

async function searchArtist(artist){
	try{
		if(!loggedIn){
			await LoginDeezer()
		}
		console.error("Searching for " + artist);
		await page.evaluate(()=>document.querySelector('#page_topbar > div.topbar-search > div > form > button.topbar-search-clear').click());
		await page.type('#topbar-search', artist);
		await page.keyboard.press('Enter');
		await delay(300);
		await page.waitForSelector('#page_naboo_search > div.container > div.search-suggest.clearfix > div.suggest-column.column-artist > ul > li > div.nano-card-infos > div.heading-4.ellipsis > a');
		await page.evaluate(()=>document.querySelector('#page_naboo_search > div.container > div.search-suggest.clearfix > div.suggest-column.column-artist > ul > li > div.nano-card-infos > div.heading-4.ellipsis > a').click());
		await page.waitForSelector('#page_naboo_artist > div.catalog-content > div > div:nth-child(1) > div:nth-child(1) > div > div > div.datagrid-container > div.datagrid > div.datagrid-row.song.is-first > div:nth-child(1) > div > a');
		await page.evaluate(()=>document.querySelector('#page_naboo_artist > div.catalog-content > div > div:nth-child(1) > div:nth-child(1) > div > div > div.datagrid-container > div.datagrid > div.datagrid-row.song.is-first > div:nth-child(1) > div > a').click());
		//await page.waitForSelector('#page_topbar > div.topbar-search > div > div > div > div > div.search-suggest-content.nano.has-scrollbar > div.nano-content > div > div:nth-child(1) > ul > li > div.nano-card-infos > div.heading-4.ellipsis > a');
		//var link = await page.evaluate(()=>document.querySelector('#page_naboo_search > div.container > div.search-suggest.clearfix > div.suggest-column.column-artist > ul > li > div.nano-card-infos > div.heading-4.ellipsis > a').getAttribute('href'));
		//await page.goto("https://www.deezer.com" + link + "/top_track");
		//await page.waitForSelector('#page_naboo_artist > div.catalog-content > div > div > div > div.datagrid-toolbar > div.toolbar-wrapper.toolbar-wrapper-full > div:nth-child(2) > button');
		//await page.evaluate(()=>document.querySelector('#page_naboo_artist > div.catalog-content > div > div > div > div.datagrid-toolbar > div.toolbar-wrapper.toolbar-wrapper-full > div:nth-child(2) > button').click());
		console.error("playing music from "+artist);
		
		if(!playingMusic){
			playingMusic = true;
			update();
		}
		await getCover();
	}catch(error){
		console.error(error);
	}
	
}

async function searchTitle(title){
	try{
		if(!loggedIn){
			await LoginDeezer()
		}
		console.error("Searching for " + title);
		await page.evaluate(()=>document.querySelector('#page_topbar > div.topbar-search > div > form > button.topbar-search-clear').click());
		await page.type('#topbar-search', title);
		await page.keyboard.press('Enter');
		await delay(300);
		await page.waitForSelector('#page_naboo_search > div.container > div:nth-child(2) > div > div.datagrid > div:nth-child(2) > div.datagrid-row.song.is-first > div:nth-child(1) > div.datagrid-cell-hover.cell-play > a');
		await page.evaluate(()=>document.querySelector('#page_naboo_search > div.container > div:nth-child(2) > div > div.datagrid > div:nth-child(2) > div.datagrid-row.song.is-first > div:nth-child(1) > div.datagrid-cell-hover.cell-play > a').click());
		//await page.waitForSelector('#page_topbar > div.topbar-search > div > div > div > div > div.search-suggest-content.nano.has-scrollbar > div.nano-content > div > div:nth-child(1) > ul > li > div.nano-card-infos > div.heading-4.ellipsis > a');
		//var link = await page.evaluate(()=>document.querySelector('#page_naboo_search > div.container > div.search-suggest.clearfix > div.suggest-column.column-artist > ul > li > div.nano-card-infos > div.heading-4.ellipsis > a').getAttribute('href'));
		//await page.goto("https://www.deezer.com" + link + "/top_track");
		//await page.waitForSelector('#page_naboo_artist > div.catalog-content > div > div > div > div.datagrid-toolbar > div.toolbar-wrapper.toolbar-wrapper-full > div:nth-child(2) > button');
		//await page.evaluate(()=>document.querySelector('#page_naboo_artist > div.catalog-content > div > div > div > div.datagrid-toolbar > div.toolbar-wrapper.toolbar-wrapper-full > div:nth-child(2) > button').click());
		console.error("playing title "+title);
		
		if(!playingMusic){
			playingMusic = true;
			update();
		}
		getCover();
	}catch(error){
		console.error(error);
	}
	
	
}

async function updateTitleAndArtist(){
	if(!loggedIn){
		await LoginDeezer()
	}
	try{
	//await page.waitForSelector('#page_player > div > div.player-track > div > div.track-heading > div.track-title > div > div > div > a:nth-child(1)');
	var title = await page.evaluate(()=>document.querySelector('#page_player > div > div.player-track > div > div.track-heading > div.track-title > div > div > div > a:nth-child(1)').textContent);
	//await page.waitForSelector('#page_player > div > div.player-track > div > div.track-heading > div.track-title > div > div > div > a:nth-child(2)');
	var artist = await page.evaluate(()=>document.querySelector('#page_player > div > div.player-track > div > div.track-heading > div.track-title > div > div > div > a:nth-child(2)').textContent); //a.track-link:nth-child(2)
	var currentTime = await page.evaluate(()=>document.querySelector('#page_player > div > div.player-track > div > div.track-seekbar > div > div.slider-counter.slider-counter-current').textContent);
	var maxTime = await page.evaluate(()=>document.querySelector('#page_player > div > div.player-track > div > div.track-seekbar > div > div.slider-counter.slider-counter-max').textContent);
	//self.sendSocketNotification("Title", text);
	//self.sendSocketNotification("Artist", artist);
	if(AdsPlaying){
		await getCover();
		AdsPlaying = false;
	}
	self.sendSocketNotification("Update", {
		Artist: artist,
		Title:title,
		CurrentTime : currentTime,
		MaxTime : maxTime,
	});
	}catch(error){
		self.sendSocketNotification("Ads", "");
		AdsPlaying = true;
		return;
	}
}


async function nextTitle(){
	try{
		if(!loggedIn){
			await LoginDeezer()
		}
		await page.evaluate(()=>document.querySelector('#page_player > div > div.player-controls > ul > li:nth-child(5) > div > button').click());
		if(!playingMusic){
			playingMusic = true;
			update();
		}
		getCover();
		console.error("next title");
	}catch(error){
		console.error(error);
	}
    
	
}

async function previousTitle (){
	try{
		if(!loggedIn){
			await LoginDeezer()
		}
		await page.evaluate(()=>document.querySelector('#page_player > div > div.player-controls > ul > li:nth-child(1) > div > button').click());
		if(!playingMusic){
			playingMusic = true;
			update();
		}
		await getCover();
		console.error("previous title");
	}catch(error){
		console.error(error);
	}
    
	
}