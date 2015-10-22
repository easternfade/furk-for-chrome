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
    this.apiUrl = function (endPoint, useApiKey) {
        // var furkApiKey = undefined;

        // FurkForChromeStorage.Get('API_KEY', function(result, item) {
        //     if (result.status === 'OK') {
        //         furkApiKey = item;
        //     } else {
        //         furkApiKey = null;
        //     }
        // });

        // Temporary hack to get around callback approach above
        // while (furkApiKey === undefined) {}

        // if ( furkApiKey === null ) {
        if (useApiKey) {
            // console.log("No API key found in storage.")
            return "http://api.furk.net/api/" + endPoint + "?"; // + "?api_key=" + furkApiKey;
        } else {
            return "https://www.furk.net/api/" + endPoint + "?";
        }
        // TODO: don't require "?" at end of string
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
            var apiCall = apiUrl("search", false);

            apiCall = appendApiParam(apiCall, "q", query);

            if (limit !== undefined) {
                apiCall = appendApiParam(apiCall, "limit", limit);
            }

            if (cachedOnly) {
                apiCall = appendApiParam(apiCall, "filter", "cached");
            }

            sendRequest("GET",
                            apiCall,
                            true,
                            onLoadCallBack);
        },
        addToFurk: function (link, onLoadCallBack) {
            // Do nothing if both required values are undefined
            if (link.hash === undefined && link.url === undefined) return null;
            
            FurkForChromeStorage.Get("API_KEY", function(result, key) {

                var apiCall = apiUrl("dl/add", key !== undefined);
                
                if (key !== undefined) {
                    apiCall = appendApiParam(apiCall, "api_key", key);
                }

                // todo: clean this up
                if (link.hash === undefined) {
                    apiCall = appendApiParam(apiCall, "url", link.url);
                } else {
                    apiCall = appendApiParam(apiCall, "info_hash", link.hash);
                }
    
                sendRequest("GET",
                                apiCall,
                                true,
                                onLoadCallBack);
            });
        },
        getFinished: function (ids, hash, onLoadCallBack, limit, sort_col, sort_direction) {

            var apiCall = apiUrl("file/get", false);

            if (ids !== null) {
                apiCall = appendApiParam(apiCall, "id", ids);
            }

            if (hash !== null) {
                apiCall = appendApiParam(apiCall, "info_hash", hash);
            }

            if (limit !== undefined) {
                apiCall = appendApiParam(apiCall, "offset", limit);
            }

            if (sort_col !== undefined) {
                apiCall = appendApiParam(apiCall, "sort_col", sort_col);
            }

            if (sort_direction !== undefined) {
                apiCall = appendApiParam(apiCall, "sort_direction", sort_direction);
            }

            sendRequest(    "GET",
                            apiCall,
                            true,
                            onLoadCallBack);

        },
        getDownloads: function (id, onLoadCallBack) {

            var apiCall = apiUrl("dl/get", false);

            if (id !== null) {
                apiCall = appendApiParam(apiCall, "id", id);
            }

            sendRequest("GET",
                            apiCall,
                            true,
                            onLoadCallBack);

        },
        getFile: function (fileId, onLoadCallBack) {

            var apiCall = apiUrl("file/get", false);

            if (fileId !== null) {
                apiCall = appendApiParam(apiCall, "id", fileId);
            }

            sendRequest("GET",
                            apiCall,
                            true,
                            onLoadCallBack);

        }
    };
} ());
