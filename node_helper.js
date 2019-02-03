"use strict";


const puppeteer = require('puppeteer');
var NodeHelper = require("node_helper");
var self;

module.exports = NodeHelper.create({

	start : function(){
		self = this;
		self.playingMusic = false;
		self.loggedIn = false;
		self.page;
		self.browser;
		self.config = {};
		self.AdsPlaying = false;
		self.closed = false;
	},

	socketNotificationReceived: function(notification, payload) {
		self.closed = false;
		switch(notification){
			case("CONFIG"):
				self.config = payload;
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
				closeBrowser(false);
				self.closed = true;
				break;
			case("Title"):
				searchTitle(payload);
				break;
			default:
				break;			
		}
	}, 

	stop : function(){
		closeBrowser(true);
	}
});

async function closeBrowser(stop){
	try{
		if(!self.closed){
			if(!stop){
				self.sendSocketNotification("Closed", "");
			}
			self.loggedIn = false;
			self.playingMusic = false;
			await self.page.close();
			await self.browser.close();
		}
		
		
	}catch(error){
		console.error(error);
	}
	
}


async function LoginDeezer(){
	try{
		if(self.config.chromiumPath != null){
			self.browser = await puppeteer.launch({ executablePath: self.config.chromiumPath, ignoreDefaultArgs: ['--mute-audio'], headless : !self.config.showBrowser }); // headless : false
		}else{
			self.browser = await puppeteer.launch({ignoreDefaultArgs: ['--mute-audio'], headless : !self.config.showBrowser }); // headless : false
		}
	
		self.page = await self.browser.newPage();
		
		await self.page.setDefaultNavigationTimeout(120000);
		//await page.setViewport({width:200, height:80});
		await self.page.goto("https://www.deezer.com/login");
		await self.page.type('#login_mail', self.config.email);
		await self.page.type('#login_password', self.config.password);
		await self.page.evaluate(()=>document.querySelector('#login_form_submit > span').click());
		//await page.keyboard.press('Enter');
		console.error("logging in...");
		self.sendSocketNotification("LogIn", "");
		await self.page.waitForNavigation({waitUntil:"networkidle0"});
		self.sendSocketNotification("Ready", "");
		console.error("ready to play music");
		// await page.waitFor('.is-highlight')
		self.loggedIn = true;
		await getCover();
		updateTitleAndArtist();
	}catch(error){
		console.error(error);
	}
	
    //await page.evaluate(()=>document.querySelector('.is-highlight').click())
}

async function update(){
	while(self.playingMusic){
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
		if(!self.playingMusic){
			if(!self.loggedIn){
				await LoginDeezer()
			}	
		} 
		await delay(1500);
		var link = await self.page.evaluate(()=>document.querySelector('#page_player > div > div.player-options > ul > li:nth-child(2) > button > figure > div > img').getAttribute('src'));
		var newlink = link.replace("28x28", "380x380");
		self.sendSocketNotification("Cover", newlink);
		console.error("got coverlink: " + newlink); 
	}catch(error){
		console.error(error);
	}

}

async function playMusic (){
	try{
		if(!self.playingMusic){
			if(!self.loggedIn){
				await LoginDeezer()
			}
			await self.page.evaluate(()=>document.querySelector('#page_player > div > div.player-controls > ul > li:nth-child(3) > button').click());
			self.playingMusic = true;
			update();
			console.error("playing music");
		}   
	}catch(error){
		console.error(error);
	}
	
}

async function pauseMusic (){
	try{
		if(self.playingMusic){
			if(!self.loggedIn){
				await LoginDeezer()
			}
			await self.page.evaluate(()=>document.querySelector('#page_player > div > div.player-controls > ul > li:nth-child(3) > button').click());  // yep, the same as playMusic()
			self.playingMusic = false;
			console.error("pause music");
		}  
	}catch(error){
		console.error(error);
	}
	
}

async function searchArtist(artist){
	try{
		if(!self.loggedIn){
			await LoginDeezer()
		}
		console.error("Searching for " + artist);
		await self.page.evaluate(()=>document.querySelector('#page_topbar > div.topbar-search > div > form > button.topbar-search-clear').click());
		await self.page.type('#topbar-search', artist);
		await self.page.keyboard.press('Enter');
		await delay(300);
		await self.page.waitForSelector('#page_naboo_search > div.container > div.search-suggest.clearfix > div.suggest-column.column-artist > ul > li > div.nano-card-infos > div.heading-4.ellipsis > a');
		await self.page.evaluate(()=>document.querySelector('#page_naboo_search > div.container > div.search-suggest.clearfix > div.suggest-column.column-artist > ul > li > div.nano-card-infos > div.heading-4.ellipsis > a').click());
		await self.page.waitForSelector('#page_naboo_artist > div.catalog-content > div > div:nth-child(1) > div:nth-child(1) > div > div > div.datagrid-container > div.datagrid > div.datagrid-row.song.is-first > div:nth-child(1) > div > a');
		await self.page.evaluate(()=>document.querySelector('#page_naboo_artist > div.catalog-content > div > div:nth-child(1) > div:nth-child(1) > div > div > div.datagrid-container > div.datagrid > div.datagrid-row.song.is-first > div:nth-child(1) > div > a').click());
		//await page.waitForSelector('#page_topbar > div.topbar-search > div > div > div > div > div.search-suggest-content.nano.has-scrollbar > div.nano-content > div > div:nth-child(1) > ul > li > div.nano-card-infos > div.heading-4.ellipsis > a');
		//var link = await page.evaluate(()=>document.querySelector('#page_naboo_search > div.container > div.search-suggest.clearfix > div.suggest-column.column-artist > ul > li > div.nano-card-infos > div.heading-4.ellipsis > a').getAttribute('href'));
		//await page.goto("https://www.deezer.com" + link + "/top_track");
		//await page.waitForSelector('#page_naboo_artist > div.catalog-content > div > div > div > div.datagrid-toolbar > div.toolbar-wrapper.toolbar-wrapper-full > div:nth-child(2) > button');
		//await page.evaluate(()=>document.querySelector('#page_naboo_artist > div.catalog-content > div > div > div > div.datagrid-toolbar > div.toolbar-wrapper.toolbar-wrapper-full > div:nth-child(2) > button').click());
		console.error("playing music from "+artist);
		
		if(!self.playingMusic){
			self.playingMusic = true;
			update();
		}
		await getCover();
	}catch(error){
		console.error(error);
	}
	
}

async function searchTitle(title){
	try{
		if(!self.loggedIn){
			await LoginDeezer()
		}
		console.error("Searching for " + title);
		await self.page.evaluate(()=>document.querySelector('#page_topbar > div.topbar-search > div > form > button.topbar-search-clear').click());
		await self.page.type('#topbar-search', title);
		await self.page.keyboard.press('Enter');
		await delay(300);
		await self.page.waitForSelector('#page_naboo_search > div.container > div:nth-child(2) > div > div.datagrid > div:nth-child(2) > div.datagrid-row.song.is-first > div:nth-child(1) > div.datagrid-cell-hover.cell-play > a');
		await self.page.evaluate(()=>document.querySelector('#page_naboo_search > div.container > div:nth-child(2) > div > div.datagrid > div:nth-child(2) > div.datagrid-row.song.is-first > div:nth-child(1) > div.datagrid-cell-hover.cell-play > a').click());
		//await page.waitForSelector('#page_topbar > div.topbar-search > div > div > div > div > div.search-suggest-content.nano.has-scrollbar > div.nano-content > div > div:nth-child(1) > ul > li > div.nano-card-infos > div.heading-4.ellipsis > a');
		//var link = await page.evaluate(()=>document.querySelector('#page_naboo_search > div.container > div.search-suggest.clearfix > div.suggest-column.column-artist > ul > li > div.nano-card-infos > div.heading-4.ellipsis > a').getAttribute('href'));
		//await page.goto("https://www.deezer.com" + link + "/top_track");
		//await page.waitForSelector('#page_naboo_artist > div.catalog-content > div > div > div > div.datagrid-toolbar > div.toolbar-wrapper.toolbar-wrapper-full > div:nth-child(2) > button');
		//await page.evaluate(()=>document.querySelector('#page_naboo_artist > div.catalog-content > div > div > div > div.datagrid-toolbar > div.toolbar-wrapper.toolbar-wrapper-full > div:nth-child(2) > button').click());
		console.error("playing title "+title);
		
		if(!self.playingMusic){
			self.playingMusic = true;
			update();
		}
		getCover();
	}catch(error){
		console.error(error);
	}
	
	
}

async function updateTitleAndArtist(){
	if(!self.loggedIn){
		await LoginDeezer()
	}
	try{
	//await page.waitForSelector('#page_player > div > div.player-track > div > div.track-heading > div.track-title > div > div > div > a:nth-child(1)');
	var title = await self.page.evaluate(()=>document.querySelector('#page_player > div > div.player-track > div > div.track-heading > div.track-title > div > div > div > a:nth-child(1)').textContent);
	//await page.waitForSelector('#page_player > div > div.player-track > div > div.track-heading > div.track-title > div > div > div > a:nth-child(2)');
	var artist = await self.page.evaluate(()=>document.querySelector('#page_player > div > div.player-track > div > div.track-heading > div.track-title > div > div > div > a:nth-child(2)').textContent); //a.track-link:nth-child(2)
	var currentTime = await self.page.evaluate(()=>document.querySelector('#page_player > div > div.player-track > div > div.track-seekbar > div > div.slider-counter.slider-counter-current').textContent);
	var maxTime = await self.page.evaluate(()=>document.querySelector('#page_player > div > div.player-track > div > div.track-seekbar > div > div.slider-counter.slider-counter-max').textContent);
	//self.sendSocketNotification("Title", text);
	//self.sendSocketNotification("Artist", artist);
	if(self.AdsPlaying){
		await getCover();
		self.AdsPlaying = false;
	}
	self.sendSocketNotification("Update", {
		Artist: artist,
		Title:title,
		CurrentTime : currentTime,
		MaxTime : maxTime,
	});
	}catch(error){
		self.sendSocketNotification("Ads", "");
		self.AdsPlaying = true;
		return;
	}
}


async function nextTitle(){
	try{
		if(!self.loggedIn){
			await LoginDeezer()
		}
		await self.page.evaluate(()=>document.querySelector('#page_player > div > div.player-controls > ul > li:nth-child(5) > div > button').click());
		if(!self.playingMusic){
			self.playingMusic = true;
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
		if(!self.loggedIn){
			await LoginDeezer()
		}
		await self.page.evaluate(()=>document.querySelector('#page_player > div > div.player-controls > ul > li:nth-child(1) > div > button').click());
		if(!self.playingMusic){
			self.playingMusic = true;
			update();
		}
		await getCover();
		console.error("previous title");
	}catch(error){
		console.error(error);
	}
    
	
}