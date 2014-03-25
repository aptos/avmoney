function InvoicesCtrl($scope, $rootScope, $routeParams, $debounce, $location, $filter, Restangular, $fileUploader, $http) {

  $scope.selected = undefined;
  $scope.current_user = $rootScope.current_user;
  $rootScope.getMeta().then(function (metadata) {
    $scope.metadata = metadata;
  });


  // Fetch invoices
  var refresh = function () {
    Restangular.one('invoices', 'mine').getList().then( function (list) {
      $scope.invoices = list;
    });
  };
  refresh();

  // Date Format
  $scope.dateformat = 'D MMM \'YY';
  $scope.toggle_date = function () {
    $scope.dateformat = ($scope.dateformat == 'timeago') ? 'D MMM \'YY'  : 'timeago';
  };

  // Form Functions
  $scope.saveInProgress = false;

  $scope.min_date = "2000-01-01";
  $scope.max_date = "2016-01-01";

  $scope.new_invoice = function () {
    $scope.invoice = { job: '' };
    $scope.invoice.date = moment().format("YYYY-MM-DD");
    $scope.invoiceEditForm.$setPristine();
    $scope.show_form = true;
  };

  $scope.save = function () {
    if (($scope.invoiceEditForm.$valid) && (!$scope.saveInProgress) ) {
      $scope.saveInProgress = true;
      if ($scope.invoice._id) {
        $scope.invoice.put().then(function () {
          $scope.close();
          refresh();
        }, $scope.close);
      } else {
        Restangular.all('invoices').post($scope.invoice).then( function () {
          $scope.close();
          refresh();
        },$scope.close);
      }
    }
  };

  $scope.close = function () {
    $scope.saveInProgress = false;
    $scope.show_form = false;
  };

  $scope.edit = function (id) {
    Restangular.one('invoices', id).get().then(function (invoice) {
      $scope.invoice = Restangular.copy(invoice);
      $scope.show_form = true;
    });
  };

  $scope.remove = function () {
    console.info("delete requested!", $scope.invoice);
    $scope.saveInProgress = true;
    if ($scope.invoice._id) {
      $scope.invoice.remove();
    }
  };

}
InvoicesCtrl.$inject = ['$scope','$rootScope','$routeParams','$debounce','$location','$filter','Restangular','$fileUploader','$http'];