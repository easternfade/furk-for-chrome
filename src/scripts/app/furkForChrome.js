/*
 * FurkForChrome
 * Provides functionality exposed via background page.
 */

import { FurkAPI } from "./furkAPI";
import notifications from "./furkForChromeNotifications";
import base32converter from "../util/base32";

export default {
	menuInitialised: false,

	processResponse: function (xhr) {
		if (xhr === undefined) {
			return undefined;
		}

		xhr.responseJson = JSON.parse(xhr.responseText);
		return xhr;
	},

	// Parse XHR response and generate a notification
	parseApiResponse: function (e) {
		var notificationMessage = "";

		var xhr = this.processResponse(e);

		switch (xhr.status) {
			case 500:
				notificationMessage = notifications.buildErrorNotification(xhr);
				break;
			case 200:
				// Sometimes the API returns an error within a successful response
				if (xhr.responseJson.status === "error") {
					notificationMessage = notifications.buildErrorNotification(
						xhr
					);
					break;
				}
				notificationMessage = notifications.buildSuccessNotification(
					xhr.responseJson
				);
				break;
		}

		return chrome.notifications
			? notifications.createNotification(notificationMessage, this)
			: notifications.createNotificationLegacy(notificationMessage);
	},

	handleDownload: function (downloadItem, suggest) {},

	torrentSites: function () {
		return [
			"*://*/*.torrent",
			"*://*/*.torrent?*",
			"*://torrentz2.eu/*",
			"magnet:*",
			//'<all_urls>' // for testing
		];
	},
	downloadUrlFilters: function () {
		return {
			url: [{ schemes: ["magnet"] }],
		};
	},
	parseUrl: function (info) {
		// magnet:?xt=urn:btih:H45CQLWS7NUFP3UBECKRIWGZ3BWUTWZ5&dn=Falling.Skies.S04E06.720p.HDTV.x264-IMMERSE&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.publicbt.com:80&tr=udp://tracker.istole.it:80&tr=udp://open.demonii.com:80&tr=udp://tracker.coppersurfer.tk:80
		// Create a link object to return
		var link = {};
		link.url = info.linkUrl;

		var hexPattern = /[a-fA-F0-9]{40}/;
		var base32Pattern = /[a-zA-Z0-9]{32}/;

		// Get hash if present - detect if base32 or Hex
		var result = hexPattern.exec(info.linkUrl);

		if (result !== null) {
			link.hash = result[0] || undefined;
		} else {
			result = base32Pattern.exec(info.linkUrl);

			var base32Hash = undefined;
			if (result !== null && result.length > 0) {
				base32Hash = result[0] || undefined;
			}

			if (base32Hash !== undefined) {
				link.hash = base32converter.convert(base32Hash);
			}
		}
		link.text = info.selectionText || " ";
		link.pageUrl = info.pageUrl;

		return link;
	},

	// Handle Furk API response
	furkAPIResponse: function (e) {
		this.parseApiResponse(e.target);
	},
	download: function (e) {
		var xhr = this.processResponse(e.target);

		if (xhr !== undefined) {
			// Speak!
			chrome.tts
				? chrome.tts.speak("Downloading Now", {
						lang: "en-UK",
						rate: 2.0,
				  })
				: function () {};

			// Start download
			chrome.downloads.download({
				url: xhr.responseJson.files[0].url_dl,
				conflictAction: "prompt",
			});
		}
	},
	notificationHandler: function (notificationId, buttonIndex) {
		FurkAPI.getFile(notificationId, this.download);
	},
	loginHandler: function (notificationId, buttonIndex) {
		chrome.tabs.create({ url: FurkAPI.FurkLoginUrl });
	},
	createContextMenu: function () {
		if (this.menuInitialised) {
			return;
		}
		this.menuInitialised = true;

		var title = "Add to Furk";

		var self = this;
		chrome.contextMenus.onClicked.addListener(function (info, tab) {
			switch (info.menuItemId) {
				case "ffc_context_main":
					FurkAPI.addToFurk(
						self.parseUrl(info),
						self.furkAPIResponse
					);
					break;
			}
		});

		chrome.contextMenus.create({
			id: "ffc_context_main",
			title: title,
			contexts: ["link"],
			targetUrlPatterns: this.torrentSites(),
		});
	},
	attachDownloadHandler: function () {
		chrome.downloads.onDeterminingFilename.addListener(this.handleDownload);
		// chrome.downloads.onCreated.addListener(handleDownload);
		// chrome.webNavigation.onBeforeNavigate.addListener(module.handleDownload);
		//    , {
		//    url: [
		//        { schemes: ['magnet'] }
		//    ]
		//});
	},
	/*
	 * Initialise extension
	 */
	init: function () {
		this.createContextMenu();
		this.attachDownloadHandler();
	},
};

//     return module;
// });
// }());

// window.addEventListener('DOMContentLoaded', function() {
//     FurkForChrome.init();
// });
