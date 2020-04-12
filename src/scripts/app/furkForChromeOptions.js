/**
 * Manage extension options
 *
 * ES2019
 */

import FurkAPI from "./furkAPI";
import FurkForChromeStorage from "./furkForChromeStorage";

export default class FurkForChromeOptions {
	static extractApiKey(textBoxTarget) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", FurkAPI.FurkApiPage, true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				if (xhr.responseText !== "") {
					var re = /<li>api_key.+?Your API key is:.*?([0-9a-f]+).*?<\/li>/gm;
					var matches = re.exec(xhr.responseText);
					if (matches) {
						textBoxTarget.innerText = matches[1];
					}
				}
			}
		};
		xhr.send();
	}

	// Restores select box state to saved value from localStorage.
	static restoreOptions() {
		//chrome.storage.sync.get(FurkForChromeStorage.storageKeys.API_KEY, function(items) {
		FurkForChromeStorage.Get("API_KEY", function (result, item) {
			if (result.status === "OK") {
				console.log(
					"Loaded " + FurkForChromeStorage.storageKeys.API_KEY
				);
				var textBox = document.getElementById("furkForChrome_apiKey");
				if (textBox) {
					// && items[FurkForChromeStorage.storageKeys.API_KEY]) {
					textBox.value = item;
				}
			}
		});

		FurkForChromeStorage.Get("TTS_ENABLE", function (result, item) {
			if (result.status === "OK") {
				console.log(
					"Loaded " + FurkForChromeStorage.storageKeys.TTS_ENABLE
				);
				var checkBox = document.getElementById(
					"furkForChrome_ttsEnable"
				);
				if (checkBox) {
					checkBox.checked = item;
				}
			}
		});
	}

	// Saves options to storage
	static saveOptions() {
		var apiKey = document.getElementById("furkForChrome_apiKey").value;
		FurkForChromeStorage.Store("API_KEY", apiKey, (status) => {
			console.log("Save action for API_KEY: " + status.status);
		});

		var ttsEnable = document.getElementById("furkForChrome_ttsEnable")
			.checked;
		FurkForChromeStorage.Store("TTS_ENABLE", ttsEnable, (status) => {
			console.log("Save action for TTS_ENABLE: " + status.status);
		});
	}

	static #loadExtensionInfo() {
		chrome.management.getSelf(function (extensionInfo) {
			var textBox = document.getElementById("ext_name");

			if (textBox) {
				textBox.innerText =
					extensionInfo.name + " " + extensionInfo.version;
			}
		});
	}

	// Attempts to scrape the API key from Furk
	static findApiKey() {
		var textBox = document.getElementById("furkForChrome_apiKey");

		if (textBox) {
			FurkForChromeOptions.extractApiKey(textBox);
		}
	}

	static init() {
		// Populate dynamic content
		FurkForChromeOptions.#loadExtensionInfo();

		// Load options from local storage
		FurkForChromeOptions.restoreOptions();

		// Bind options page event handlers

		// 1. Save  then close tab on button click
		var closeButton = document.getElementById("btn_close");
		if (closeButton) {
			closeButton.onclick = function () {
				chrome.tabs.getCurrent(function (tab) {
					FurkForChromeOptions.saveOptions();
					chrome.tabs.remove(tab.id);
				});
				return false;
			};
		}

		// 2. Autoload API key
		var findApiLink = document.getElementById("a_findApiKey");
		if (findApiLink) {
			findApiLink.onclick = function () {
				alert("Sorry, work in progress!");
			}; // FurkForChromeOptions.findApiKey;
		}

		// 3. Manual save button
		var saveButton = document.getElementById("btn_save");
		if (saveButton) {
			saveButton.onclick = FurkForChromeOptions.saveOptions;
		}
	}
}
