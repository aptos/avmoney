var avmoneyDirectives = angular.module('avmoneyDirectives');

avmoneyDirectives.directive('clientSearch', ['Restangular', 'Storage', function(Restangular, Storage){
  return {
    restrict:'A',
    templateUrl:'assets/clientSearch.html',
    link:function (scope, element, attrs) {
      scope.client = Storage.get('client');
      scope.projects_select = Storage.get('projects_select') || [];
      scope.search_project = Storage.get('search_project');

      // Fetch Clients
      scope.projectlist = {};
      scope.clients = [];
      Restangular.all('clients').getList({active: true}).then( function (list) {
        scope.clients = list.map( function (client) {
          return {
            value: client._id,
            text: client.name,
            rate: client.rate,
            tax_rate: client.tax_rate,
            address: client.address,
            invoice_count: client.invoice_count
          };
        });
        angular.forEach(list, function (client) {
          scope.projectlist[client._id] = client.projects;
        });
      });

      // Client Select triggers update of projects
      scope.search_client = function (id) {
        Storage.set('client', id);
        Storage.erase('search_project');
        scope.filterItems();

        if (!id) {
          scope.projects_select = [];
          return;
        }
        scope.projects = scope.projectlist[id] || [];
        scope.projects_select = scope.projects.map( function (project) { return { value: project, text: project }; });
        Storage.set('projects_select', scope.projects_select);
      };

      scope.client_name =  function (id) {
        if (!id) return;
        var data = _.find(scope.clients, function (v) { return v.value == id; });
        return data && data.text;
      };
    }
  };
}]);