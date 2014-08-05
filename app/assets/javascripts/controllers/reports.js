function ReportsCtrl($scope, $rootScope, $routeParams, $location, $filter, ngDialog, Restangular, Storage) {

  // Reports Selector
  $scope.report = {
    accountsReceivable: function () {
      $scope.type = 'AccountsReceivable';
      fetch_invoices();
    },
    totalDue: function () {
      if (!!$scope.filtered_items && $scope.filtered_items.length) {
        return $scope.filtered_items.reduce(function(m, invoice) { return m + (invoice.invoice_total); }, 0);
      }
    },
    payments: function () {
      $scope.type = 'Payments';
      fetch_payments();
    },
    paidAmount: function () {
      if (!!$scope.filtered_items && $scope.filtered_items.length) {
        return $scope.filtered_items.reduce(function(m, payment) { return m + payment.amount; }, 0);
      }
    }
  };

  // Accounts Receivable Report
  var filterFilter = $filter('filter');
  $scope.reverse = false;

  $scope.filterItems = function() {
    Storage.set('search_project', $scope.search_project);
    var q = filterFilter($scope.list, $scope.query);
    if (!!$scope.client) {
      q = _.filter(q, {'client_id': $scope.client});
    }
    if (!!$scope.search_project) {
      q = _.filter(q, {'project': $scope.search_project});
    }
    $scope.filtered_items = q;
  };

  $scope.$watch('query', $scope.filterItems);


  // Fetch invoices
  var fetch_invoices = function () {
    $scope.order = 'open_date';
    Restangular.all('invoices').getList({status: 'Open'}).then( function (list) {
      $scope.list = list;
      $scope.filterItems();
    });
  };

  // Fetch payments
  var fetch_payments = function () {
    $scope.order = 'date';
    Restangular.all('payments').getList().then( function (list) {
      $scope.list = list;
      $scope.filterItems(list);
    });
  };

  $scope.age = function (date) {
    if (!date) return;
    return moment().diff(moment(date), 'days');
  };

  $scope.today = moment().format('MM/DD/YYYY');

}
ReportsCtrl.$inject = ['$scope','$rootScope','$routeParams','$location','$filter','ngDialog','Restangular','Storage'];