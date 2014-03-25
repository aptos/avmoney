var flot = angular.module('flot', []);

flot.directive('chart', ['$timeout', function($timeout) {
  return{
    restrict: 'A',
    require:'ngModel',
    link: function(scope, elem, attrs, ngModel){

      var chart = null,
      opts  = scope.$eval(attrs.config);

      var render_chart = function(data){
        if (!data) return;

        chart = $.plot(elem, data , opts);
        elem.show();
      };

      var update_chart = function (data) {
        chart.setData(data);
        chart.setupGrid();
        chart.draw();
      };

      scope.$watch(attrs.ngModel, function (data){
        if (!data) return;
        opts  = scope.$eval(attrs.config);
        render_chart(data);
        //  Crazy Hack that resets y-axis labels after DOM is rendered and size is corrected
        $timeout( function () {
          render_chart(data);
        }, 100);
      });
    }
  };
}]);