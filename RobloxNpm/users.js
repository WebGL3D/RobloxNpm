/* RobloxNpm/users.js [05/06/2017] */
module.exports = function ($, httpClient) {
	return {
		getByUserId: $.promise.cache(function (resolve, reject, userId) {
			if (typeof (userId) !== "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			httpClient.get("https://www.roblox.com/profile", { userId: userId }).then(function (response) {
				if (response.statusCode !== 200) {
					reject([{
						code: 0,
						message: "HTTP request failed"
					}]);
					return;
				}

				var r = response.responseJson;
				resolve({
					id: r.UserId,
					username: r.Username,
					bc: r.OBC ? "OBC" : (r.TBC ? "TBC" : (r.BC ? "BC" : "NBC"))
				});
			}).catch(function (response) {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			queued: true
		})
	};
};


// WebGL3D
