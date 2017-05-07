/* jquery.promise.js [03/12/2017] */
module.exports = function (defaultProperties) {
	function promiseBase(callBack) {
		return new Promise(callBack);
	}

	promiseBase.cache = function (callBack, properties) {
		if (typeof (properties) != "object") {
			properties = {};
		}
		if (typeof (properties.rejectExpiry) != "number") {
			properties.rejectExpiry = defaultProperties.defaultCacheRejectExpiry;
		}
		if (typeof (properties.resolveExpiry) != "number") {
			properties.resolveExpiry = defaultProperties.defaultCacheResolveExpiry;
		}

		var cachedPromises = {};
		var queue = [];
		var busy = false;

		function processQueue() {
			if (properties.queued && busy) {
				return;
			}
			var ticket = queue.shift();
			if (ticket) {
				busy = true;
				ticket.callBack.apply(ticket.scope, ticket.arguments);
			}
		}

		var wrapper = function () {
			var scope = this;
			var cacheKey = {};
			var args = [];
			for (var n = 0; n < arguments.length; n++) {
				args.push(cacheKey[n] = arguments[n]);
			}
			cacheKey = JSON.stringify(cacheKey).toLowerCase();

			if (cachedPromises[cacheKey]) {
				return cachedPromises[cacheKey];
			}

			return cachedPromises[cacheKey] = new Promise(function (resolve, reject) {
				// reject
				args.unshift(function () {
					if (properties.rejectExpiry > 0) {
						setTimeout(function () {
							delete cachedPromises[cacheKey];
						}, properties.rejectExpiry);
					}
					busy = false;
					setTimeout(processQueue, 0);
					reject.apply(this, arguments);
				});
				// resolve
				args.unshift(function () {
					if (properties.resolveExpiry > 0) {
						setTimeout(function () {
							delete cachedPromises[cacheKey];
						}, properties.resolveExpiry);
					}
					busy = false;
					setTimeout(processQueue, 0);
					resolve.apply(this, arguments);
				});
				queue.push({
					callBack: callBack,
					arguments: args,
					scope: scope
				});
				processQueue();
			});
		};

		wrapper.jpromiseProperties = properties;

		return wrapper;
	};

	return promiseBase;
};


// WebGL3D
