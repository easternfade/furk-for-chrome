// Requires jQuery to be included
var FurkForChromeOptions = (function () {

    /// Public methods
    return {
        // Restores select box state to saved value from localStorage.
        restoreOptions: function () {
            chrome.storage.sync.get('furkForChrome_apiKey', function(items) {
                var textBox = document.getElementById("furkForChrome_apiKey");
                if (textBox && items['furkForChrome_apiKey']) {
                    textBox.value = items['furkForChrome_apiKey'];
                }
            });
        },
        // Saves options to storage
        saveOptions: function () {
            var apiKey = document.getElementById("furkForChrome_apiKey").value;
            
            if (apiKey) {
                chrome.storage.sync.set({ 'furkForChrome_apiKey': apiKey }, function() {});
            }
        },
        // Attempts to scrape the API key from Furk
        findApiKey: function () {
            $("#furkForChrome_apiKey").load(FurkAPI.FurkApiPage + " li:contains('Your API key is:')");
        },
        init: function () {
            // Load options from local storage
            FurkForChromeOptions.restoreOptions();

            // Bind options page event handlers

            // 1. Save options on close tab
            chrome.tabs.onRemoved.addListener(FurkForChromeOptions.saveOptions);
        }
    };
}());

window.addEventListener('DOMContentLoaded', function () {
    FurkForChromeOptions.init();
});