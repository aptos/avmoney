function PaymentsCtrl($scope, $rootScope, $routeParams, $debounce, $location, $filter, Restangular, $fileUploader, $http) {

  $scope.selected = undefined;
  $scope.current_user = $rootScope.current_user;
  $rootScope.getMeta().then(function (metadata) {
    $scope.metadata = metadata;
  });


  // Fetch payments
  var refresh = function () {
    Restangular.one('payments', 'mine').getList().then( function (list) {
      $scope.payments = list;
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

  $scope.new_payment = function () {
    $scope.payment = { job: '' };
    $scope.payment.date = moment().format("YYYY-MM-DD");
    $scope.paymentEditForm.$setPristine();
    $scope.show_form = true;
  };

  $scope.save = function () {
    if (($scope.paymentEditForm.$valid) && (!$scope.saveInProgress) ) {
      $scope.saveInProgress = true;
      if ($scope.payment._id) {
        $scope.payment.put().then(function () {
          $scope.close();
          refresh();
        }, $scope.close);
      } else {
        Restangular.all('payments').post($scope.payment).then( function () {
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
    Restangular.one('payments', id).get().then(function (payment) {
      $scope.payment = Restangular.copy(payment);
      $scope.show_form = true;
    });
  };

  $scope.remove = function () {
    console.info("delete requested!", $scope.payment);
    $scope.saveInProgress = true;
    if ($scope.payment._id) {
      $scope.payment.remove();
    }
  };

}
PaymentsCtrl.$inject = ['$scope','$rootScope','$routeParams','$debounce','$location','$filter','Restangular','$fileUploader','$http'];