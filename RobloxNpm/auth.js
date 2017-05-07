/* RobloxNpm/auth.js [05/06/2017] */
module.exports = function () {
	return {
		buildCredentials: function (username) {
			var cookies = {};
			var credentials;

			return credentials = {
				username: username,

				getCookies: function () {
					return cookies;
				},

				setCookie: function (key, value) {
					cookies[key] = value;
				},

				getCookieHeader: function () {
					var header = "";
					for (var n in cookies) {
						if (cookies.hasOwnProperty(n)) {
							header += `${n}=${cookies[n]}; `;
						}
					}
					return header;
				},

				handleResponse: function (response) {
					response.headers.forEach(function (header) {
						if (header.name.toLowerCase() === "set-cookie") {
							header.value.split(/;\s+/).forEach(function (chunk, i) {
								if (i === 0) {
									var match = chunk.match(/([^=]+)=(.*)/);
									if (match) {
										credentials.setCookie(match[1], match[2]);
									}
								} else {
									// maybe I'll do something with the other parts of the set-cookie at some point
								}
							});
						}
					});
				}
			};
		}
	};
};

// WebGL3D
