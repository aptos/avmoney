function ReportsCtrl($scope, $rootScope, $routeParams, $location, $filter, ngDialog, Restangular, Storage) {

  // Reports Selector
  $scope.report = function (type) {
    $scope.type = type;
    fetch_invoices();
  };

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

    $scope.filtered_items = orderedItems;
    if (typeof($scope.filtered_items) != 'undefined') {
      $scope.total_due = $scope.filtered_items.reduce(function(m, invoice) { return m + (invoice.invoice_total); }, 0);
    }

  };
  $scope.$watch('query', $scope.filterItems);

  // Fetch invoices
  var fetch_invoices = function () {
    Restangular.all('invoices').getList({status: 'Open'}).then( function (list) {
      $scope.invoices = list;
      $scope.filterItems();
    });
  };

  $scope.age = function (date) {
    if (!date) return;
    return moment().diff(moment(date), 'days');
  };

  $scope.today = moment().format('MM/DD/YYYY');

}
ReportsCtrl.$inject = ['$scope','$rootScope','$routeParams','$location','$filter','ngDialog','Restangular','Storage'];