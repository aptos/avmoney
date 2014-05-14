function PaymentsCtrl($scope, $rootScope, $routeParams, $filter, Restangular, Storage) {

  $rootScope.getMeta().then(function (metadata) {
    $scope.metadata = metadata;
  });

  // Filter by client and project
  var filterFilter = $filter('filter');
  var orderByFilter = $filter('orderBy');
  $scope.filterItems = function() {
    var q = filterFilter($scope.payments, $scope.query);
    if (!!$scope.client) {
      q = _.filter(q, {'client_id': $scope.client});
      console.info("q", q)
    }
    if (!!$scope.search_project) {
      q = _.filter(q, {'project': $scope.search_project});
      console.info("project list", q);
    }
    var orderedItems = orderByFilter(q, ['client_name','status','date']);
    console.info("orderedItems filtered", orderedItems)
    $scope.filtered_items = orderedItems;
  }

  $scope.$watch('payments', $scope.filterItems);
  $scope.$watch('query', $scope.filterItems);

  // Fetch payments
  var refresh = function () {
    Restangular.all('payments').getList().then( function (list) {
      $scope.payments = list;
    });
  };
  refresh();

}
PaymentsCtrl.$inject = ['$scope','$rootScope','$routeParams','$filter','Restangular','Storage'];