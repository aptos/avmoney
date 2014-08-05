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
    }
    if (!!$scope.search_project) {
      q = _.filter(q, {'project': $scope.search_project});
    }
    get_totals(q);
    var orderedItems = orderByFilter(q, ['client_name','status','date']);
    $scope.filtered_items = orderedItems;
  }

  // reduce functions
  var get_totals = function (list) {
    if (!list) return;
    $scope.paid_amount = list.reduce(function(m, payment) { return m + payment.amount; }, 0);
  };

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