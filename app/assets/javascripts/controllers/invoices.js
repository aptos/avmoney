function InvoicesCtrl($scope, $rootScope, $routeParams, $location, $filter, ngDialog, Restangular, Storage) {

  $rootScope.getMeta().then(function (metadata) {
    $scope.metadata = metadata;
  });

  $scope.client = Storage.get('client')
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
    Storage.set('search_project', $scope.search_project);
    var q = filterFilter($scope.invoices, $scope.query);
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
  };

  $scope.$watch('invoices', $scope.filterItems);
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

  // Fetch invoices
  var refresh = function () {
    Restangular.all('invoices').getList().then( function (list) {
      $scope.invoices = list;
    });
  };
  refresh();

  // Open Invoice in new tab
  $scope.open = function (id) {
    $location.path("/Invoice/" + id);
  };

  // Pay
  $scope.pay = function (id) {
    var invoice = _.find($scope.invoices, function (v) { return v._id == id; });
    $scope.payment = {
      invoice_id: invoice._id,
      invoice_number: invoice.invoice_number,
      client_id: invoice.client_id,
      client_name: invoice.name,
      project: invoice.project,
      amount: invoice.invoice_total - invoice.paid,
      date: moment().format("YYYY-MM-DD")
    }
    $scope.show_form = true;
  };

  $scope.close = function () {
    $scope.saveInProgress = false;
    $scope.show_form = false;
  };

  $scope.save_payment = function () {
    $scope.saveInProgress = true;
    $scope.success = false;
    Restangular.all('payments').post($scope.payment).then( function () {
      $scope.close();
      $scope.success = true;
      refresh();
    },$scope.close);
  };

  // Date Format
  $scope.dateformat = 'D MMM \'YY';
  $scope.toggle_date = function () {
    $scope.dateformat = ($scope.dateformat == 'timeago') ? 'D MMM \'YY'  : 'timeago';
  };

  // Form Functions
  $scope.saveInProgress = false;

  $scope.min_date = "2014-01-01";

  $scope.save_payment = function () {
    $scope.saveInProgress = true;
    $scope.success = false;
    Restangular.all('payments').post($scope.payment).then( function () {
      $scope.close();
      $scope.success = true;
      refresh();
    },$scope.close);
  };

}
InvoicesCtrl.$inject = ['$scope','$rootScope','$routeParams','$location','$filter','ngDialog','Restangular','Storage'];