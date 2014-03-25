var aws = angular.module('aws', []);
/**
* The ng-thumb directive
* rewrite with Javascript-Load-Image support
*/
aws.directive('ngThumb', ['$window', function($window) {
  var helper = {
    support: !!($window.FileReader && $window.CanvasRenderingContext2D),
    isFile: function(item) {
      return angular.isObject(item) && item instanceof $window.File;
    },
    isImage: function(file) {
      var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
      return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
    }
  };

  return {
    restrict: 'A',
    link: function(scope, element, attributes) {
      if (!helper.support) return;

      var params = scope.$eval(attributes.ngThumb);
      var options = angular.copy(params);
      delete options.file;

      if (!helper.isFile(params.file)) return;
      if (!helper.isImage(params.file)) return;

        console.info("options", options)
      loadImage.parseMetaData(params.file, function (data) {
        if (data.exif) {
          options.orientation = data.exif.get('Orientation');
        }
        loadImage(
          params.file,
          function (img) {
            element[0].appendChild(img);
          },
          options
          );
      });
    }
  }

}]);