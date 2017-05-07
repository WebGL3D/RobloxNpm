Roblox = require("./index.js");
Roblox.users.getByUserId(48103520).then(function (user) {
	console.log(user);
	Roblox.users.getByUserId(3336955).then(function (user) {
		console.log(user);
	}).catch(function (e) {
		console.error(e);
	});
}).catch(function (e) {
	console.error(e);
});
