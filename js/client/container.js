'use strict';
angular.module('app.controller', []).controller('header', ['$scope', '$rootScope', '$http',function ($scope, $rootScope, $http) {
  $scope.username = 'boss';
  $scope.project = {
    list: [{name: 'p1'}, {name: 'p2'}, {name: 'p3'}]
  };
  $scope.selected = 'default';
  $rootScope.$on('$stateChangeSuccess', function(e, toState, toParams, fromState, fromParams) {
    if ('default' === toState.name){
      $scope.selected = 'default';
    } else if (undefined !== toParams.project){
      $scope.selected = toParams.project;
    }
  });

  $http.get("http://121.41.72.231:5001/api/ivc/v1/projects", {
  }).success(function(response) {
    console.log('success');
  }).error(function(response, status) {
    console.log('error');
  });
  $scope.$on('responseErrorStart', function(rejection, response, status){
    console.log('responseErrorStart');
  });
}]);
