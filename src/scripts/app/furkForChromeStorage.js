// Extension storage access

export default class FurkForChromeStorage {
	static storageKeys = {
		API_KEY: "furkForChrome_apiKey",
		TTS_ENABLE: "furkForChrome_ttsEnable",
	};

	static Get(storageKey, itemCallback) {
		if (!FurkForChromeStorage.storageKeys[storageKey]) {
			console.log(
				"Storage key " + storageKey + " is not a valid key name."
			);
			itemCallback({ status: "Error" }, undefined);
			return;
		}

		chrome.storage.sync.get(
			FurkForChromeStorage.storageKeys[storageKey],
			function (items) {
				if (items[FurkForChromeStorage.storageKeys[storageKey]]) {
					itemCallback(
						{ status: "OK" },
						items[FurkForChromeStorage.storageKeys[storageKey]]
					);
				} else {
					itemCallback({ status: "Error" }, undefined);
				}
			}
		);
	}

	static Store(storageKey, value, itemCallback) {
		if (!FurkForChromeStorage.storageKeys[storageKey]) {
			console.log(
				"Storage key " + storageKey + " is not a valid key name."
			);
			itemCallback({ status: "Error" });
			return;
		}

		chrome.storage.sync.set({
            [FurkForChromeStorage.storageKeys[storageKey]]: value
        }, () => {
                itemCallback({ status: "Saved" });
			}
		);
	}
}
