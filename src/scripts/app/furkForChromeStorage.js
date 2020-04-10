// Extension storage access

export default {
	storageKeys: {
		API_KEY: "furkForChrome_apiKey",
		TTS_ENABLE: "furkForChrome_ttsEnable",
	},
	Get: function (storageKey, itemCallback) {
        const self = this;

		if (!self.storageKeys[storageKey]) {
			console.log(
				"Storage key " + storageKey + " is not a valid key name."
			);
			itemCallback({ status: "Error" }, undefined);
			return;
		}

		chrome.storage.sync.get(self.storageKeys[storageKey], function (items) {
			if (items[self.storageKeys[storageKey]]) {
				itemCallback(
					{ status: "OK" },
					items[self.storageKeys[storageKey]]
				);
			} else {
				itemCallback({ status: "Error" }, undefined);
			}
		});
	},
};
