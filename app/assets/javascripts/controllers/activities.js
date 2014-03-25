function ActivitiesCtrl($scope, $rootScope, $routeParams, $debounce, $location, $filter, Restangular, $fileUploader, $http) {

  $scope.selected = undefined;
  $scope.current_user = $rootScope.current_user;
  $rootScope.getMeta().then(function (metadata) {
    $scope.metadata = metadata;
  });


  // Fetch activities
  var refresh = function () {
    Restangular.one('activities', 'mine').getList().then( function (list) {
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

  $scope.min_date = "2000-01-01";
  $scope.max_date = "2016-01-01";

  $scope.new_activity = function () {
    $scope.activity = { job: '' };
    $scope.activity.date = moment().format("YYYY-MM-DD");
    $scope.activityEditForm.$setPristine();
    $scope.show_form = true;
  };

  $scope.save = function () {
    if (($scope.activityEditForm.$valid) && (!$scope.saveInProgress) ) {
      $scope.saveInProgress = true;
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
ActivitiesCtrl.$inject = ['$scope','$rootScope','$routeParams','$debounce','$location','$filter','Restangular','$fileUploader','$http'];