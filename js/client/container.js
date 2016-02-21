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
  $scope.url = api + "users/" + $scope.username + '/projects';
  $scope.url = api + 'projects';

  $http.get($scope.url, {}).success(function(response) {
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
}]).controller('camera', ['$scope', '$rootScope', '$http', '$uibModal', function ($scope, $rootScope, $http, $uibModal) {
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

    return {
      live: 0 === m[5],
      ability: t
    };
  };

  $scope.project = $rootScope.$stateParams.project;
  $scope.camera = {list:[]};


  $http.get(api + "projects/" + $scope.project + '/cameras', {}).success(function(response) {
    for (var i = 0, l = response.list.length; i < l; i++){
      var flags = parse(response.list[i].flags);
      response.list[i].ability = flags.ability;
      response.list[i].live = flags.live;
    }
    $scope.camera = response;

  }).error(function(response, status) {
    console.log('error');
  });

  $scope.enable = function(cam, enabled){
    var tip = enabled ? '允许直播后可以远程观看直播，是否继续？' : '禁止直播后无法远程观看，同时会停止正在播放的直播，是否继续？';
    if (false === confirm(tip)){
      return false;
    }
    var data = {
      enable: enabled
    };
    $http.post(api + "projects/" + $scope.project + '/cameras/' + cam.uuid + '/stream_toggle', data).success(function(response) {
      console.log('success');
      cam.live = enabled;
    }).error(function(response, status) {
      console.log('error');
    });
  };
  $scope.preview = function(cam, quality){
    $scope.cam = cam;
    $scope.quality = quality;
    var modalInstance = $uibModal.open({
      templateUrl: 'sessionModalContent.html',
      controller: 'session',
      resolve: {
        caminfo: function () {
          return {cam: $scope.cam, quality: $scope.quality};
        }
      }
    });
  };
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
      altitude: $scope.info.altitude
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
}]).controller('user-info', ['$scope', '$rootScope', '$http',function ($scope, $rootScope, $http) {
  $scope.username = $rootScope.$jwt.get().aud;

  $http.get(api + "users/" + $scope.username, {}).success(function(response) {
    $scope.info = response;
  }).error(function(response, status) {
    console.log('error');
  });
}]).controller('user-passwd', ['$scope', '$rootScope', '$http',function ($scope, $rootScope, $http) {
  $scope.username = $rootScope.$jwt.get().aud;
  $scope.old_password = '';
  $scope.new_password = '';
  $scope.repeat_password = '';

  $scope.save = function(){
    if ($scope.new_password !== $scope.repeat_password){
      alert('确认密码输入不一致');
      return false;
    }
    var data = {
      old_password: $scope.old_password,
      new_password: $scope.new_password
    }
    $http.put(api + "users/" + $scope.username + '/password', data).success(function(response) {
      console.log('success');
    }).error(function(response, status) {
      console.log('error');
    });
  };
}]).controller('key', ['$scope', '$rootScope', '$http', '$uibModal', function ($scope, $rootScope, $http, $uibModal) {
  $scope.username = $rootScope.$jwt.get().aud;
  $scope.url = api + "users/" + $scope.username + '/access_keys';

  $http.get($scope.url, {}).success(function(response) {
    $scope.keys = response;
  }).error(function(response, status) {
    console.log('error');
  });

  $scope.open = function(key_id){
    $scope.key_id = key_id;
    var modalInstance = $uibModal.open({
      templateUrl: 'secretModalContent.html',
      controller: 'secret',
      resolve: {
        access_key: function () {
          return $scope.key_id;
        }
      }
    });
  };
}]).controller('secret', ['$scope', '$rootScope', '$http', '$uibModalInstance', 'access_key', function ($scope, $rootScope, $http, $uibModalInstance, access_key) {
  $scope.username = $rootScope.$jwt.get().aud;
  $scope.url = api + 'access_keys/' + access_key + '/secret';

  $http.get($scope.url, {}).success(function(response) {
    $scope.secret = response.secret;
  }).error(function(response, status) {
    console.log('error');
  });
  $scope.ok = function(){
    $uibModalInstance.close();
  };
}]).controller('session', ['$scope', '$rootScope', '$http', '$uibModalInstance', 'caminfo', function ($scope, $rootScope, $http, $uibModalInstance, caminfo) {
  $scope.username = $rootScope.$jwt.get().aud;
  $scope.project = $rootScope.$stateParams.project;
  $scope.cam = caminfo.cam;
  $scope.quality = caminfo.quality;
  $scope.url = api + 'projects/' + $scope.project + '/cameras/' + caminfo.cam.uuid + '/sessions';
  

  $http.get($scope.url, {}).success(function(response) {
    $scope.secret = response.secret;
  }).error(function(response, status) {
    console.log('error');
  });
  $scope.ok = function(){
    $uibModalInstance.close();
  };
}]);
