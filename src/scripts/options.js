//'use strict';

var FurkForChromeOptions = (function () {

    this.extractApiKey = function(textBoxTarget) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", FurkAPI.FurkApiPage(), true);
        xhr.onreadystatechange = function() {
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
    };

    /// Public methods
    return {
        // Restores select box state to saved value from localStorage.
        restoreOptions: function () {
            //chrome.storage.sync.get(FurkForChromeStorage.storageKeys.API_KEY, function(items) {
            FurkForChromeStorage.Get('API_KEY', function(result, item) {
                if (result.status === 'OK') {
                    var textBox = document.getElementById("furkForChrome_apiKey");
                    if (textBox) { // && items[FurkForChromeStorage.storageKeys.API_KEY]) {
                        textBox.value = item;
                    }
                }
            });
        },
        // Saves options to storage
        saveOptions: function () {
            var apiKey = document.getElementById("furkForChrome_apiKey").value;
            
            if (apiKey) {
                var keyName = FurkForChromeStorage.storageKeys.API_KEY;
                chrome.storage.sync.set({ keyName: apiKey }, function() {});
            }
        },
        // Attempts to scrape the API key from Furk
        findApiKey: function () {

            var textBox = document.getElementById('furkForChrome_apiKey');

            if (textBox) {
                extractApiKey(textBox);
            }
            
        },
        init: function () {
            // Load options from local storage
            FurkForChromeOptions.restoreOptions();

            // Bind options page event handlers

            // 1. Save  then close tab on button click
            var closeButton = document.getElementById("btn_close");
            if (closeButton) {
                closeButton.onclick = function() { 
                    chrome.tabs.getCurrent(function(tab) {
                        FurkForChromeOptions.saveOptions();
                        chrome.tabs.remove(tab.id);
                    });
                    return false;
                }
            }


            // 2. Autoload API key
            var findApiLink = document.getElementById("a_findApiKey");
            if (findApiLink) {
                findApiLink.onclick = function() { alert('Sorry, work in progress!'); }; // FurkForChromeOptions.findApiKey;
            }

            // 3. Manual save button
            var saveButton = document.getElementById("btn_save");
            if (saveButton) {
                saveButton.onclick = FurkForChromeOptions.saveOptions;
            }            
        }
    };
}());

window.addEventListener('DOMContentLoaded', function () {
    FurkForChromeOptions.init();
});