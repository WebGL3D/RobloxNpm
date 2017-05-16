Roblox = require("./index.js");
Roblox.users.getByUserId(48103520).then(function (user) {
	console.log(user);
	Roblox.users.getByUserId(3336955).then(function (user) {
		console.log(user);
	}).catch(function (e) {
		console.error(e);
	});
	Roblox.users.getByUserId(3336955).then(function (user) {
		console.log(user);
	}).catch(function (e) {
		console.error(e);
	});
}).catch(function (e) {
	console.error(e);
});

Roblox.inventory.userHasAsset(48103520, 1272714).then(function (hasAsset) {
	console.log("ye?", hasAsset);
}).catch(function (e) {
	console.error(e);
});
