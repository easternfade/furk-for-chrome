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
    
    this.parseApiResponse = function(e) {

        var notificationMessage = '';

        var xhr = processResponse(e);

        switch (xhr.status) {
        case 500:
            notificationMessage = FurkForChrome.buildErrorNotification(xhr);
            break;
        case 200:
            // Sometimes the API returns an error within a successful response
            if (xhr.responseJson.status === 'error') {
                notificationMessage = FurkForChrome.buildErrorNotification(xhr);
                break;
            }
            notificationMessage = FurkForChrome.buildSuccessNotification(xhr.responseJson);
            break;
        }

        return notificationMessage;
    };

    // Webkit notifications
    this.createNotificationLegacy = function(notificationMessage) {
        var notification = webkitNotifications.createNotification(
            'images/icon48.png',
            notificationMessage['title'],
            _.reduce(notificationMessage['message'], function(memo, val, index, list) {
                return memo + val + (index <= list.length ? ' - ' : '');
            }, ''));

        setTimeout(function() {
            notification.cancel();
        }, FurkForChrome.notificationTimeOut());

        notification.show();

        return notification;
    };

    // Chrome 26+: For Windows, ChromeOS
    this.createNotification = function(notificationMessage) {
        var options = {
            type: "list",
            title: notificationMessage['title'],
            message: notificationMessage['message'][0],
            items: _.map(notificationMessage['message'], function(msg) {
                return { title: '', message: msg };
            }), // notificationMessage['message'][0],
            iconUrl: 'images/icon48.png'
        };

        if (notificationMessage['dl_url'] !== undefined) {
            options.buttons = [{ title: 'Download' }];
            chrome.notifications.onButtonClicked.addListener(FurkForChrome.notificationHandler);
        }

        var notification = chrome.notifications.create(notificationMessage['file_id'], options, function() {
        });

        return notification;
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
                'magnet:\?xt=urn:btih:*',
                'http://publichd.eu/index.php?page=torrent-details&id=*',
                'http://forums.mvgroup.org/tracker/get.php?id=*'
            ];
        },
        buildSuccessNotification: function(apiResult) {

            var notificationMessage = {};
            notificationMessage['file_id'] = '';
            notificationMessage['message'] = ["File "];

            if (apiResult.status == "ok") {
                notificationMessage['message'][0] += " is " + apiResult.dl.dl_status;

                if (typeof parseInt(apiResult.dl.size) === 'number') {
                    notificationMessage['message'][1] = "Size: " + (apiResult.dl.size / 1048576).toFixed(2) + " MB";
                }

                switch (apiResult.dl.dl_status) {
                case "finished":
                    notificationMessage['title'] = 'Furk for Chrome: Finished';
                    notificationMessage['message'][2] = "File name: " + apiResult.dl.name;
                    break;
                default: // "active"
                    notificationMessage['title'] = 'Furk for Chrome: Added';
                    break;
                }

                if (apiResult.files[0] !== undefined) {
                    notificationMessage['dl_url'] = apiResult.files[0].url_dl;
                    notificationMessage['file_id'] = apiResult.files[0].id;
                }


            } else {
                notificationMessage['message'][0] += " download failed: " + apiResult.error;
                notificationMessage['title'] = 'Furk for Chrome: Error';

                if (apiResult.error === "access denied") {
                    notificationMessage['message'][1] = ". Please log in at furk.net";
                    notificationMessage['title'] = 'Furk for Chrome: Access Denied';
                }
            }

            return notificationMessage;
        },
        buildErrorNotification: function(xhr) {

            var notificationMessage = {};
            notificationMessage['file_id'] = '';
            notificationMessage['title'] = 'Furk for Chrome: Error';
            notificationMessage['message'] = ["Sorry, Furk returned an error."];
            //"Status code: " + xhr.status +
            //                      ". Please try again, or check if furk.net is up." ];

            var apiResponse = xhr.responseJson;

            switch (apiResponse.error) {
            case "access denied":
                notificationMessage['message'][1] = ". Please log in at furk.net";
                notificationMessage['title'] = 'Furk for Chrome: Access Denied';
                break;
            default:
                notificationMessage['message'][1] = apiResponse.error;
                break;
            }

            return notificationMessage;
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
        furkAPIResponse: function(e) {
            var notificationMessage = parseApiResponse(e.target);
            // TODO: remove legacy method when Chrome.notifications becomes available on other platforms.
            chrome.notifications ? createNotification(notificationMessage) : createNotificationLegacy(notificationMessage);
        },
        download: function(e) {
            var xhr = processResponse(e.target);

            if (xhr !== undefined) {
                window.open(xhr.responseJson.files[0].url_dl);
                window.event.stopPropagation();
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
        /*
        * Initialise extension
        */
        init: function() {
            this.createContextMenu();
        }
    };
}());

window.addEventListener('DOMContentLoaded', function() {
    FurkForChrome.init();
});