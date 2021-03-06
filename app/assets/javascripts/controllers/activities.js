function ActivitiesCtrl($scope, $rootScope, $routeParams, $filter, ngDialog, Restangular, $location, Storage) {

  $rootScope.getMeta().then(function (metadata) {
    $scope.metadata = metadata;
  });

  $scope.spinning = false;

  // Filter by client and project
  $scope.status = 'Active';
  $scope.status_list = [{value: 'Active', text: 'Active'}, {value: 'Invoiced', text: 'Invoiced'},{value: 'Paid', text: 'Paid'},{value: 'Proposal', text: 'Proposal'},{value: 'All', text: 'All'}];
  $scope.set_status = function (status) {
    $scope.status = status;
    $scope.filterItems()
  };

  var filterFilter = $filter('filter');
  var orderByFilter = $filter('orderBy');
  $scope.filterItems = function() {
    if ($scope.activities) console.info("Activities: " + $scope.activities.length)
    Storage.set('search_project', $scope.search_project);
    var q_activities = $scope.activities;
    if (!!$scope.search_project) {
      q_activities = _.filter(q_activities, { 'project': $scope.search_project});
    }
    // get totals by project
    $scope.stats = get_totals(q_activities);
    if (!!$scope.search_project) get_project_data($scope.client);

    q_activities = filterFilter(q_activities, $scope.query);
    if (!!$scope.status && $scope.status != 'All') {
      q_activities = _.filter(q_activities, { 'status': $scope.status});
    }
    var orderedItems = orderByFilter(q_activities, ['date','client_name','status']);

    $scope.filtered_items = orderedItems;
    $scope.filtered_stats = get_totals($scope.filtered_items);
    $scope.spinning = false;
  };

  $scope.$watch('activities', $scope.filterItems);
  $scope.$watch('query', $scope.filterItems);

  $scope.client_selected = function (id) {
    if (!id) return;
    var client = _.find($scope.clients, function (v) { return v.value == id; });
    $scope.activity.client_name = client.text;
    $scope.activity.rate = client.rate;
    $scope.activity.tax_rate = client.tax_rate;
    $scope.projects = $scope.projectlist[id] || [];
    $scope.projects_select = $scope.projects.map( function (project) { return { value: project, text: project }; });
    Storage.set('projects_select', $scope.projects_select);

    $scope.client = id;
    Storage.set('client', id);
    Storage.erase('search_project');

    if ($scope.projects.length == 1) {
      $scope.activity.project = $scope.projects[0];
      $scope.search_project = $scope.activity.project;
    }
    $scope.filterItems();
  };

  $scope.project_selected = function () {
    $scope.search_project = $scope.activity.project;
    $scope.filterItems();
  };

  var update_projects = function (client_id, project) {
    $scope.projectlist[client_id].push(project);
    $scope.projectlist[client_id] = _.uniq($scope.projectlist[client_id]);
    Storage.set('projectlist', $scope.projectlist);
    if ($scope.client) {
      $scope.projects = $scope.projectlist[client_id];
      $scope.projects_select = $scope.projects.map( function (project) { return { value: project, text: project }; });
    }
  };

  // reduce functions
  var get_totals = function (list) {
    if (!list) return;
    var stats = {};
    stats.hours_sum = list.reduce(function(m, activity) { return m + activity.hours; }, 0);
    stats.hours_amount = list.reduce(function(m, activity) { return m + (activity.hours * activity.rate); }, 0);

    stats.fixed_charges = list.reduce(function(m, activity) { return m + (activity.fixed_charge); }, 0);

    stats.expenses = list.reduce(function(m, activity) { return m + (activity.expense); }, 0);
    stats.tax = list.reduce(function(m, activity) { return m + (activity.expense * activity.tax_rate * 0.01); }, 0);

    stats.total_amount = stats.hours_amount + stats.fixed_charges + stats.expenses + stats.tax;

    return stats;
  };

  var last_project, orig_project_data;
  var get_project_data = function () {
    if (!$scope.client || !$scope.search_project || $scope.search_project == last_project) return;
    last_project = $scope.search_project;
    $scope.project_data = {
      client_id: $scope.client,
      name: $scope.search_project,
      cap: 'set cap'
    };
    Restangular.one('clients', $scope.client).one('projects').getList().then(function (data) {
      var project_data = _.where(data, {'name': $scope.search_project});
      if (!!project_data.length) {
        $scope.project_data = project_data[0];
        update_chart();
      }
    });
  };

  $scope.update_project = function () {
    Restangular.one('clients', $scope.client).post('projects', $scope.project_data).then(function (data) {
      $scope.project_data = data;
      $scope.project_updated = true;
      update_chart();
    });
  };

  var update_chart = function () {
    if ($scope.stats.total_amount && $scope.project_data.cap) {
      $scope.cap_percent = Math.floor($scope.stats.total_amount/$scope.project_data.cap * 100);
    } else {
      $scope.project_data.cap = 'set cap';
      $scope.cap_percent = 0;
    }
  };

  // Fetch activities
  // Project tracking requires all status
  $scope.refresh = function (cb) {
    if (!$scope.client) return;
    var params = {client_id: $scope.client};
    $scope.spinning = true;
    Restangular.all('activities').getList(params).then( function (list) {
      $scope.activities = list;
    }).then(cb);
  };
  $scope.client = Storage.get('client');

  // Date Format
  $scope.dateformat = 'M/D/YY';
  $scope.toggle_date = function () {
    $scope.dateformat = ($scope.dateformat == 'timeago') ? 'M/D/YY'  : 'timeago';
  };

  // Form Functions
  $scope.saveInProgress = false;

  $scope.min_date = "2014-01-01";
  $scope.max_date = moment().format("YYYY-MM-DD");

  $scope.add_day = function () {
    if (!$scope.activity.date) return;
    $scope.activity.date = moment($scope.activity.date).add('d',1).format("YYYY-MM-DD");
  };

  $scope.subtract_day = function () {
    if (!$scope.activity.date) return;
    $scope.activity.date = moment($scope.activity.date).subtract('d',1).format("YYYY-MM-DD");
  };

  $scope.change_tax = function () {
    if ($scope.tax_paid) {
      $scope.activity.tax_rate = $scope.activity.tax_paid = 0;
    } else {
      $scope.activity.tax_paid = 0;
    }
  };

  $scope.new_activity = function (subtype) {
    $scope.add_project = false;
    $scope.subtype = subtype || $scope.subtype;
    if ($scope.activity) var default_date = $scope.activity.date;
    $scope.activity = {
      client_name: '',
      tax_rate: 0.0
    };
    $scope.taxable = true;
    if (!!default_date) $scope.activity.date = default_date;
    if ($scope.client) {
      $scope.activity.client_id = $scope.client;
      $scope.client_selected($scope.client);
    }
    if ($scope.search_project) $scope.activity.project = $scope.search_project;
    if (!$scope.activity.project && $scope.activity.client_id && $scope.projectlist[$scope.activity.client_id].length == 1) {
      $scope.activity.project = $scope.projectlist[$scope.activity.client_id][0];
    }
    $scope.activityEditForm.$setPristine();
    $scope.show_form = true;
  };

  // Invoice Dialog
  $scope.invoice_editable = true;
  $scope.create_invoice = function (status) {
    $scope.invoice = {
      client_id: $scope.client,
      project: $scope.search_project
    };
    if ($scope.project_data) {
      $scope.invoice.po_number = $scope.project_data.po_number;
      $scope.invoice.work_order = $scope.project_data.wo_number;
    }

    Restangular.one('clients', $scope.client).one('next_invoice').get().then( function (invoice_number) {
      $scope.invoice.invoice_number = invoice_number;
    });

    if (status == 'Proposal') {
      $scope.invoice.status = status;
      $scope.expires = moment().add('d',30).format('MMM DD, YYYY');
    }
    $scope.type = (status == "Proposal") ? "Proposal" : "Invoice";

    $scope.invoice.activities = _.filter($scope.filtered_items, {'status': 'Active'});
    var hours_items = _.filter($scope.invoice.activities, function (a) { return !!a.hours; });
    $scope.hours_activities = { 1: hours_items};
    var exp_items = _.filter($scope.invoice.activities, function (a) { return !a.hours; });
    $scope.exp_activities = { 1: exp_items };

    $scope.invoice.client_data = _.find($scope.clients, function (v) { return v.value == $scope.client; });
    $scope.invoice.name = $scope.invoice.client_data.text;
    $scope.invoice.open_date = moment().format("YYYY-MM-DD");

    $scope.invoice.hours_sum = $scope.invoice.activities.reduce(function(m, activity) { return m + activity.hours; }, 0);
    $scope.invoice.hours_amount = $scope.invoice.activities.reduce(function(m, activity) { return m + (activity.hours * activity.rate); }, 0);

    $scope.invoice.fixed_charges = $scope.invoice.activities.reduce(function(m, activity) { return m + (activity.fixed_charge); }, 0);

    $scope.invoice.expenses = $scope.invoice.activities.reduce(function(m, activity) { return m + (activity.expense); }, 0);
    $scope.invoice.tax = $scope.invoice.activities.reduce(function(m, activity) { return m + (activity.expense * activity.tax_rate * 0.01 + activity.tax_paid); }, 0);

    $scope.invoice.invoice_total = $scope.invoice.hours_amount + $scope.invoice.fixed_charges + $scope.invoice.expenses + $scope.invoice.tax;

    $scope.success = false;
    $scope.errors = false;
    ngDialog.open({
      template: 'assets/invoiceDialog.html',
      showClose: true,
      className: 'ngdialog-theme-flat',
      scope: $scope
    });
  };

  $scope.save_invoice = function () {
    $scope.errors = false;
    $scope.saveInProgress = true;
    $scope.success = false;
    Restangular.all('invoices').post($scope.invoice).then( function (invoice) {
      $scope.close();
      ngDialog.close();
      _.where($scope.clients, { value: $scope.invoice.client_id})[0].invoice_count += 1;
      $scope.success = true;
      $location.path("/Invoice/" + invoice._id);
    }, function (response) {
      $scope.errors = "Sorry, something bad happened!\n" + response.data.error;
      $scope.saveInProgress = false;
    });
  };

  $scope.save = function (add) {
    if (($scope.activityEditForm.$valid) && (!$scope.saveInProgress) ) {
      $scope.saveInProgress = true;
      if ($scope.activity.project && $scope.activity.project.length > 1) {
        update_projects($scope.activity.client_id, $scope.activity.project);
      }
      $scope.search_project = $scope.activity.project;
      Storage.set('projects_select', $scope.projects_select);

      if ($scope.activity._id) {
        $scope.activity.put().then(function () {
          if (add) {
            $scope.client = $scope.activity.client_id;
            $scope.saveInProgress = false;
            $scope.new_activity();
          } else {
            $scope.close();
          }
          $scope.refresh();
        }, function (response) {
          console.error("Eek!", response.data.error);
          $scope.close;
        });
      } else {
        Restangular.all('activities').post($scope.activity).then( function () {
          if (add) {
            $scope.saveInProgress = false;
            $scope.new_activity();
          } else {
            $scope.close();
          }
          $scope.refresh();
        }, function (response) {
          console.error("Eek!", response);
          $scope.close;
        });
      }
    }
  };

  $scope.close = function () {
    $scope.saveInProgress = false;
    $scope.show_form = false;
    $scope.errors = false;
    $location.url($location.path());
  };

  $scope.edit = function (id) {
    Restangular.one('activities', id).get().then(function (activity) {
      $scope.activity = Restangular.copy(activity);
      $scope.client_selected(activity.client_id); // Sets defaults

      if (!!$scope.activity.hours) {
        $scope.subtype = 'Timesheet';
      } else if (!!$scope.activity.fixed_charge) {
        $scope.subtype = 'Fixed';
      } else {
        $scope.subtype = 'Expense';
      }
      if ( $scope.subtype == 'Expense')  $scope.tax_paid = $scope.activity.tax_paid > 0;

      $scope.project_selected();
      if (!$scope.activities) $scope.refresh();
      $scope.projects = $scope.projectlist[$scope.activity.client_id];
      $scope.show_form = true;
      $scope.activityEditForm.$setPristine();
    });
  };

  $scope.$watch('clients', function() {
    if ($routeParams.id) {
      $scope.edit($routeParams.id);
    } else {
      if (!$scope.activities) $scope.refresh();
    }
  });

  $scope.remove = function () {
    console.info("delete requested!", $scope.activity);
    $scope.saveInProgress = true;
    if ($scope.activity._id) {
      $scope.activity.remove();
      refresh();
      $scope.filterItems();
      $scope.close();
    }
  };

}
ActivitiesCtrl.$inject = ['$scope','$rootScope','$routeParams','$filter','ngDialog','Restangular','$location','Storage'];
