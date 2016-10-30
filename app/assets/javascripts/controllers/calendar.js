function CalendarCtrl($scope, $rootScope, $routeParams, $filter, ngDialog, Restangular, $location, Storage) {


  // HTML version of event for calendar view
  status_class = { 'Active': 'text-info', 'Invoiced': 'text-warning', 'Paid': 'text-success'};
  var get_event_html = function (event) {
    var html_str = "<span>" + event.client_name;
    if (event.project) html_str += ": " + event.project;
    if (event.hours) html_str += "<br />" + event.hours + " hours";
    if (event.fixed_charge) html_str += "<br />Fixed Charge: $" + event.fixed_charge;
    if (event.expense) html_str += "<br />Expense: $" + event.expense;
    html_str += " - <label class=" + status_class[event.status] + ">" + event.status + "</label>";
    html_str += "<p><a href='#/Activities?id=" + event._id + "''>" + event.notes + "</a></p>";
    html_str += "</span>";

    return html_str;
  };

  $scope.to_date = function (date) {
    return date.replace(/T.*/,'');
  };

  // query support
  var filterFilter = $filter('filter');

  // returns { 'YYYY-MM-DD' : 'html string', ... }
  $scope.filterItems = function() {
    var filtered_data = filterFilter($scope.events, $scope.query);
    var events = {};
    var hours_totals = {};
    _.each(filtered_data, function (event) {
      var date = $scope.to_date(event.date);
      events[date] = (events[date]) ? events[date] + get_event_html(event) : get_event_html(event);
      hours_totals[date] = (hours_totals[date]) ? hours_totals[date] + event.hours : event.hours;
    });
    _.forEach(events, function (event, date) {
      if (hours_totals[date]) events[date] = "<span>Total: " + hours_totals[date] + " hours</span>" + events[date];
    });
    $scope.calendar_data = events;
  };

  // Fetch activities
  $scope.spinning = false;
  var refresh = function () {
    $scope.spinning = true;
    var params = {months: 12};
    Restangular.all('activities').getList(params).then( function (list) {
      $scope.events = list;
      $scope.spinning = false;
    }, function (error) { $scope.spinning = false; });
  };
  refresh();

  // Watchers
  $scope.$watch('events.length', function () {
    $scope.filterItems();
    // dateRangeFilterItems();
  });

  $scope.$watch('query', function () {
    $scope.filterItems();
    // dateRangeFilterItems();
  });

}
CalendarCtrl.$inject = ['$scope','$rootScope','$routeParams','$filter','ngDialog','Restangular','$location','Storage'];