var farmdatServices = angular.module('farmdatServices');

// register the interceptor as a service, intercepts ALL angular ajax http calls
farmdatServices.factory('myHttpInterceptor', ['$q', '$window', function ($q, $window) {
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
