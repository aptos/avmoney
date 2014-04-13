function PaymentsCtrl($scope, $rootScope, $routeParams, $filter, Restangular, Storage) {

  $rootScope.getMeta().then(function (metadata) {
    $scope.metadata = metadata;
  });

  $scope.client = Storage.get('client');
  $scope.projects_select = Storage.get('projects_select') || [];
  $scope.search_project = Storage.get('search_project');

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
    var q = filterFilter($scope.payments, $scope.query);
    if (!!$scope.client) {
      q = _.filter(q, {'client_id': $scope.client});
      console.info("q", q)
    }
    if (!!$scope.search_project) {
      q = _.filter(q, {'project': $scope.search_project});
      console.info("project list", q);
    }
    var orderedItems = orderByFilter(q, ['client_name','status','date']);
    console.info("orderedItems filtered", orderedItems)
    $scope.filtered_items = orderedItems;
  }

  $scope.$watch('payments', $scope.filterItems);
  $scope.$watch('query', $scope.filterItems);

  $scope.search_client = function (id) {
    Storage.set('client', id);
    Storage.erase('search_project');
    $scope.filterItems();
    if (!id) {
      $scope.projects_select = [];
      return;
    }
    $scope.projects = $scope.projectlist[id] || [];
    $scope.projects_select = $scope.projects.map( function (project) { return { value: project, text: project }; });
    Storage.set('projects_select', $scope.projects_select);
  };

  // Fetch payments
  var refresh = function () {
    Restangular.all('payments').getList().then( function (list) {
      $scope.payments = list;
    });
  };
  refresh();

}
PaymentsCtrl.$inject = ['$scope','$rootScope','$routeParams','$filter','Restangular','Storage'];