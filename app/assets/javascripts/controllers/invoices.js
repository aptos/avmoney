function InvoicesCtrl($scope, $rootScope, $routeParams, $location, $filter, ngDialog, Restangular, Storage) {

  $rootScope.getMeta().then(function (metadata) {
    $scope.metadata = metadata;
  });


  $scope.status = 'Open';
  if ($routeParams.status) $scope.status = $routeParams.status;

  // $scope.status_list = ['Active', 'Invoiced', 'Paid', 'All'];
  $scope.status_list = [{value: 'Open', text: 'Open'} ,{value: 'Paid', text: 'Paid'},{value: 'All', text: 'All'}];
  $scope.set_status = function (status) {
    $scope.status = status;
    $scope.filterItems();
  };

  // Filter by client and project
  var filterFilter = $filter('filter');
  var orderByFilter = $filter('orderBy');
  $scope.filterItems = function() {
    Storage.set('search_project', $scope.search_project);
    var q = filterFilter($scope.invoices, $scope.query);
    if (!!$scope.client) {
      q = _.filter(q, {'client_id': $scope.client});
    }
    if (!!$scope.search_project) {
      q = _.filter(q, {'project': $scope.search_project});
    }

    // Get Totals before applying status filter
    get_totals(q);

    if (!!$scope.status && $scope.status != 'All') {
      q = _.filter(q, { 'status': $scope.status});
    }
    var orderedItems = orderByFilter(q, ['client_name','created_at']);
    $scope.filtered_items = orderedItems;
  };

  $scope.$watch('invoices', $scope.filterItems);
  $scope.$watch('query', $scope.filterItems);

  // reduce functions
  var get_totals = function (list) {
    if (!list) return;
    $scope.billed_amount = list.reduce(function(m, invoice) { return m + invoice.invoice_total; }, 0);
    $scope.paid_amount = list.reduce(function(m, invoice) { return m + invoice.paid; }, 0);
    $scope.open_amount = $scope.billed_amount - $scope.paid_amount;
  };

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