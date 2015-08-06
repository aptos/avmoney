function ReportsCtrl($scope, $rootScope, $routeParams, $location, $filter, ngDialog, Restangular, Storage) {

  // Reports Selector
  $scope.report = {
    projects: function () {
      $scope.type = "Projects";
      fetch_projects();
    },
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
    },
    cashflow: function () {
      $scope.type = 'CashFlow';
      fetch_cashflow();
    },
    cashflowPayments: function () {
      if (!!$scope.filtered_items && $scope.filtered_items.length) {
        var payments = _.filter($scope.filtered_items, {'type': 'payment'});
        return payments.reduce(function(m, payment) { return m + payment.amount; }, 0);
      }
    },
    cashflowExpenses: function () {
      if (!!$scope.filtered_items && $scope.filtered_items.length) {
        var expenses = _.filter($scope.filtered_items, {'type': 'expense'});
        return expenses.reduce(function(m, expense) { return m + expense.amount; }, 0);
      }
    }
  };

  // Accounts Receivable Report
  var filterFilter = $filter('filter'),
  dateRangeFilter = $filter('dateRange'),
  date_el = 'date';
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

    if (!!$scope.dateRange) {
      q = dateRangeFilter(q, $scope.dateRange, date_el);
    }
    $scope.filtered_items = q;
  };

  $scope.$watch('query', $scope.filterItems);

  $scope.refresh = function () {
    if (!$scope.type) return;
    switch ($scope.type) {
      case "AccountsReceivable": $scope.report.accountsReceivable(); break;
      case "Payments": $scope.report.payments(); break;
      case "CashFlow": $scope.report.cashflow(); break;
    }
  };

  // Fetch projects
  var fetch_projects = function () {
    console.info("Projects")
    Restangular.all('clients/' + $scope.client + '/projects_report').getList().then( function (list) {
      $scope.list = list;
    });
  };

  // Fetch invoices
  var fetch_invoices = function () {
    $scope.order = date_el = 'open_date';
    Restangular.all('invoices').getList({status: 'Open'}).then( function (list) {
      $scope.list = list;
      $scope.filterItems();
    });
  };

  // Fetch payments
  var fetch_payments = function () {
    $scope.order = date_el = 'date';
    Restangular.all('payments').getList().then( function (list) {
      $scope.list = list;
      $scope.filterItems();
    });
  };

  // Fetch cashflow
  var fetch_cashflow = function () {
    $scope.order = date_el = 'date';
    Restangular.all('cashflow').getList().then( function (list) {
      $scope.list = list;
      $scope.filterItems();
    });
  };

  // Open Invoice
  $scope.open = function (id) {
    $location.path("/Invoice/" + id);
  };

  $scope.age = function (date) {
    if (!date) return;
    return moment().diff(moment(date), 'days');
  };

  $scope.today = moment().format('MM/DD/YYYY');

}
ReportsCtrl.$inject = ['$scope','$rootScope','$routeParams','$location','$filter','ngDialog','Restangular','Storage'];