function InvoiceShowCtrl($scope, $routeParams, Restangular) {

  $scope.editable = false;
  Restangular.one('invoices',$routeParams.id).get().then(function (data) {
    $scope.invoice = data;
  });

}
InvoiceShowCtrl.$inject = ['$scope','$routeParams','Restangular'];