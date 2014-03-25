var farmdatServices = angular.module('farmdatServices');

farmdatServices.factory('Storage', function() {
	return {
		get: function(key) {
			var item = sessionStorage.getItem(key);
			try {
				return JSON.parse(item);
			}
			catch (e) {}
			return null;
		},
    // get with test for cache expirey
    fetch: function(key) {
      var expires = sessionStorage.getItem(key + '-timestamp');
      if (Date.now() > expires) return false;
      var item = sessionStorage.getItem(key);
      try {
        return JSON.parse(item);
      }
      catch (e) {}
      return false;
    },
    // optional cache max age, in seconds
		set: function(key, value, max_age) {
			var json = JSON.stringify(value);
			sessionStorage.setItem(key, json);
      if (typeof(max_age) != "undefined") {
        var expires = Date.now() + (max_age * 1000);
        sessionStorage.setItem(key + '-timestamp', expires);
      }
    },
		erase: function(key) {
			sessionStorage.removeItem(key);
		},
		flush : function() {
			sessionStorage.clear();
		}
	};
});