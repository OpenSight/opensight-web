'use strict';
var api = 'http://121.41.72.231:5001/api/ivc/v1/';
angular.module('app.controller', []).controller('header', ['$scope', '$rootScope', '$http',function ($scope, $rootScope, $http) {
  $scope.username = 'boss';
  $scope.project = {
    list: []
  };
  $scope.selected = 'default';
  $rootScope.$on('$stateChangeSuccess', function(e, toState, toParams, fromState, fromParams) {
    if ('default' === toState.name){
      $scope.selected = 'default';
    } else if (undefined !== toParams.project){
      $scope.selected = toParams.project;
    }
  });

  $http.get(api + "projects", {}).success(function(response) {
    $scope.project = response;
  }).error(function(response, status) {
    console.log('error');
  });
  $scope.$on('responseErrorStart', function(rejection, response, status) {
    console.log('responseErrorStart');
  });
}]).controller('project', ['$scope', '$rootScope', '$http',function ($scope, $rootScope, $http) {
  $scope.project = $rootScope.$stateParams.project;
  $scope.boolFalse = false;
  $scope.boolTrue = true;

  $http.get(api + "projects/" + $scope.project, {
  }).success(function(response) {
    $scope.info = response;
  }).error(function(response, status) {
    console.log('error');
  });

  $scope.save = function(){
    var data = {
      title: $scope.info.title,
      media_server: $scope.info.media_server,
      is_public: $scope.info.is_public,
      desc: $scope.info.desc,
      long_desc: $scope.info.long_desc,
    };
    $http.put(api + "projects/" + $scope.project, data).success(function(response) {
      console.log('success');
    }).error(function(response, status) {
      console.log('error');
    });
  };
}]).controller('camera', ['$scope', '$rootScope', '$http',function ($scope, $rootScope, $http) {
  $scope.project = $rootScope.$stateParams.project;
  $scope.camera = {list:[]};

  $http.get(api + "projects/" + $scope.project + '/cameras', {}).success(function(response) {
    $scope.camera = response;
  }).error(function(response, status) {
    console.log('error');
  });
}]).controller('log', ['$scope', '$rootScope', '$http',function ($scope, $rootScope, $http) {
  $scope.project = $rootScope.$stateParams.project;
  $scope.log = {list:[]};

  $http.get(api + "projects/" + $scope.project + '/session_logs', {}).success(function(response) {
    $scope.log = response;
  }).error(function(response, status) {
    console.log('error');
  });
}]);
