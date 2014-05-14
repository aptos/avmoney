function ReportsCtrl($scope, $rootScope, $routeParams, $location, $filter, ngDialog, Restangular, Storage) {

  // Accounts Receivable Report
  var filterFilter = $filter('filter');
  var orderByFilter = $filter('orderBy');
  $scope.filterItems = function() {
    Storage.set('search_project', $scope.search_project);
    var q = filterFilter($scope.invoices, $scope.query);
    if (!!$scope.client) {
      q = _.filter(q, {'client_id': $scope.client});
      console.info("q", q)
    }
    if (!!$scope.search_project) {
      q = _.filter(q, {'project': $scope.search_project});
      console.info("project list", q);
    }
    var orderedItems = orderByFilter(q, ['open_date']);
    console.info("orderedItems filtered", orderedItems)
    $scope.filtered_items = orderedItems;
  };

  $scope.$watch('query', $scope.filterItems);

  // Fetch invoices
  var refresh = function () {
    Restangular.all('invoices').getList({status: 'Open'}).then( function (list) {
      $scope.invoices = list;
    });
  };
  refresh();

  $scope.age = function (date) {
    if (!date) return;
    return moment().diff(moment(date), 'days');
  };

}
ReportsCtrl.$inject = ['$scope','$rootScope','$routeParams','$location','$filter','ngDialog','Restangular','Storage'];