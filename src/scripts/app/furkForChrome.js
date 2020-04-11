/*
 * FurkForChrome
 * Provides functionality exposed via background page.
 * 
 * ES2019
 */

import { FurkAPI } from "./furkAPI";
import notifications from "./furkForChromeNotifications";
import base32converter from "../util/base32";

export class FurkForChrome {

    static #menuInitialised = false;

    static #torrentSites = [
			"*://*/*.torrent",
			"*://*/*.torrent?*",
			"*://torrentz2.eu/*",
			"magnet:*",
			//'<all_urls>' // for testing
        ];

    static #downloadUrlFilters = {
                url: [{ schemes: ["magnet"] }],
            };
    
    constructor() { }

    static init() {
        FurkForChrome.#createContextMenu();
		FurkForChrome.#attachDownloadHandler();
    }

	static #processResponse (xhr) {
		if (xhr === undefined) {
			return undefined;
		}

		xhr.responseJson = JSON.parse(xhr.responseText);
		return xhr;
	}

	// Parse XHR response and generate a notification
	static #parseApiResponse (e) {
		var notificationMessage = "";

		var xhr = FurkForChrome.#processResponse(e);

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
			? notifications.createNotification(notificationMessage, FurkForChrome)
			: notifications.createNotificationLegacy(notificationMessage);
	}

	static #handleDownload (downloadItem, suggest) {}
	
	static #parseUrl (info) {
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
	}

	// Handle Furk API response
	static furkAPIResponse(e) {
		FurkForChrome.#parseApiResponse(e.target);
    }
    
	static #download (e) {
		var xhr = FurkForChrome.#processResponse(e.target);

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
	}
    
    static notificationHandler (notificationId, buttonIndex) {
		FurkAPI.getFile(notificationId, FurkForChrome.download);
    }
    
	static loginHandler (notificationId, buttonIndex) {
		chrome.tabs.create({ url: FurkAPI.FurkLoginUrl });
    }
    
	static #createContextMenu () {
		if (FurkForChrome.menuInitialised) {
			return;
		}
		FurkForChrome.menuInitialised = true;

		var title = "Add to Furk";

		chrome.contextMenus.onClicked.addListener(function (info, tab) {
			switch (info.menuItemId) {
				case "ffc_context_main":
					FurkAPI.addToFurk(
						FurkForChrome.#parseUrl(info),
						FurkForChrome.furkAPIResponse
					);
					break;
			}
		});

		chrome.contextMenus.create({
			id: "ffc_context_main",
			title: title,
			contexts: ["link"],
			targetUrlPatterns: FurkForChrome.torrentSites,
		});
    }
    
	static #attachDownloadHandler () {
		chrome.downloads.onDeterminingFilename.addListener(FurkForChrome.handleDownload);
		// chrome.downloads.onCreated.addListener(handleDownload);
		// chrome.webNavigation.onBeforeNavigate.addListener(module.handleDownload);
		//    , {
		//    url: [
		//        { schemes: ['magnet'] }
		//    ]
		//});
	}
};
