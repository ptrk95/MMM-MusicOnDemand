
var init = "Initializing...";
var Title = "";
var Artist = "";
var currentTime = "";
var maxTime = "";
var CoverLink = "";
var closed = false;

Module.register("MMM-MusicOnDemand",{
	
	defaults:{
		chromiumPath: "/usr/bin/chromium-browser", // Set: chromiumPath : null, if you want to use the puppeteer chromium
		showCover : true,
		email: "maxmustermann@email.com",
		password: "MaxMusterMann"
	},

	getStyles: function() {
		return ['style.css',];
	},
	
	start: function(){
		this.sendSocketNotification("CONFIG", this.config);	
	},
	
	getDom: function(){
		var wrapper = document.createElement("div");
		var text = '';
		if(!closed){
			text += "<div class='player'>";
			text += "<div class='text-container'><table class='small'><tr class='title bright'><td>"+ Title +"</td></tr><tr class='artist'><td>"+ Artist +"</td></tr><tr class='init'><td>"+ init +"</td><tr class='time'><td>"+ currentTime + " " + maxTime + "</td></tr></tr></table></div>";
			if(this.config.showCover && Artist != "Deezer"){
				text += "<div class='cover-container'><div class='cover'><img src='"+ CoverLink +"' width='250'></div></div>";
			}

			text += "</div>";
			//text = "<p>" + init + "<br>" + "Title: " + Title + "<br>" + "Artist: " + Artist + "<br>" + currentTime + "/" + maxTime + "</p>" + Cover;
		}else{
			wrapper.innerHTML = "Closed";
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		wrapper.innerHTML = text;
		return wrapper;
		
	},

	socketNotificationReceived: function(notification, payload) {
		switch(notification){
			case("LogIn"):
				closed = false;
				init = "Logging in to deezer...";
				break;
			case("Ready"):
				init = "";
				break;
			case("Title"):
				Title = payload;
				break;
			case("Update"):
				Artist = payload.Artist;
				Title = payload.Title;
				maxTime = payload.MaxTime;
				currentTime = payload.CurrentTime;
				break;
			case("Ads"):
				Title = "Ads";
				Artist = "Deezer";
				Cover = "";
			case("Cover"):
				CoverLink = payload;
				break;
			case("Closed"):
				closed = true;
				break;
			default:
				break;

		}
		this.updateDom();
	},
	
	notificationReceived: function(notification, payload, sender) {
		if (sender) {
			Log.log(this.name + " received a module notification: " + notification + " from sender: " + sender.name);
		} else {
			Log.log(this.name + " received a system notification: " + notification);
		}
		if(notification == "AtMusicOnDemand"){
			switch(payload.message){
				case("Play"):
					this.sendSocketNotification("PLAY", "");
					break;
				case("Pause"):
					this.sendSocketNotification("PAUSE", "");
					break;
				case("Next"):
					this.sendSocketNotification("NEXT", "");
					break;
				case("Previous"):
					this.sendSocketNotification("PREVIOUS", "");
					break;
				case("Artist"):
					this.sendSocketNotification("Artist", payload.Artist);				
					break;
				case("Close"):
					this.sendSocketNotification("Close", "");
					break;
				case("Title"):
					this.sendSocketNotification("Title", payload.Title);
					break;
				default:
					break;

			}					
		}
	}
	
	
});
