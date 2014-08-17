function ActivitiesCtrl($scope, $rootScope, $routeParams, $filter, ngDialog, Restangular, $location, Storage) {

  $rootScope.getMeta().then(function (metadata) {
    $scope.metadata = metadata;
  });

  // Filter by client and project
  $scope.status = 'Active';
  // $scope.status_list = ['Active', 'Invoiced', 'Paid', 'All'];
  $scope.status_list = [{value: 'Active', text: 'Active'}, {value: 'Invoiced', text: 'Invoiced'},{value: 'Paid', text: 'Paid'},{value: 'All', text: 'All'}];
  $scope.set_status = function (status) {
    $scope.status = status;
    $scope.filterItems();
  };

  var filterFilter = $filter('filter');
  var orderByFilter = $filter('orderBy');
  $scope.filterItems = function() {
    Storage.set('search_project', $scope.search_project);
    var q_activities = filterFilter($scope.activities, $scope.query);
    if (!!$scope.search_project) {
      q_activities = _.filter(q_activities, { 'project': $scope.search_project});
    }
    if (!!$scope.status && $scope.status != 'All') {
      q_activities = _.filter(q_activities, { 'status': $scope.status});
    }
    var orderedItems = orderByFilter(q_activities, ['client_name','status','date']);

    $scope.filtered_items = orderedItems;
    get_totals($scope.filtered_items);
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
    if ($scope.client) {
      $scope.projects = $scope.projectlist[client_id];
      $scope.projects_select = $scope.projects.map( function (project) { return { value: project, text: project }; });
    }
  };

  // reduce functions
  var get_totals = function (list) {
    $scope.hours_sum = list.reduce(function(m, activity) { return m + activity.hours; }, 0);
    $scope.hours_amount = list.reduce(function(m, activity) { return m + (activity.hours * activity.rate); }, 0);

    $scope.expenses = list.reduce(function(m, activity) { return m + (activity.expense); }, 0);
    $scope.tax = list.reduce(function(m, activity) { return m + (activity.expense * activity.tax_rate * 0.01); }, 0);

    $scope.total_amount = $scope.hours_amount + $scope.expenses + $scope.tax;
  };

  // Fetch activities
  $scope.refresh = function () {
    if (!$scope.client) return;
    Restangular.all('activities').getList({client: $scope.client}).then( function (list) {
      $scope.activities = list;
    });
  };
  $scope.client = Storage.get('client');
  if (!!$scope.client) $scope.refresh();


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

    Restangular.one('clients', $scope.client).one('next_invoice').get().then( function (invoice_number) {
      $scope.invoice.invoice_number = invoice_number;
    });

    if (status == 'Proposal') {
      $scope.invoice.status = status;
      $scope.expires = moment().add('d',30).format('MMM DD, YYYY');
    }
    $scope.type = (status == "Proposal") ? "Proposal" : "Invoice";

    $scope.invoice.activities = _.filter($scope.filtered_items, {'status': 'Active'});

    $scope.invoice.client_data = _.find($scope.clients, function (v) { return v.value == $scope.client; });
    $scope.invoice.name = $scope.invoice.client_data.text;
    $scope.invoice.open_date = moment().format("YYYY-MM-DD");

    $scope.invoice.hours_sum = $scope.invoice.activities.reduce(function(m, activity) { return m + activity.hours; }, 0);
    $scope.invoice.hours_amount = $scope.invoice.activities.reduce(function(m, activity) { return m + (activity.hours * activity.rate); }, 0);

    $scope.invoice.expenses = $scope.invoice.activities.reduce(function(m, activity) { return m + (activity.expense); }, 0);
    $scope.invoice.tax = $scope.invoice.activities.reduce(function(m, activity) { return m + (activity.expense * activity.tax_rate * 0.01 + activity.tax_paid); }, 0);

    $scope.invoice.invoice_total = $scope.invoice.hours_amount + $scope.invoice.expenses + $scope.invoice.tax;

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
      console.error("Eek!", response.data.error);
      $scope.errors = "Sorry, something bad happened!\n" + response.data.error;
      $scope.saveInProgress = false;
    });
  };

  $scope.save = function (add) {
    if (($scope.activityEditForm.$valid) && (!$scope.saveInProgress) ) {
      $scope.saveInProgress = true;
      if ($scope.activity.project && $scope.activity.project.length > 1) {
        console.info("Update Projects", $scope.activity.project)
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
  };

  $scope.edit = function (id) {
    Restangular.one('activities', id).get().then(function (activity) {
      $scope.activity = Restangular.copy(activity);
      $scope.subtype = ($scope.activity.hours) ? 'Timesheet' : 'Expense';
      if ( $scope.subtype == 'Expense')  $scope.tax_paid = $scope.activity.tax_paid > 0;
      $scope.projects = $scope.projectlist[$scope.activity.client_id];
      $scope.show_form = true;
      $scope.activityEditForm.$setPristine();
    });
  };

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