var maps = angular.module('maps', []);

maps.directive('geocode', ['$debounce', function($debounce) {
  return {
    restrict: 'A',
    require:'ngModel',
    replace: true,
    link: function(scope, element, attrs, ngModel) {

      var geocoder = new google.maps.Geocoder();
      var getLocation = $debounce(
        function (location, callback) {
          if (!location) { return; }
          geocoder.geocode( { 'address': location}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              latLong = [ results[0].geometry.location.lat(),results[0].geometry.location.lng()] ;
              console.info("geocode: " + latLong);
            } else {
              console.error("Geocode was not successful for the following reason: " + status);
              return;
            }
            callback(latLong);
          });
        }, 2000, false);

      scope.$watch(attrs.ngModel, function(value, oldValue) {
        if (value === oldValue) { return; }
        if (typeof(oldValue) === 'undefined') { return; }
        getLocation(value, function(response) {
          scope[attrs.latlong] = response;
          scope.$apply();
        });
      });
    }
  };
}]);

maps.factory('Elevation', ['$q', function($q) {
  return {
    location: function(latLng) {
      var deferred = $q.defer();
      elevator = new google.maps.ElevationService();
      var pos = new google.maps.LatLng(latLng[0],latLng[1]);
      var positionalRequest = {
        'locations': [pos]
      };

      elevator.getElevationForLocations(positionalRequest, function(results, status) {
        if (status == google.maps.ElevationStatus.OK) {
          if (results[0]) {
            deferred.resolve(results[0].elevation);
          } else {
            console.error("Elevation service failed due to: " + status);
            deferred.reject('Elevation service failed due to: ' + status);
          }
        }
      });
      return deferred.promise;
    }
  };
}]);