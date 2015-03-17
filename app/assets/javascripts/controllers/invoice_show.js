function InvoiceShowCtrl($scope, $routeParams, Restangular, $location, $window) {

  $scope.editable = false;

  var get_active_items = function () {
    Restangular.all('activities').getList({client_id: $scope.invoice.client_id, project: $scope.invoice.project, status: 'Active'}).then( function (list) {
      $scope.more_activities = list;
    });
  };

  var refresh = function () {
    Restangular.one('invoices',$routeParams.id).get().then(function (data) {
      $scope.invoice = data;

      Restangular.one('clients', data.client_id).get().then(function (data) {
        var client = {
          text: data.name,
          address: data.address
        };
        angular.extend($scope.invoice.client_data, client);
      });

      if ($scope.invoice.status == 'Proposal') {
        $scope.expires = moment($scope.invoice.open_date).add('d',30).format('MMM DD, YYYY');
      }
      $scope.type = ($scope.invoice.status == "Proposal") ? "Proposal" : "Invoice";
      if ($scope.type == "Invoice") get_active_items();
      $scope.invoiceForm.$setPristine();
      getPages();
    });
  };
  refresh();

  $scope.add_more = function () {
    var list = _.map($scope.more_activities, function (activity) {
      return _.pick(activity, ['_id','_rev','client_id','client_name','created_at','date','expense','notes','hours','project','rate','status','tax_rate']);
    });
    $scope.invoice.activities = $scope.invoice.activities.concat(list);
    $scope.more_activities = [];
    $scope.invoiceForm.$setDirty();
    $scope.update();
  };

  $scope.update = function () {
    $scope.update_fail = false;
    $scope.invoice.post().then( function () {
      refresh();
    }, function () {
      $scope.update_fail = true;
    });
  };

  $scope.accept = function () {
    $scope.invoice.status = "Open";
    $scope.update();
  };

  $scope.delete = function () {
    $scope.invoice.remove().then( function () {
      $location.path("/Invoices");
    }, function () {
      console.info("error");
      $scope.update_fail = true;
    });
  };

  $scope.print = function () {
    $window.print();
  };

  $scope.toggleDisplayRates = function () {
    $scope.display_rates = !$scope.display_rates;
    getPages();
  };

  var current_page = 1;
  $scope.page_break = function (page) {
    if (page != current_page) {
      current_page = page;
      return 'page-break';
    }
    return;
  };

  // Paging
  var page = 1,
  chars_per_line = 84,
  page_break_lines = 36,
  heading_lines = 21,
  page_heading_lines = 6,
  totals_lines = 10,
  page_lines = heading_lines;

  var getPages = function () {
    if (!$scope.invoice.activities) return;

    page = 1;
    page_lines = heading_lines;
    chars_per_line = (!!$scope.display_rates) ? 74 : 84;

    var hours_items = _.filter($scope.invoice.activities, function (a) { return !!a.hours; });
    if (!!hours_items) {
      hours_items = _.sortBy(hours_items, function (a) { return a.date; });
      hours_items = setPages(hours_items);
      $scope.hours_activities = _.groupBy(hours_items, function (h) { return h.page;} );
    }
    $scope.hours_pages = Object.keys($scope.hours_activities).length;

    var exp_items = _.filter($scope.invoice.activities, function (a) { return !a.hours; });
    if (!!exp_items) {
      if (!!hours_items) page_lines += 8;
      if (page_lines > page_break_lines) $scope.break_before_expenses = page;

      exp_items = _.sortBy(exp_items, function (a) { return a.date; });
      exp_items = setPages(exp_items);
      $scope.exp_activities = _.groupBy(exp_items, function (h) { return h.page;} );
    }
    if (page_lines + totals_lines > page_break_lines) page += 1;
    $scope.pages = page;
  };

  var setPages = function (items) {
    if (!items.length) return;

    _.forEach(items, function (a) {
      a.lines = Math.floor(a.notes.length/chars_per_line) + 1;
      page_lines += a.lines;
      if (page_lines > page_break_lines) {
        page += 1;
        page_lines = page_heading_lines;
      }
      a.page = page;
      a.page_lines = page_lines;
      // console.log("item", a.date, page_lines, page)
    });
    return items;
  };

}
InvoiceShowCtrl.$inject = ['$scope','$routeParams','Restangular', '$location', '$window'];