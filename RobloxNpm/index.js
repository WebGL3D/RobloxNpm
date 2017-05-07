var $ = {
	promise: require("./jquery.promise.js")({
		defaultCacheRejectExpiry: 2000,
		defaultCacheResolveExpiry: 5000
	})
};
module.exports.auth = require("./auth.js")();
module.exports.http = require("./http.js")(module.exports.auth);
module.exports.users = require("./users.js")($, module.exports.http);
module.exports.inventory = require("./inventory.js")($, module.exports.http);

// WebGL3D
