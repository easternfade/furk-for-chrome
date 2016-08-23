/* global chrome */
// Extension storage access

var FurkForChromeStorage = (function() {

   return {
      storageKeys: {
         'API_KEY': 'furkForChrome_apiKey',
         'TTS_ENABLE': 'furkForChrome_ttsEnable'
      },
      Get: function(storageKey, itemCallback) {

         if ( ! FurkForChromeStorage.storageKeys[storageKey] ) {
            console.log("Storage key " + storageKey + " is not a valid key name.");
            itemCallback( {status: 'Error' }, undefined);
            return;
         }

         chrome.storage.sync.get(FurkForChromeStorage.storageKeys[storageKey], function(items) {
            if (items[FurkForChromeStorage.storageKeys[storageKey]]) {
               itemCallback( {status: 'OK' }, items[FurkForChromeStorage.storageKeys[storageKey]]);
            } else {
               itemCallback( {status: 'Error' }, undefined);
            }
         });
      }
   };

}());