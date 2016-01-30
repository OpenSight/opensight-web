'use strict';
angular.module('app.controller', []).controller('header', ['$scope', '$rootScope', function ($rootScope, $scope) {
  $scope.username = 'boss';
  $scope.project = {
    list: [{name: 'p1'}, {name: 'p2'}, {name: 'p3'}]
  };
  $scope.selected = 'default';
  console.log($rootScope.$stateParams);
  console.log($rootScope.$state);
}]);
