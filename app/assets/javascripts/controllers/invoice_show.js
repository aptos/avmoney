function InvoiceShowCtrl($scope, $routeParams, Restangular, $location) {

  $scope.editable = false;
  Restangular.one('invoices',$routeParams.id).get().then(function (data) {
    $scope.invoice = data;
    $scope.invoiceForm.$setPristine();
  });

  $scope.update = function () {
    $scope.invoice.post().then( function () {
      $scope.update_success = true;
      $scope.invoiceForm.$setPristine();
    }, function () {
      $scope.update_fail = true;
    });
  };

  $scope.delete = function () {
    $scope.invoice.remove().then( function () {
      $location.path("/Invoices");
    }, function () {
      console.info("error")
      $scope.update_fail = true;
    });
  };

}
InvoiceShowCtrl.$inject = ['$scope','$routeParams','Restangular', '$location'];