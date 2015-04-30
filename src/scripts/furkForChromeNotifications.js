// Handling of browser notifications

var FurkForChromeNotifications = (function() {


    /**
     * Convert array of strings to item objects
     *
     * @param array of strings
     * @return array of item objects
     *
     * items: [ { title: "Item1", message: "This is item 1."},
     *          { title: "Item2", message: "This is item 2."},
     *          { title: "Item3", message: "This is item 3."} ]
     */
    this.messagesToItems = function(msgArray) {
        var items = {};
        for (var i = 0; i < arr.length; ++i)
            rv[i] = arr[i];
        return rv;
    };

    return {
        // Webkit notifications
        createNotificationLegacy: function(notificationMessage)
        {
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
        },

        // Chrome 26+: For Windows, ChromeOS
        createNotification: function(notificationMessage) {
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
        },
        buildSuccessNotification: function (apiResult) {

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
        buildErrorNotification: function (xhr) {

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
        }
    }

}());