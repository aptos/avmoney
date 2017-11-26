function ClientsCtrl($scope, Restangular, Storage, $location) {

  // Fetch clients
  var refresh = function () {
    Restangular.one('clients').getList().then( function (list) {
      $scope.clients = list;
      var active_clients = _.filter(list, function (client) { return !client.archived; });
      var client_summary = active_clients.map( function (client) {
        return {
          value: client._id,
          text: client.name,
          rate: client.rate,
          tax_rate: client.tax_rate,
          address: client.address,
          invoice_count: client.invoice_count
        };
      });
      Storage.set('clients',client_summary);
      var projectlist = {};
      angular.forEach(list, function (client) {
        projectlist[client._id] = client.projects;
      });
      Storage.set('projectlist', projectlist);
    });
    $scope.stats = Restangular.one('invoices/stats').get().$object;
  };
  refresh();

  // Form Functions
  $scope.saveInProgress = false;

  $scope.new_client = function () {
    $scope.client = { name: '', base_invoice_id: 1 };
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
    $scope.show_client = false;
  };
  $scope.close();

  $scope.show = function (client) {
    $scope.client = client;
    $scope.show_client = true;
  };

  $scope.edit = function (id) {
    Restangular.one('clients', id).get().then(function (client) {
      $scope.client = Restangular.copy(client);
      $scope.show_client = false;
      $scope.show_form = true;
    });
  };

  $scope.archive = function (id) {
    Restangular.one('clients', id).get().then(function (client) {
      client.archived = !client.archived;
      client.put().then(function () { refresh(); });
    });
  };

  $scope.toggle_project = function (index, id, project) {
    $scope.show_projects = true;
    Restangular.one('clients', id).get().then(function (client) {
      var idx = _.indexOf(client.projects, project);
      var archived_idx = _.indexOf(client.archived_projects, project);
      if (idx !== -1) {
        if (archived_idx == -1) client.archived_projects.push(project);
        client.projects.splice(idx, 1);
      } else if (archived_idx !== -1) {
        if (idx == -1) client.projects.push(project);
        client.archived_projects.splice(archived_idx, 1);
      }
      client.put().then(function (client) {
        // $scope.show_projects = false;
        refresh();
      });
    });
  };

  $scope.show_invoices = function (id) {
    Storage.set('client', id);
    $location.path('/Invoices').search({status: 'Open'});
  };

}
ClientsCtrl.$inject = ['$scope','Restangular','Storage','$location'];