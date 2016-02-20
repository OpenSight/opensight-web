'use strict';
var api = 'http://121.41.72.231:5001/api/ivc/v1/';
angular.module('app.controller', []).controller('header', ['$scope', '$rootScope', '$http',function ($scope, $rootScope, $http) {
  $scope.username = $rootScope.$jwt.get().aud;
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
    $rootScope.project = response;
    $rootScope.$broadcast('projectChangeSuccess', response);
  }).error(function(response, status) {
    console.log('error');
  });
  $scope.$on('responseErrorStart', function(rejection) {
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
  var getBitmap = function(f, bits) {
    var t = [];
    var i = 0;
    do {
      t[i] = f % 2;
      f = Math.floor(f / 2);
      i++;
    } while (f > 0);
    while (i < bits) {
      t[i] = 0;
      i++;
    }
    return t;
  };
  var parse = function(flags){
    var m = getBitmap(flags, 8);
    var ab = [{
      text: 'LD',
      title: '流畅',
      cls: '',
      idx: 0
    }, {
      text: 'SD',
      title: '标清',
      cls: '',
      idx: 1
    }, {
      text: 'HD',
      title: '高清',
      cls: '',
      idx: 2
    }, {
      text: 'FHD',
      title: '超清',
      cls: '',
      idx: 3
    }];
    var t = [];
    for (var i = 0, l = ab.length; i < l; i++){
      if (1 === m[ab[i].idx]){
        t.push(ab[i]);
      }
    }
    return t;
  };

  $scope.project = $rootScope.$stateParams.project;
  $scope.camera = {list:[]};


  $http.get(api + "projects/" + $scope.project + '/cameras', {}).success(function(response) {
    for (var i = 0, l = response.list.length; i < l; i++){
      response.list[i].ability = parse(response.list[i].flags);
    }
    $scope.camera = response;

  }).error(function(response, status) {
    console.log('error');
  });
}]).controller('camera-detail', ['$scope', '$rootScope', '$http',function ($scope, $rootScope, $http) {
  $scope.project = $rootScope.$stateParams.project;
  $scope.camera = $rootScope.$stateParams.camera;
  $scope.url = api + "projects/" + $scope.project + '/cameras/' + $scope.camera;

  $http.get($scope.url, {
  }).success(function(response) {
    $scope.info = response;
  }).error(function(response, status) {
    console.log('error');
  });

  $scope.save = function(){
    var data = {
      flags: $scope.info.flags,
      desc: $scope.info.desc,
      long_desc: $scope.info.long_desc,
      longitude: $scope.info.longitude,
      latitude: $scope.info.latitude,
      altitude: $scope.info.altitude,
      Authorization: $scope.info.Authorization,
    };
    $http.put($scope.url, data).success(function(response) {
      console.log('success');
    }).error(function(response, status) {
      console.log('error');
    });
  };
}]).controller('log', ['$scope', '$rootScope', '$http',function ($scope, $rootScope, $http) {
  $scope.project = $rootScope.$stateParams.project;
  $scope.log = {list:[]};
  $scope.params = {
    start_from: '2000-01-01T00:00:00',
    end_to: '2055-01-01T00:00:00',
    limit: 100
  };
  $scope.last = $scope.params;
  $scope.index = 0;
  $scope.next = function(){
    $scope.index++;
    get($scope.params);
  };
  $scope.prev = function(){
    $scope.index--;
    get($scope.params);
  };

  var get = function(params){
    $http({
      url: api + "projects/" + $scope.project + '/session_logs', 
      method: "GET",
      params: params
    }).success(function(response) {
      $scope.log = response;
      if (response.list.length === $scope.params.limit){
        $scope.params.last_end_time = response.list[response.list.length - 1].end;
        $scope.params.last_session_id = response.list[response.list.length - 1].uuid;
      }
    }).error(function(response, status) {
      console.log('error');
    });
  };
  get($scope.params);
}]).controller('default', ['$scope', '$rootScope', '$http',function ($scope, $rootScope, $http) {
  $scope.username = $rootScope.$jwt.get().aud;
  $scope.project = $rootScope.project;

  $http.get(api + "users/" + $scope.username, {}).success(function(response) {
    $scope.userinfo = response;
  }).error(function(response, status) {
    console.log('error');
  });
  $scope.$on('projectChangeSuccess', function(event, data) {
    $scope.project = data;
    console.log('projectChangeSuccess');
  });
}]).controller('user', ['$scope', '$rootScope', '$http',function ($scope, $rootScope, $http) {
  $scope.username = $rootScope.$jwt.get().aud;

  $http.get(api + "users/" + $scope.username, {}).success(function(response) {
    $scope.info = response;
  }).error(function(response, status) {
    console.log('error');
  });
}]);
