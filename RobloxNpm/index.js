var $ = require("tixfactory.util")({});
var http = require("tixfactory.http");
var httpClient = new http.client();

httpClient.socketConfiguration({
	getWritesPerSecond: function (host, port) {
		if (host === "inventory.roblox.com") {
			return 1000 / 60;
		} else if (host === "search.roblox.com") {
			return 80 / 60;
		}
		return 100;
	}
});

module.exports.users = require("./users.js")($, httpClient);
module.exports.catalog = require("./catalog.js")($, httpClient);
module.exports.inventory = require("./inventory.js")($, httpClient);

// WebGL3D
