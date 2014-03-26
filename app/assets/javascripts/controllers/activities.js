function ActivitiesCtrl($scope, $rootScope, $routeParams, $filter, Restangular) {

  $rootScope.getMeta().then(function (metadata) {
    $scope.metadata = metadata;
  });

  // Fetch Clients
  $scope.projectlist = {};
  $scope.clients = [];
  Restangular.all('clients').getList({active: true}).then( function (list) {
    $scope.clients = list.map( function (client) { return { value: client._id, text: client.name }; });
    angular.forEach(list, function (client) {
      $scope.projectlist[client._id] = client.projects;
    });
  });

  $scope.projects = [];
  $scope.client_selected = function (id) {
    if (!id) return;
    $scope.activity.client_name = _.find($scope.clients, function (v) { return v.value == id; }).text;
    $scope.projects = $scope.projectlist[id] || [];
  };

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
    $scope.activity.date = moment().format("YYYY-MM-DD");
    $scope.activityEditForm.$setPristine();
    $scope.show_form = true;
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
ActivitiesCtrl.$inject = ['$scope','$rootScope','$routeParams','$filter','Restangular'];