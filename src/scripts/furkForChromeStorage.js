// Extension storage access

var FurkForChromeStorage = (function() {

   return {
      storageKeys: {
         'API_KEY': 'furkForChrome_apiKey'
      },
      Get: function(storageKey, itemCallback) {

         if ( ! FurkForChromeStorage.storageKeys[storageKey] ) {
            console.log("Storage key " + storageKey + " is not a valid key name.");
            return undefined;
         }

         var storageItem = undefined;

         chrome.storage.sync.get(FurkForChromeStorage.storageKeys[storageKey], function(items) {
            if (items[FurkForChromeStorage.storageKeys[storageKey]]) {
               itemCallback( {status: 'OK' }, items[FurkForChromeStorage.storageKeys[storageKey]]);
               return;
            }
            itemCallback( {status: 'Error' }, null);
         });
      }
   };

}());