/*
 * FurkAPI wrapper
 *
 * ES2019
 */

import storage from "./furkForChromeStorage";

export default class FurkAPI {
	static FurkLoginUrl = "https://www.furk.net/login";
	static FurkApiPage = "https://www.furk.net/t/api";

	constructor() {}

	/// Privileged methods
	// Create, configure, and send XMLHttpRequest
	static #sendRequest(method, url, async, callback) {
		var req = new XMLHttpRequest();

		req.open(method, url, async);
		req.onload = callback;
		req.send(null);

		return req;
	}

	/// Privileged methods

	// Build API REST URL
	static #apiUrl(endPoint, useApiKey) {
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
	static #appendApiParam(originalApiUrl, paramKey, paramValue) {
        paramValue = encodeURI(paramValue);
		if (originalApiUrl.substr(originalApiUrl.length - 1) === "?") {
			return (originalApiUrl += paramKey + "=" + paramValue);
		} else {
			return (originalApiUrl += "&" + paramKey + "=" + paramValue);
		}
	}

	static searchFurk(query, cachedOnly, onLoadCallBack, limit) {
		var apiCall = FurkAPI.#apiUrl("search", false);

		apiCall = FurkAPI.#appendApiParam(apiCall, "q", query);

		if (limit !== undefined) {
			apiCall = FurkAPI.#appendApiParam(apiCall, "limit", limit);
		}

		if (cachedOnly) {
			apiCall = FurkAPI.#appendApiParam(apiCall, "filter", "cached");
		}

		FurkAPI.#sendRequest("GET", apiCall, true, onLoadCallBack);
	}

	static addToFurk(link, onLoadCallBack) {
		// Do nothing if both required values are undefined
		if (link.hash === undefined && link.url === undefined) return null;

		storage.Get("API_KEY", function (result, key) {
			var apiCall = FurkAPI.#apiUrl("dl/add", key !== undefined);

			if (key !== undefined) {
				apiCall = FurkAPI.#appendApiParam(apiCall, "api_key", key);
			}

			// todo: clean this up
			if (link.hash === undefined) {
				apiCall = FurkAPI.#appendApiParam(apiCall, "url", link.url);
			} else {
				apiCall = FurkAPI.#appendApiParam(
					apiCall,
					"info_hash",
					link.hash
				);
			}

			FurkAPI.#sendRequest("GET", apiCall, true, onLoadCallBack);
		});
	}

	static getFinished(
		ids,
		hash,
		onLoadCallBack,
		limit,
		sort_col,
		sort_direction
	) {
		var apiCall = FurkAPI.#apiUrl("file/get", false);

		if (ids !== null) {
			apiCall = FurkAPI.#appendApiParam(apiCall, "id", ids);
		}

		if (hash !== null) {
			apiCall = FurkAPI.#appendApiParam(apiCall, "info_hash", hash);
		}

		if (limit !== undefined) {
			apiCall = FurkAPI.#appendApiParam(apiCall, "offset", limit);
		}

		if (sort_col !== undefined) {
			apiCall = FurkAPI.#appendApiParam(apiCall, "sort_col", sort_col);
		}

		if (sort_direction !== undefined) {
			apiCall = FurkAPI.#appendApiParam(
				apiCall,
				"sort_direction",
				sort_direction
			);
		}

		FurkAPI.#sendRequest("GET", apiCall, true, onLoadCallBack);
	}

	static getDownloads(id, onLoadCallBack) {
		var apiCall = FurkAPI.#apiUrl("dl/get", false);

		if (id !== null) {
			apiCall = FurkAPI.#appendApiParam(apiCall, "id", id);
		}

		FurkAPI.#sendRequest("GET", apiCall, true, onLoadCallBack);
	}

	static getFile(fileId, onLoadCallBack) {
		var apiCall = FurkAPI.#apiUrl("file/get", false);

		if (fileId !== null) {
			apiCall = FurkAPI.#appendApiParam(apiCall, "id", fileId);
		}

		FurkAPI.#sendRequest("GET", apiCall, true, onLoadCallBack);
	}
}
