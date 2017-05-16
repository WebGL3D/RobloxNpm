var $ = require("tixfactory.util")({});
var http = require("tixfactory.http");
var httpClient = new http.client();
module.exports.users = require("./users.js")($, httpClient);
module.exports.catalog = require("./catalog.js")($, httpClient);
module.exports.inventory = require("./inventory.js")($, httpClient);

// WebGL3D
