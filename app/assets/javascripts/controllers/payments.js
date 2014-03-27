function PaymentsCtrl($scope, $rootScope, $routeParams, $filter, Restangular) {

  $rootScope.getMeta().then(function (metadata) {
    $scope.metadata = metadata;
  });

  // Fetch Clients
  $scope.projectlist = {};
  $scope.clients = [];
  Restangular.all('clients').getList({active: true}).then( function (list) {
    $scope.clients = list.map( function (client) {
      return {
        value: client._id,
        text: client.name,
      };
    });
    angular.forEach(list, function (client) {
      $scope.projectlist[client._id] = client.projects;
    });
  });

  // Filter by client and project
  var filterFilter = $filter('filter');
  var orderByFilter = $filter('orderBy');
  $scope.filterItems = function() {
    var q_payments = filterFilter($scope.payments, $scope.query);
    if ($scope.client != "All") q_payments = filterFilter(q_payments, $scope.client);
    if ($scope.search_project != "All") q_payments = filterFilter(q_payments, $scope.search_project);
    var orderedItems = orderByFilter(q_payments, ['client_name','date']);

    $scope.filtered_payments = orderedItems;
  };

  $scope.$watch('payments', $scope.filterItems);
  $scope.$watch('query', $scope.filterItems);

  $scope.search_client = function (id) {
    $scope.filterItems();
    if (!id) {
      $scope.projects_select = [];
      return;
    }
    $scope.projects = $scope.projectlist[id] || [];
    $scope.projects_select = $scope.projects.map( function (project) { return { value: project, text: project }; });
  };

  // Fetch payments
  var refresh = function () {
    Restangular.all('payments').getList().then( function (list) {
      $scope.payments = list;
    });
  };
  refresh();

}
PaymentsCtrl.$inject = ['$scope','$rootScope','$routeParams','$filter','Restangular'];