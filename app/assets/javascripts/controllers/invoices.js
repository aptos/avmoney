function InvoicesCtrl($scope, $rootScope, $routeParams, $location, $filter, ngDialog, Restangular, Storage) {

  $rootScope.getMeta().then(function (metadata) {
    $scope.metadata = metadata;
  });

  // Filter by client and project
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
    var orderedItems = orderByFilter(q, ['client_name','status','date']);
    console.info("orderedItems filtered", orderedItems)
    $scope.filtered_items = orderedItems;
  };

  $scope.$watch('invoices', $scope.filterItems);
  $scope.$watch('query', $scope.filterItems);

  // Fetch invoices
  var refresh = function () {
    Restangular.all('invoices').getList().then( function (list) {
      $scope.invoices = list;
    });
  };
  refresh();

  // Open Invoice in new tab
  $scope.open = function (id) {
    $location.path("/Invoice/" + id);
  };

  // Pay
  $scope.pay = function (id) {
    var invoice = _.find($scope.invoices, function (v) { return v._id == id; });
    $scope.payment = {
      invoice_id: invoice._id,
      invoice_number: invoice.invoice_number,
      client_id: invoice.client_id,
      client_name: invoice.name,
      project: invoice.project,
      amount: invoice.invoice_total - invoice.paid,
      date: moment().format("YYYY-MM-DD")
    }
    $scope.show_form = true;
  };

  $scope.close = function () {
    $scope.saveInProgress = false;
    $scope.show_form = false;
  };

  $scope.save_payment = function () {
    $scope.saveInProgress = true;
    $scope.success = false;
    Restangular.all('payments').post($scope.payment).then( function () {
      $scope.close();
      $scope.success = true;
      refresh();
    },$scope.close);
  };

  // Date Format
  $scope.dateformat = 'D MMM \'YY';
  $scope.toggle_date = function () {
    $scope.dateformat = ($scope.dateformat == 'timeago') ? 'D MMM \'YY'  : 'timeago';
  };

  // Form Functions
  $scope.saveInProgress = false;

  $scope.min_date = "2014-01-01";

  $scope.save_payment = function () {
    $scope.saveInProgress = true;
    $scope.success = false;
    Restangular.all('payments').post($scope.payment).then( function () {
      $scope.close();
      $scope.success = true;
      refresh();
    },$scope.close);
  };

}
InvoicesCtrl.$inject = ['$scope','$rootScope','$routeParams','$location','$filter','ngDialog','Restangular','Storage'];