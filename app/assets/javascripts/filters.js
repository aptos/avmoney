var farmdatFilters = angular.module('farmdatFilters', []);

farmdatFilters.filter('inFeet', function() {
  return function(meters, format) {
    return Math.floor(parseInt(meters, 10) * 3.280839895) + "ft";
  };
});

farmdatFilters.filter('timeAgo', function() {
  return function(dateString, format) {
    return moment(dateString).fromNow();
  };
});

farmdatFilters.filter('moment', function() {
  return function(dateString, format, eob) {
    if (!dateString) { return "-"; }
    if (format) {
      if (format == "timeago") {
        if (eob == 'true') {
          return moment(dateString).add('days',1).fromNow();
        } else {
          return moment(dateString).fromNow();
        }
      } else {
        return moment(dateString).format(format);
      }
    } else {
      return moment(dateString).format("YYYY-MM-DD");
    }
  };
});

farmdatFilters.filter('range', function() {
  return function(input, min, max) {
    min = parseInt(min);
    max = parseInt(max);
    for (var i=min; i<max; i++)
      input.push(i);
    return input;
  };
});

farmdatFilters.filter('matchYear', function () {
  return function (list, year) {
    var filtered_list = [];
    if (!angular.isDefined(year)) return list;
    var getYear = function (ymd) { return ymd.split("-")[0]; };
    angular.forEach(list, function (item) {
      if (getYear(item.date) === year) filtered_list.push(item);
    });
    return filtered_list;
  };
});

farmdatFilters.filter('truncate', function () {
  return function (text, length, end, disabled) {
    if (!text) return;
    if (isNaN(length))
      length = 10;
    if (end === undefined)
      end = "...";
    if (disabled || text.length <= length || text.length - end.length <= length) {
      return text;
    } else {
      return String(text).substring(0, length-end.length) + end;
    }
  };
});

farmdatFilters.filter('humanBytes', function () {
  return function (fileSizeInBytes) {
    if (!fileSizeInBytes) return null;
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB'];
    do {
      fileSizeInBytes = fileSizeInBytes / 1024;
      i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
  };
});