import furkAPI from "./furkAPI";
import storage from "./furkForChromeStorage";

export default function() {

    this.extractApiKey = function (textBoxTarget) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", furkAPI.FurkApiPage(), true);
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
    };

    /// Public methods
    return {
        // Restores select box state to saved value from localStorage.
        restoreOptions: function () {
            //chrome.storage.sync.get(FurkForChromeStorage.storageKeys.API_KEY, function(items) {
            storage.Get('API_KEY', function (result, item) {
                if (result.status === 'OK') {
                    var textBox = document.getElementById("furkForChrome_apiKey");
                    if (textBox) { // && items[FurkForChromeStorage.storageKeys.API_KEY]) {
                        textBox.value = item;
                    }
                }
            });

            storage.Get('TTS_ENABLE', function (result, item) {
                if (result.status === 'OK') {
                    var checkBox = document.getElementById("furkForChrome_ttsEnable");
                    if (checkBox) {
                        checkBox.checked = item;
                    }
                }
            });
        },
        // Saves options to storage
        saveOptions: function () {
            var apiKey = document.getElementById("furkForChrome_apiKey").value;
            if (apiKey) {
                var keyName = storage.storageKeys.API_KEY;
                chrome.storage.sync.set({ keyName: apiKey }, function () {

                });
            }

            var ttsEnable = document.getElementById("furkForChrome_ttsEnable").value;
            if (ttsEnable) {
                var keyName = storage.storageKeys.TTS_ENABLE;
                chrome.storage.sync.set({ keyName: ttsEnable }, function () { });
            }
        },
        loadExtensionInfo: function () {
            chrome.management.getSelf(function (extensionInfo) {
                var textBox = document.getElementById('ext_name');

                if (textBox) {
                    textBox.innerText = extensionInfo.name + ' ' + extensionInfo.version;
                }
            });
        },
        // Attempts to scrape the API key from Furk
        findApiKey: function () {

            var textBox = document.getElementById('furkForChrome_apiKey');

            if (textBox) {
                this.extractApiKey(textBox);
            }

        },
        init: function () {
            // Populate dynamic content
            this.loadExtensionInfo();

            // Load options from local storage
            this.restoreOptions();

            // Bind options page event handlers

            // 1. Save  then close tab on button click
            var closeButton = document.getElementById("btn_close");
            if (closeButton) {
                closeButton.onclick = function () {
                    chrome.tabs.getCurrent(function (tab) {
                        this.saveOptions();
                        chrome.tabs.remove(tab.id);
                    });
                    return false;
                }
            }


            // 2. Autoload API key
            var findApiLink = document.getElementById("a_findApiKey");
            if (findApiLink) {
                findApiLink.onclick = function () { alert('Sorry, work in progress!'); }; // FurkForChromeOptions.findApiKey;
            }

            // 3. Manual save button
            var saveButton = document.getElementById("btn_save");
            if (saveButton) {
                saveButton.onclick = this.saveOptions;
            }
        }
    };
}