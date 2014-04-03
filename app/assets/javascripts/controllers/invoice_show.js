function InvoiceShowCtrl($scope, $routeParams, Restangular, $location) {

  $scope.editable = false;

  var get_active_items = function (client_id, project) {
    console.info("get active items", client_id, project)
    Restangular.all('activities').getList({client_id: client_id, project: project, status: 'Active'}).then( function (list) {
      $scope.more_activities = list;
    });
  };

  Restangular.one('invoices',$routeParams.id).get().then(function (data) {
    $scope.invoice = data;
    $scope.invoiceForm.$setPristine();
    get_active_items($scope.invoice.client_id, $scope.invoice.project);
  });

  $scope.add_more = function () {
    var list = _.map($scope.more_activities, function (activity) {
      return _.pick(activity, ['_id','_rev','client_id','client_name','created_at','date','expense','notes','hours','project','rate','status','tax_rate']);
    });
    console.info("add more!", list)
    $scope.invoice.activities = $scope.invoice.activities.concat(list);
  };

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
      console.info("error");
      $scope.update_fail = true;
    });
  };

}
InvoiceShowCtrl.$inject = ['$scope','$routeParams','Restangular', '$location'];