function HeaderController($scope, $location) {
	$scope.isActive = function (viewLocation) {
		return viewLocation === $location.path();
	};
}
HeaderController.$inject = ['$scope','$location'];