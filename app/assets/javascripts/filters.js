angular.module('avmoneyFilters', [])
.filter('timeAgo', function() {
  return function(dateString, format) {
    return moment(dateString).fromNow();
  };
})
.filter('moment', function() {
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
})
.filter('truncate', function () {
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
})
.filter('humanBytes', function () {
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
})
.filter('dateRange', function () {
  return function (list, query, el, d1, d2) {
    var matches = [],
    today = moment();
    if (query == 'This Year') {
      _.each(list, function (item) {
        if (moment(item[el]).isSame(today, 'year')) matches.push(item);
      });
    } else if (query == 'Last Year') {
      var last_year = today.subtract(1,'years');
      _.each(list, function (item) {
        if (moment(item[el]).isSame(last_year, 'year')) matches.push(item);
      });
    } else {
      matches = list;
    }
    return matches;
  };
});