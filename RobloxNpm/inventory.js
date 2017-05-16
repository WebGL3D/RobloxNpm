/* roblox/inventory.js [05/06/2017] */
module.exports = function ($, httpClient) {
	function loadUserCollectibleAssets(userId, assetTypeId, cursor) {
		return new Promise(function (resolve, reject) {
			httpClient.get("https://inventory.roblox.com/v1/users/" + userId + "/assets/collectibles", {
				assetType: assetTypeId,
				cursor: cursor || "",
				sortOrder: "Asc",
				limit: 100
			}).then(function (response) {
				if (response.statusCode !== 200) {
					reject([{
						code: 0,
						message: "HTTP request failed"
					}]);
					return;
				}

				if (response.responseJson.nextPageCursor) {
					loadUserCollectibleAssets(userId, assetTypeId, response.responseJson.nextPageCursor).then(function (extraData) {
						resolve(response.responseJson.data.concat(extraData));
					}, reject);
				} else {
					resolve(response.responseJson.data);
				}
			}).catch(function (e) {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		});
	}

	function loadUserAssets(userId, assetTypeId, cursor, assetMap) {
		assetMap = assetMap || {};
		return new Promise(function (resolve, reject) {
			httpClient.get("https://www.roblox.com/users/inventory/list-json", {
				assetTypeId: assetTypeId,
				itemsPerPage: 100,
				cursor: cursor || "",
				userId: userId
			}).then(function (response) {
				if (response.statusCode !== 200) {
					reject([{
						code: 0,
						message: "HTTP request failed"
					}]);
					return;
				}

				var assets = [];
				response.responseJson.Data.Items.forEach(function (asset) {
					if (!assetMap.hasOwnProperty(asset.Item.AssetId) && !asset.UserItem.IsRentalExpired) {
						assetMap[asset.Item.AssetId] = asset;
						assets.push({
							id: asset.Item.AssetId,
							name: asset.Item.Name
						});
					}
				});

				if (response.responseJson.Data.nextPageCursor) {
					loadUserAssets(userId, assetTypeId, response.responseJson.Data.nextPageCursor, assetMap).then(function (moreAssets) {
						resolve(assets.concat(moreAssets));
					}, reject);
				} else {
					resolve(assets);
				}
			}).catch(function (response) {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		});
	}

	return {
		userHasAsset: $.promise.cache(function (resolve, reject, userId, assetId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			httpClient.get("https://api.roblox.com/ownership/hasasset", {
				userId: userId,
				assetId: assetId
			}).then(function (response) {
				if (response.statusCode === 200) {
					resolve(!!response.responseJson);
				} else {
					reject([{
						code: 0,
						message: "HTTP request failed"
					}]);
				}
			}).catch(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 60 * 1000,
			queued: true
		}),

		getCollectibles: $.promise.cache(function (resolve, reject, userId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			var rejected = false;
			var completed = 0;
			var collectibles = [];
			var combinedValue = 0;

			Roblox.catalog.collectibleAssetTypeIds.forEach(function (assetTypeId) {
				loadUserCollectibleAssets(userId, assetTypeId).then(function (data) {
					data.forEach(function (userAsset) {
						userAsset.assetTypeId = assetTypeId;
						combinedValue += userAsset.recentAveragePrice || 0;
					});
					collectibles = collectibles.concat(data);
					if (++completed == Roblox.catalog.collectibleAssetTypeIds.length) {
						collectibles.sort(function (a, b) {
							if (a.assetId == b.assetId) {
								return a.userAssetId - b.userAssetId;
							}
							return a.assetId - b.assetId;
						});

						resolve({
							combinedValue: combinedValue,
							collectibles: collectibles
						});
					}
				}, function (err) {
					if (!rejected) {
						rejected = true;
						reject(err);
					}
				});
			});
		}, {
			rejectExpiry: 10 * 1000,
			resolveExpiry: 5 * 60 * 1000,
			queued: true
		}),

		getAssets: $.promise.cache(function (resolve, reject, userId, assetTypeId) {
			loadUserAssets(userId, assetTypeId).then(function (assets) {
				resolve(assets);
			}, reject);
		}, {
			resolveExpiry: 30 * 1000,
			queued: true
		}),

		getAssetOwners: $.promise.cache(function (resolve, reject, assetId, cursor, sortOrder) {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			httpClient.get("https://inventory.roblox.com/v1/assets/" + assetId + "/owners", {
				cursor: cursor || "",
				sortOrder: sortOrder || "Asc",
				limit: 100
			}).then(function (response) {
				if (response.statusCode === 200) {
					resolve(response.responseJson);
				} else {
					reject([{
						code: 0,
						message: "HTTP request failed"
					}]);
				}
			}).catch(function (e) {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			queued: true,
			resolveExpiry: 30 * 1000,
			rejectExpiry: 10 * 1000
		})
	};
};


// WebGL3D
