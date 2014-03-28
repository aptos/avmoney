var avmoneyServices = angular.module('avmoneyServices');

// register the interceptor as a service, intercepts ALL angular ajax http calls
avmoneyServices.factory('myHttpInterceptor', ['$q', '$window', function ($q, $window) {
	return function (promise) {
		return promise.then(function (response) {
            // do something on success
            $('#loading').hide();
            return response;

        }, function (response) {
            // do something on error
            $('#loading').hide();
            return $q.reject(response);
        });
	};
}]);
