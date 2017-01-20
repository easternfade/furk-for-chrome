// <script src="vendor/underscore-min.js" type="text/javascript"></script>
//         <script src="scripts/furkAPI.js" type="text/javascript"></script>
//         <script src="scripts/base32.js" type="text/javascript"></script>
//         <script src="scripts/furkForChromeNotifications.js" type="text/javascript"></script>
//         <script src="scripts/furkForChromeStorage.js" type="text/javascript"></script>
//         <script src="scripts/furkForChrome.js" type="text/javascript"></script>

//Load common code that includes config, then load the app logic for this page.
requirejs(['./common'], function (common) {
    requirejs(['app/furkForChrome'],
        function(ffc) {
            ffc.init();
        });
});