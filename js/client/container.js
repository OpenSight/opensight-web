'use strict';
angular.module('app.controller', []).controller('header', ['$scope', '$rootScope', function ($rootScope, $scope) {
  $scope.username = 'boss';
  $scope.project = {
    list: [{name: 'p1'}, {name: 'p2'}, {name: 'p3'}]
  };
  $scope.selected = 'default';
  $rootScope.$on('$stateChangeSuccess', function(e, toState, toParams, fromState, fromParams) {
    console.log(toState);
    if ('default' === toState.name){
      $scope.selected = 'default';
    } else if (undefined !== toParams.project){
      $scope.selected = toParams.project;
    }
  });
}]);
