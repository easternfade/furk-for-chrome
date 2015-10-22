/*
 *
 */
var FurkAPI = (function () {

    /// Privileged methods
    // Create, configure, and send XMLHttpRequest
    this.sendRequest = function (method, url, async, callback) {

        var req = new XMLHttpRequest();

        req.open(method, url, async);
        req.onload = callback;
        req.send(null);

        return req;
    }

    /// Privileged methods

    // Build API REST URL
    this.apiUrl = function (endPoint) {
        var furkApiKey = undefined;

        FurkForChromeStorage.Get('API_KEY', function(result, item) {
            if (result.status === 'OK') {
                furkApiKey = item;
            }
        });

        if ( !furkApiKey ) {
            console.log("No API key found in storage.")
            return "https://www.furk.net/api/" + endPoint + "?";
        } else {
            return "http://api.furk.net/api/" + endPoint + "?api_key=" + furkApiKey;
        }
    }

    // Add param to API URL
    this.appendApiParam = function (originalApiUrl, paramKey, paramValue) {
        if (originalApiUrl.substr(originalApiUrl.length - 1) === "?") {
            return originalApiUrl += paramKey + "=" + paramValue;
        } else {
            return originalApiUrl += "&" + paramKey + "=" + paramValue;
        }
    }


    /// Public methods
    return {
        FurkLoginUrl: function () {
            return "https://www.furk.net/login";
        },
        FurkApiPage: function () {
            return "https://www.furk.net/t/api";
        },
        searchFurk: function (query, cachedOnly, onLoadCallBack, limit) {
            var req = new XMLHttpRequest();

            var apiCall = apiUrl("search");

            apiCall = appendApiParam(apiCall, "q", query);

            if (limit !== undefined) {
                //apiCall += "&limit=" + limit;
                apiCall = appendApiParam(apiCall, "limit", limit);
            }

            if (cachedOnly) {
                //apiCall += "&filter=cached";
                apiCall = appendApiParam(apiCall, "filter", "cached");
            }


            return sendRequest("GET",
                                   apiCall,
                                   true,
                                   onLoadCallBack);
            //req.open(
            //    "GET",
            //    apiCall,
            //    true);

            //req.onload = onLoadCallBack;
            //req.send(null);

            //return req;
        },
        addToFurk: function (link, onLoadCallBack) {
            var apiCall = apiUrl("dl/add");

            // Do nothing if both required values are undefined
            if (link.hash === undefined && link.url === undefined) return null;

            // todo: clean this up
            if (link.hash === undefined) {
                apiCall = appendApiParam(apiCall, "url", link.url);
            } else {
                apiCall = appendApiParam(apiCall, "info_hash", link.hash);
            }

            return sendRequest("GET",
                                    apiCall,
                                    true,
                                    onLoadCallBack);

        },
        getFinished: function (ids, hash, onLoadCallBack, limit, sort_col, sort_direction) {

            var apiCall = apiUrl("file/get");

            if (ids !== null) {
                // TODO: fix this
//                apiCall += "id=" + ids;
                apiCall = appendApiParam(apiCall, "id", ids);
            }

            if (hash !== null) {
//                apiCall += "info_hash=" + hash;
                apiCall = appendApiParam(apiCall, "info_hash", hash);
            }

            if (limit !== undefined) {
                //                apiCall += "&offset=" + limit;
                apiCall = appendApiParam(apiCall, "offset", limit);
            }

            if (sort_col !== undefined) {
                //                apiCall += "&sort_col=" + sort_col;
                apiCall = appendApiParam(apiCall, "sort_col", sort_col);
            }

            if (sort_direction !== undefined) {
//                apiCall += "&sort_typ=" + sort_direction;
                apiCall = appendApiParam(apiCall, "sort_direction", sort_direction);
            }

            return sendRequest("GET",
                                    apiCall,
                                    true,
                                    onLoadCallBack);

        },
        getDownloads: function (id, onLoadCallBack) {

            var apiCall = apiUrl("dl/get");

            if (id !== null) {
                // TODO: fix this
//                apiCall += "id=" + id;
                apiCall = appendApiParam(apiCall, "id", id);
            }

            return sendRequest("GET",
                                    apiCall,
                                    true,
                                    onLoadCallBack);

        },
        getFile: function (fileId, onLoadCallBack) {

            var apiCall = apiUrl("file/get");

            if (fileId !== null) {
                apiCall = appendApiParam(apiCall, "id", fileId);
            }

            return sendRequest("GET",
                                    apiCall,
                                    true,
                                    onLoadCallBack);

        }
    };
} ());
