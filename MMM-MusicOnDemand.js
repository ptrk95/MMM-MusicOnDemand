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
		this.init = "Initializing...";
		this.Title = "";
		this.Artist = "";
		this.currentTime = "";
		this.maxTime = "";
		this.CoverLink = "";
		this.closed = false;
		this.sendSocketNotification("CONFIG", this.config);	
	},
	
	getDom: function(){
		var wrapper = document.createElement("div");
		var text = '';
		Log.error(this.closed);
		if(!this.closed){
			text += "<div class='MOD_player'>";
			text += "<div class='MOD_text-container'><table class='small'><tr class='MOD_init'><td>"+ this.init +"</td></tr><tr class='MOD_title bright'><td>"+ this.Title +"</td></tr><tr class='MOD_artist'><td>"+ this.Artist +"</td></tr><tr class='MOD_time'><td>"+ this.currentTime + " " + this.maxTime + "</td></tr></table></div>";
			if(this.config.showCover && this.Artist != "Deezer"){
				text += "<div class='MOD_cover-container'><div class='MOD_cover'><img src='"+ this.CoverLink +"' width='250'></div></div>";
			}

			text += "</div>";
			//text = "<p>" + init + "<br>" + "Title: " + Title + "<br>" + "Artist: " + Artist + "<br>" + currentTime + "/" + maxTime + "</p>" + Cover;
		}else{
			wrapper.innerHTML = "";
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		wrapper.innerHTML = text;
		return wrapper;
		
	},

	socketNotificationReceived: function(notification, payload) {
		switch(notification){
			case("LogIn"):
				this.closed = false;
				this.init = "Logging in to deezer...";
				break;
			case("Ready"):
				this.init = "";
				break;
			case("Title"):
				this.Title = payload;
				break;
			case("Update"):
				this.Artist = payload.Artist;
				this.Title = payload.Title;
				this.maxTime = payload.MaxTime;
				this.currentTime = payload.CurrentTime + ' /';
				break;
			case("Ads"):
				this.Title = "Ads";
				this.Artist = "Deezer";
				this.currentTime = "";
				this.maxTime = "";
				this.Cover = "";
			case("Cover"):
				this.CoverLink = payload;
				break;
			case("Closed"):
				this.closed = true;
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
