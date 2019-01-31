
var text = "Initializing...";
var Title = "";
var Artist = "";
var currentTime = "";
var maxTime = "";
var Cover = "";
var CoverLink = "";

Module.register("MMM-MusicOnDemand",{
	
	defaults:{
		email: "maxmustermann@email.com",
		password: "MaxMusterMann"
	},
	
	start: function(){
		this.sendSocketNotification("CONFIG", this.config);	
	},
	
	getDom: function(){
		var wrapper = document.createElement("div");
		wrapper.innerHTML = "<p>" + text + "<br>" + "Title: " + Title + "<br>" + "Artist: " + Artist + "<br>" + currentTime + "/" + maxTime + "</p>" + Cover;
		return wrapper;
		
	},

	socketNotificationReceived: function(notification, payload) {
		switch(notification){
			case("LogIn"):
				text = "Logging in to deezer...";
				this.updateDom();
				break;
			case("Ready"):
				text = "";
				this.updateDom();
				break;
			case("Title"):
				Title = payload;
				this.updateDom();
				break;
			case("Update"):
				Artist = payload.Artist;
				Title = payload.Title;
				maxTime = payload.MaxTime;
				currentTime = payload.CurrentTime;
				this.updateDom();
				break;
			case("Ads"):
				Title = "Ads";
				Artist = "Deezer";
				Cover = "";
				this.updateDom();
			case("Cover"):
				CoverLink = payload;
				Cover = '<img height="250" width="250" src="' + CoverLink + '" </img>';
				this.updateDom();
				break;
			default:
				break;

		}
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
					this.sendSocketNotification("Artist", payload.Artist.Artist);				
					break;
				case("Close"):
					this.sendSocketNotification("Close", "");
					break;
				case("Title"):
					this.sendSocketNotification("Title", payload.Title.Title);
					break;
				default:
					break;

			}					
		}
	}
	
	
});
