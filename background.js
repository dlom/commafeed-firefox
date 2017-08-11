let url = "https://www.commafeed.com";
let alarmName = "commafeed-checker";
let checkInterval = 0.2; // minutes

browser.browserAction.onClicked.addListener(function() {
	browser.tabs.query({
		"currentWindow": true,
		"url": url + "/*"
	}).then(function(tabs) {
		if (tabs.length > 0) {
			browser.tabs.update(tabs[0].id, {
				"active": true
			});
		} else {
			browser.tabs.create({
				"active": true,
				"url": url
			});
		}
	});
});

browser.alarms.create(alarmName, {
	"periodInMinutes": checkInterval
});

let setBadge = function(text) {
	browser.browserAction.setBadgeText({
		"text": text
	});
};

browser.alarms.onAlarm.addListener(function(alarm) {
	if (alarm.name === alarmName) {
		fetch(url + "/rest/category/unreadCount", {
			"credentials": "include"
		}).then(function(response) {
			let contentType = response.headers.get("content-type");
			if (contentType && contentType.includes("application/json")) {
				return response.json();
			} else {
				setBadge("?");
			}
		}).then(function(json) {
			if (json != null) {
				let count = 0;
				for (var i = 0; i < json.length; i++) {
					count += json[i].unreadCount;
				}
				setBadge((count === 0) ? "" : count.toString());

			} else {
				setBadge("?");
			}
		});
	}
});