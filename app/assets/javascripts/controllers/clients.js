function ClientsCtrl($scope, Restangular) {

  // Fetch clients
  var refresh = function () {
    Restangular.one('clients').getList().then( function (list) {
      $scope.clients = list;
    });
  };
  refresh();

  // Form Functions
  $scope.saveInProgress = false;

  $scope.new_client = function () {
    $scope.client = { name: '' };
    $scope.clientEditForm.$setPristine();
    $scope.show_form = true;
  };

  $scope.save = function () {
    if (($scope.clientEditForm.$valid) && (!$scope.saveInProgress) ) {
      $scope.saveInProgress = true;
      if ($scope.client._id) {
        $scope.client.put().then(function () {
          $scope.close();
          refresh();
        }, $scope.close);
      } else {
        Restangular.all('clients').post($scope.client).then( function () {
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
    Restangular.one('clients', id).get().then(function (client) {
      $scope.client = Restangular.copy(client);
      $scope.show_form = true;
    });
  };

  $scope.remove = function () {
    console.info("delete requested!", $scope.client);
    $scope.saveInProgress = true;
    if ($scope.client._id) {
      $scope.client.remove();
    }
  };

}
ClientsCtrl.$inject = ['$scope','Restangular'];