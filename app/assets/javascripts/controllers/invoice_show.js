function InvoiceShowCtrl($scope, $routeParams, Restangular, $location) {

  $scope.editable = false;

  var get_active_items = function () {
    Restangular.all('activities').getList({client_id: $scope.invoice.client_id, project: $scope.invoice.project, status: 'Active'}).then( function (list) {
      $scope.more_activities = list;
    });
  };

  var refresh = function (data) {
    $scope.invoice = data;
    if ($scope.invoice.status == 'Proposal') {
      $scope.expires = moment($scope.invoice.open_date).add('d',30).format('MMM DD, YYYY');
    }
    $scope.type = ($scope.invoice.status == "Proposal") ? "Proposal" : "Invoice";
    if ($scope.type == "Invoice") get_active_items();
    $scope.invoiceForm.$setPristine();
  };

  Restangular.one('invoices',$routeParams.id).get().then(function (data) {
    refresh(data);
  });

  $scope.add_more = function () {
    var list = _.map($scope.more_activities, function (activity) {
      return _.pick(activity, ['_id','_rev','client_id','client_name','created_at','date','expense','notes','hours','project','rate','status','tax_rate']);
    });
    $scope.invoice.activities = $scope.invoice.activities.concat(list);
    $scope.invoiceForm.$setDirty();
  };

  $scope.update = function () {
    $scope.invoice.post().then( function (data) {
      refresh(data);
    }, function () {
      $scope.update_fail = true;
    });
  };

  $scope.accept = function () {
    $scope.invoice.status = "Open";
    $scope.update();
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