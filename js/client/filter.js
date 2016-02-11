'use strict';

angular.module('app.filter', []).filter('online', [function() {
  return function(is_online) {
    if (1 === is_online){
      return '在线';
    } else if (2 === is_online){
      return '直播中';
    } else {
      return '离线';
    }
  };
}]).filter('publicattribute', [function() {
  return function(bBublic) {
    if (true === bBublic){
      return '公开';
    } else {
      return '私有';
    }
  };
}]);