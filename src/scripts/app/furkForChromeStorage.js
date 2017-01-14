/* global chrome */
// Extension storage access

// var FurkForChromeStorage = (function() {
define(function () {

    var module = {
        storageKeys: {
            'API_KEY': 'furkForChrome_apiKey',
            'TTS_ENABLE': 'furkForChrome_ttsEnable'
        },
        Get: function (storageKey, itemCallback) {

            if (!module.storageKeys[storageKey]) {
                console.log("Storage key " + storageKey + " is not a valid key name.");
                itemCallback({ status: 'Error' }, undefined);
                return;
            }

            chrome.storage.sync.get(module.storageKeys[storageKey], function (items) {
                if (items[module.storageKeys[storageKey]]) {
                    itemCallback({ status: 'OK' }, items[module.storageKeys[storageKey]]);
                } else {
                    itemCallback({ status: 'Error' }, undefined);
                }
            });
        }
    };
    return module;
});
// }());