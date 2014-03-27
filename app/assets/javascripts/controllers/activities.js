function ActivitiesCtrl($scope, $rootScope, $routeParams, $filter, ngDialog, Restangular) {

  $rootScope.getMeta().then(function (metadata) {
    $scope.metadata = metadata;
  });

  // Fetch Clients
  $scope.projectlist = {};
  $scope.clients = [];
  Restangular.all('clients').getList({active: true}).then( function (list) {
    $scope.all_clients = list;
    $scope.clients = list.map( function (client) {
      return {
        value: client._id,
        text: client.name,
        rate: client.rate,
        address: client.address,
        invoice_count: client.invoice_count
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
    var q_activities = filterFilter($scope.activities, $scope.query);
    if ($scope.client != "All") q_activities = filterFilter(q_activities, $scope.client);
    if ($scope.search_project != "All") q_activities = filterFilter(q_activities, $scope.search_project);
    var orderedItems = orderByFilter(q_activities, ['client_name','date']);

    $scope.filtered_activities = orderedItems;
  };

  $scope.$watch('activities', $scope.filterItems);
  $scope.$watch('query', $scope.filterItems);


  $scope.projects = [];
  $scope.client_selected = function (id) {
    if (!id) return;
    var client = _.find($scope.clients, function (v) { return v.value == id; });
    $scope.activity.client_name = client.text;
    $scope.activity.rate = client.rate;
    $scope.projects = $scope.projectlist[id] || [];
  };

  $scope.search_client = function (id) {
    $scope.filterItems();
    if (!id) {
      $scope.projects_select = [];
      return;
    }
    $scope.projects = $scope.projectlist[id] || [];
    $scope.projects_select = $scope.projects.map( function (project) { return { value: project, text: project }; });
  }

  var update_projects = function (client_id, project) {
    $scope.projectlist[client_id].push(project);
    $scope.projectlist[client_id] = _.uniq($scope.projectlist[client_id]);
  };

  // Fetch activities
  var refresh = function () {
    Restangular.all('activities').getList({status: "Open"}).then( function (list) {
      $scope.activities = list;
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

  $scope.min_date = "2014-01-01";

  $scope.new_activity = function () {
    $scope.activity = { client_name: '' };
    if ($scope.client) {
      $scope.activity.client_id = $scope.client;
      $scope.client_selected($scope.client);
    }
    $scope.activity.date = moment().format("YYYY-MM-DD");
    $scope.activityEditForm.$setPristine();
    $scope.show_form = true;
  };

  // Invoice Dialog
  $scope.create_invoice = function () {
    $scope.invoice = {
      activities: $scope.filtered_activities,
      project: $scope.search_project
    };

    $scope.invoice.client_data = _.find($scope.clients, function (v) { return v.value == $scope.client; });
    $scope.invoice.name = $scope.invoice.client_data.text;
    $scope.invoice.invoice_id = $scope.invoice.client_data.invoice_count + 1;
    $scope.invoice.hours_sum = $scope.filtered_activities.reduce(function(m, activity) { return m + activity.hours; }, 0);
    $scope.invoice.hours_amount = $scope.filtered_activities.reduce(function(m, activity) { return m + (activity.hours * activity.rate); }, 0);
    $scope.invoice.invoice_total = $scope.invoice.hours_amount;

    ngDialog.open({
      template: 'assets/invoiceDialog.html',
      showClose: true,
      className: 'ngdialog-theme-flat',
      scope: $scope
    });
  };

  $scope.save_invoice = function () {
    Restangular.all('invoices').post($scope.invoice).then( function () {
      $scope.close();
      refresh();
    },$scope.close);
  };

  $scope.save = function () {
    if (($scope.activityEditForm.$valid) && (!$scope.saveInProgress) ) {
      $scope.saveInProgress = true;
      update_projects($scope.activity.client_id, $scope.activity.project);
      if ($scope.activity._id) {
        $scope.activity.put().then(function () {
          $scope.close();
          refresh();
        }, $scope.close);
      } else {
        Restangular.all('activities').post($scope.activity).then( function () {
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
    Restangular.one('activities', id).get().then(function (activity) {
      $scope.activity = Restangular.copy(activity);
      $scope.projects = $scope.projectlist[$scope.activity.client_id];
      $scope.show_form = true;
    });
  };

  $scope.remove = function () {
    console.info("delete requested!", $scope.activity);
    $scope.saveInProgress = true;
    if ($scope.activity._id) {
      $scope.activity.remove();
    }
  };

}
ActivitiesCtrl.$inject = ['$scope','$rootScope','$routeParams','$filter','ngDialog','Restangular'];