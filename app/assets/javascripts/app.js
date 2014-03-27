//= require header
//= require_tree ./controllers
//= require_tree ./services
//= require_tree ./directives
//= require filters
//= require_self

var farmdatModule = angular.module('farmdat',['ngRoute','ngAnimate','ngSanitize','ngDebounce','ngDialog','ui.bootstrap',
  ,'ui.select2','restangular','angularFileUpload','aws','farmdatServices', 'maps', 'flot', 'leaflet-directive','farmdatDirectives','farmdatFilters']);

farmdatModule.config(['$routeProvider',function($routeProvider) {
  $routeProvider.
  // Start
  when('/Activities',{templateUrl: 'assets/activities/index.html', controller: ActivitiesCtrl}).
  when('/Invoices',{templateUrl: 'assets/invoices/index.html', controller: InvoicesCtrl}).
  when('/Invoice/:id',{templateUrl: 'assets/invoiceDialog.html', controller: InvoiceShowCtrl}).
  when('/Payments',{templateUrl: 'assets/payments/index.html', controller: PaymentsCtrl}).
  when('/Clients',{templateUrl: 'assets/clients/index.html', controller: ClientsCtrl}).
  when('/Reports',{templateUrl: 'assets/reports/index.html', controller: ReportsCtrl}).

    // Default
    otherwise({templateUrl: 'assets/welcome.html', controller: StartCtrl});
  }])
.config(["$httpProvider", function(provider) {
  provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content'),
  provider.defaults.headers.common['Content-Type'] = 'application/json',
    // loading indicator and message
    provider.responseInterceptors.push('myHttpInterceptor');
  }])
.config(['RestangularProvider', function(provider) {
  provider.setRestangularFields({ id: "_id" })
}]);

farmdatModule.run(['$rootScope', '$window', '$q', 'Restangular', 'Storage', function($rootScope, $window, $q, Restangular, Storage) {

  var user = $("#globals").html();
  if (!!user) $rootScope.current_user = $.parseJSON(user);

  $rootScope.getMeta = function () {
    var deferred = $q.defer();

    var metadata = Storage.get('meta');
    if (!metadata) {
      Restangular.one('meta').get().then(function (data) {
        Storage.set('meta', data);
        deferred.resolve(data);
      }, function(response, getResponseHeaders) {
        if (response.data['error']) {
          console.info("error fetching metadata from server", response.data['error']);
        }
        deferred.reject('error');
      });
    } else {
      deferred.resolve(metadata);
    }
    return deferred.promise;
  };


  $rootScope.$safeApply = function() {
    var $scope, fn, force = false;
    if(arguments.length == 1) {
      var arg = arguments[0];
      if(typeof arg == 'function') {
        fn = arg;
      }
      else {
        $scope = arg;
      }
    }
    else {
      $scope = arguments[0];
      fn = arguments[1];
      if(arguments.length == 3) {
        force = !!arguments[2];
      }
    }
    $scope = $scope || this;
    fn = fn || function() { };
    if(force || !$scope.$$phase) {
      $scope.$apply ? $scope.$apply(fn) : $scope.apply(fn);
    }
    else {
      fn();
    }
  };

  // basic media query for angularjs
  $rootScope.mobile = function() {
    return ($window.innerWidth < 767) ? true : false;
  };

}]);