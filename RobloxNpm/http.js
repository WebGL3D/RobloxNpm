/* RobloxNpm/http.js [05/06/2017] */
// HTTP request wrapper designed for Roblox requests
module.exports = function (auth) {
	var http = require("tixfactory.http");
	var httpClient = new http();
	var xsrfToken = "";
	var tokenRequestMethods = ["POST", "PATCH", "DELETE"];
	var Roblox = {};
	var emptyCredentials = auth.buildCredentials("");
	var apiSites = ["inventory", "avatar", "develop", "publish", "abuse", "chat", "groups", "social"];
	var apiSiteDomains = [];

	apiSites.forEach(function (subdomain) {
		apiSiteDomains.push(`${subdomain}.roblox.com`);
	});

	httpClient.socketConfiguration({
		getWritesPerSecond: function (host, port) {
			if (host === "search.roblox.com") {
				return 1;
			} else if (apiSiteDomains.includes(host)) {
				return 1000 / 60;
			} else if (host === "api.roblox.com") {
				return 1000 / 60;
			}
			return 100;
		}
	});

	return Roblox.http = {
		request: function (requestData) {
			return new Promise(function (resolve, reject) {
				var requestHeaders = [];
				if (tokenRequestMethods.includes(requestData.method)) {
					requestHeaders.push({
						name: "X-CSRF-TOKEN",
						value: xsrfToken
					});
				}

				var requestBody;
				if (typeof (requestData.requestBody) === "object" && !Buffer.isBuffer(requestData.requestBody)) {
					requestBody = Buffer.from(JSON.stringify(requestData.requestBody));
					requestHeaders.push({
						name: "Content-Type",
						value: "application/json"
					});
				} else {
					requestBody = requestData.requestBody;
				}

				if (requestData.authentication) {
					requestHeaders.push({
						name: "Cookie",
						value: requestData.authentication.getCookieHeader()
					});
				}

				httpClient.request({
					url: requestData.url,
					method: requestData.method,
					queryParameters: requestData.queryParameters,
					requestBody: requestBody,
					requestHeaders: requestHeaders
				}).then(function (response) {
					if (requestData.authentication) {
						requestData.authentication.handleResponse(response);
					}

					for (var n = 0; n < response.headers.length; n++) {
						if (response.headers[n].name === "X-CSRF-TOKEN") {
							xsrfToken = response.headers[n].value;
							Roblox.http.request(requestData).then(resolve).catch(reject);
							return;
						}
					}

					if (response.statusCode >= 300) {
						reject(response);
					} else {
						resolve(response.responseJson || response.responseText || response.body);
					}
				}).catch(reject);
			});
		},
		get: function (url, queryParameters) {
			return this.request({
				url: url,
				queryParameters: queryParameters,
				method: "GET",
				authentication: emptyCredentials
			});
		},
		post: function (url, body) {
			return this.request({
				url: url,
				requestBody: body,
				method: "POST",
				authentication: emptyCredentials
			});
		}
	};
};

// WebGL3D
