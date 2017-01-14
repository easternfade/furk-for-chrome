/* global chrome */
// Extension storage access

// var FurkForChromeStorage = (function() {
define(function () {

   return {
      storageKeys: {
         'API_KEY': 'furkForChrome_apiKey',
         'TTS_ENABLE': 'furkForChrome_ttsEnable'
      },
      Get: function(storageKey, itemCallback) {

         if ( ! this.storageKeys[storageKey] ) {
            console.log("Storage key " + storageKey + " is not a valid key name.");
            itemCallback( {status: 'Error' }, undefined);
            return;
         }

         chrome.storage.sync.get(this.storageKeys[storageKey], function(items) {
            if (items[this.storageKeys[storageKey]]) {
               itemCallback( {status: 'OK' }, items[this.storageKeys[storageKey]]);
            } else {
               itemCallback( {status: 'Error' }, undefined);
            }
         });
      }
   };
});
// }());