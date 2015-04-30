/*
 * FurkForChrome
 * Provides functionality exposed via background page.
 * Requires underscore.js library to be loaded
 */
var FurkForChrome = (function() {

    this.processResponse = function(xhr) {

        if (xhr === undefined) {
            return undefined;
        }

        xhr.responseJson = JSON.parse(xhr.responseText);
        return xhr;
    };
    
    // Parse XHR response and generate a notification
    this.parseApiResponse = function(e) {

        var notificationMessage = '';

        var xhr = processResponse(e);

        switch (xhr.status) {
        case 500:
            notificationMessage = FurkForChromeNotifications.buildErrorNotification(xhr);
            break;
        case 200:
            // Sometimes the API returns an error within a successful response
            if (xhr.responseJson.status === 'error') {
                notificationMessage = FurkForChromeNotifications.buildErrorNotification(xhr);
                break;
            }
            notificationMessage = FurkForChromeNotifications.buildSuccessNotification(xhr.responseJson);
            break;
        }

        return chrome.notifications ? FurkForChromeNotifications.createNotification(notificationMessage) : FurkForChromeNotifications.createNotificationLegacy(notificationMessage);;
    };

    this.handleDownload = function( details ) {

    };

    return {
        notificationTimeOut: function(seconds) {

            if (seconds === undefined) seconds = 7;

            return seconds * 1000;
        },
        torrentSites: function() {
            return [
                '*://*/*.torrent',
                '*://*/*.torrent?*',
                'http://www.bt-chat.com/download*.php?id=*',
                'http://www.bt-chat.com/download*.php?info_hash=*',
                'http://www.kat.ph/torrents/*/',
                '*://torrentz.ph/*',
                '*://torrentz.eu/*',
                '*://torrentz.me/*',
                '*://torrentz.in/*',
                'http://www.swarmthehive.com/d/*',
                'magnet:?xt=urn:btih:*',
                'http://publichd.eu/index.php?page=torrent-details&id=*',
                'http://forums.mvgroup.org/tracker/get.php?id=*'
            ];
        },
        downloadUrlFilters: function() {
            return {
                url: [
                    { schemes: ['magnet'] }
                ]
            };
        },
        parseUrl: function(info) {

            // magnet:?xt=urn:btih:H45CQLWS7NUFP3UBECKRIWGZ3BWUTWZ5&dn=Falling.Skies.S04E06.720p.HDTV.x264-IMMERSE&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.publicbt.com:80&tr=udp://tracker.istole.it:80&tr=udp://open.demonii.com:80&tr=udp://tracker.coppersurfer.tk:80
            // Create a link object to return
            var link = {};
            link.url = info.linkUrl;

            var hexPattern = /[a-fA-F0-9]{40}/;
            var base32Pattern = /[a-zA-Z0-9]{32}/;

            // Get hash if present - detect if base32 or Hex
            var result = hexPattern.exec(info.linkUrl);

            if (result !== null) {
                link.hash = result[0] || undefined;
            } else {

                result = base32Pattern.exec(info.linkUrl);

                var base32Hash = undefined;
                if (result !== null && result.length > 0) {
                    base32Hash = result[0] || undefined;
                }

                if (base32Hash !== undefined) {
                    link.hash = base32converter.convert(base32Hash);
                }
            }
            link.text = info.selectionText || ' ';
            link.pageUrl = info.pageUrl;

            return link;
        },

        // Handle Furk API response
        furkAPIResponse: function(e) {
            parseApiResponse(e.target);
        },
        download: function(e) {
            var xhr = processResponse(e.target);

            if (xhr !== undefined) {
                chrome.tts ? chrome.tts.speak("Downloading Now") : function (){};
                chrome.downloads.download({
                    url: xhr.responseJson.files[0].url_dl,
                    conflictAction: 'prompt'
                });
            }
        },
        notificationHandler: function(notificationId, buttonIndex) {
            FurkAPI.getFile(notificationId, FurkForChrome.download);
        },
        createContextMenu: function() {
            var title = "Add to Furk";

            chrome.contextMenus.create({
                title: title,
                contexts: ['link'],
                targetUrlPatterns: this.torrentSites(),
                onclick: function(info, tab) {
                    var req = FurkAPI.addToFurk(FurkForChrome.parseUrl(info), FurkForChrome.furkAPIResponse);
                }
            });
        },
        attachDownloadHandler: function() {
            // chrome.downloads.onCreated.addListener(handleDownload);
            chrome.webNavigation.onBeforeNavigate.addListener(handleDownload);
            //    , {
            //    url: [
            //        { schemes: ['magnet'] }
            //    ]
            //});
        },
        /*
        * Initialise extension
        */
        init: function() {
            this.createContextMenu();
            this.attachDownloadHandler();
        }
    };
}());

window.addEventListener('DOMContentLoaded', function() {
    FurkForChrome.init();
});