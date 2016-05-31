'use strict';
var api = 'http://api.opensight.cn/api/ivc/v1/';
angular.module('app.controller', [])

.controller('header', [
  '$scope', '$rootScope', '$http', '$timeout',
  function($scope, $rootScope, $http, $timeout) {
    $scope.username = $rootScope.$jwt.get().aud;
    $scope.project = {
      list: []
    };
    $scope.selected = 'default';
    $rootScope.$on('$stateChangeSuccess', function(e, toState, toParams, fromState, fromParams) {
      if ('default' === toState.name) {
        $scope.selected = 'default';
      } else if (undefined !== toParams.project) {
        $scope.selected = toParams.project;
      }
    });
    $scope.url = api + "users/" + $scope.username + '/projects';
    // $scope.url = api + 'projects';

    $scope.logout = function() {
      if (true === confirm('是否退出登录？')) {
        jwt.logout();
      }
    };

    $http.get($scope.url, {}).success(function(response) {
      $scope.project = response;
      $rootScope.project = response;
      $rootScope.$broadcast('projectChangeSuccess', response);
    }).error(function(response, status) {
      console.log('error');
    });
    $rootScope.$on('responseErrorStart', function(rejection) {
      console.log('responseErrorStart');
    });


    $scope.message = {
      bshow: false,
      list: [],
      timer: undefined,
      remove: function(idx) {
        $scope.message.list.splice(idx, 1);
        if (0 === $scope.message.list.length) {
          $scope.message.hide();
        }
      },
      show: function(msg) {
        $scope.message.clear();
        $scope.message.list = [msg];
        $scope.message.bshow = true;
        $scope.message.autohide();
        // $scope.$apply();
      },
      hide: function() {
        $scope.message.list = [];
        $scope.message.bshow = false;
        $scope.message.clear();
        // $scope.$apply();
      },
      clear: function() {
        if (undefined === $scope.message.timer) {
          return;
        }
        $timeout.cancel($scope.message.timer);
        $scope.message.timer = undefined;
      },
      push: function(msg) {
        $scope.message.clear();
        $scope.message.list.push(msg);
        $scope.message.bshow = true;
        $scope.message.autohide();
        // $scope.$apply();
      },
      autohide: function() {
        $scope.message.timer = $timeout(function() {
          $scope.message.timer = undefined;
          $scope.message.hide();
        }, 5000);
      }
    };
    $rootScope.$on('messageShow', function(event, data) {
      console.log('messageShow');
      $scope.message.show(data);
    });
    $rootScope.$on('messageHide', function(event) {
      console.log('messageHide');
      $scope.message.hide();
    });
    $rootScope.$on('messagePush', function(event, data) {
      $scope.message.push(data);
      console.log('messagePush');
    });
  }
])

.controller('project', [
  '$scope', '$rootScope', '$http',
  function($scope, $rootScope, $http) {
    $scope.project = $rootScope.$stateParams.project;
    $scope.boolFalse = false;
    $scope.boolTrue = true;

    $http.get(api + "projects/" + $scope.project, {}).success(function(response) {
      $scope.info = response;
    }).error(function(response, status) {
      console.log('error');
    });

    $scope.save = function() {
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
  }
])

.controller('camera', [
  '$scope', '$rootScope', '$http', '$uibModal', 'flagFactory', 'pageFactory',
  function($scope, $rootScope, $http, $uibModal, flagFactory, pageFactory) {
    $scope.project = $rootScope.$stateParams.project;

    $scope.camera = {
      start: 0,
      total: 10,
      list: []
    };
    $scope.params = {
      filter_key: 'name',
      filter_value: ''
    };
    var query = function(params) {
      $http.get(api + "projects/" + $scope.project + '/cameras', {
        params: params
      }).success(function(response) {
        for (var i = 0, l = response.list.length; i < l; i++) {
          var bitmap = flagFactory.getBitmap(response.list[i].flags, 8);
          var flags = flagFactory.parseCamera(bitmap);
          response.list[i].ability = flags.ability;
          response.list[i].live = flags.live;
          response.list[i].ptz = flags.ptz;
          if (0 !== response.list[i].ability.length) {
            response.list[i].quality = response.list[i].ability[0].text;
          }
        }
        $scope.camera = response;
        pageFactory.set(response, params);
      }).error(function(response, status) {
        console.log('error');
      });
    };
    $scope.page = pageFactory.init({
      query: query,
      jumperror: function() {
        alert('页码输入不正确。');
      }
    });
    $scope.query = function() {
      var params = {
        start: 0,
        limit: $scope.page.limit
      };
      if (undefined !== $scope.params.filter_value && '' !== $scope.params.filter_value) {
        params.filter_key = $scope.params.filter_key;
        params.filter_value = $scope.params.filter_value;
      }
      query(params);
    };

    $scope.enable = function(cam, enabled) {
      var tip = enabled ? '允许直播后可以远程观看直播，是否继续？' : '禁止直播后无法远程观看，同时会停止正在播放的直播，是否继续？';
      if (false === confirm(tip)) {
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
    $scope.select = function(cam, quality) {
      cam.quality = quality;
    };
    $scope.preview = function(cam, format) {
      cam.format = format;
      $scope.cam = cam;
      var modalInstance = $uibModal.open({
        templateUrl: 'sessionModalContent.html',
        controller: 'session',
        size: 'lg',
        resolve: {
          caminfo: function() {
            return $scope.cam;
          }
        }
      });
    };

    $scope.restart = function(camera_id) {
      if (false === confirm('确定重启摄像机？')) {
        return;
      }
      $http.post(api + "projects/" + $scope.project + '/cameras/' + camera_id + '/reboot', {}).success(function(response) {
        $rootScope.$emit('messageShow', { succ: true, text: '重启成功。' });
      }).error(function(response, status) {
        $rootScope.$emit('messageShow', { succ: false, text: '重启失败。' });
      });
    };

    $scope.query();
  }
])

.controller('camera-tab', [
  '$scope', '$rootScope', '$http', 'flagFactory',
  function($scope, $rootScope, $http, flagFactory) {
    $scope.caminfo = {};
  }
])

.controller('camera-detail', [
  '$scope', '$rootScope', '$http', 'flagFactory',
  function($scope, $rootScope, $http, flagFactory) {
    $scope.bFirst = true;
    $scope.bLast = true;
    var project = $rootScope.$stateParams.project;
    $scope.camera = $rootScope.$stateParams.camera;
    var url = api + "projects/" + project + '/cameras/' + $scope.camera;
    var live_ability, preview_ability;

    $http.get(url, {}).success(function(response) {
      $scope.info = response;
      var bitmap = flagFactory.getBitmap(response.flags, 8);
      var flags = flagFactory.parseCamera(bitmap);
      $scope.info.ability = flags.ability;
      $scope.info.live_ability = flags.live;
      live_ability = flags.live;

      $scope.info.ptz_ability = flags.ptz;
      $scope.info.preview_ability = flags.preview;
      preview_ability = flags.preview;
      $scope.$parent.caminfo = $scope.info;
    }).error(function(response, status) {
      console.log('error');
    });

    $scope.save = function() {
      var data = {
        flags: $scope.info.flags,
        desc: $scope.info.desc,
        long_desc: $scope.info.long_desc,
        longitude: $scope.info.longitude,
        latitude: $scope.info.latitude,
        altitude: $scope.info.altitude
      };
      $rootScope.$emit('messageHide');
      $http.put(url, data).success(function(response) {
        console.log('success');
        $rootScope.$emit('messagePush', { succ: true, text: '修改摄像机信息成功。' });
      }).error(function(response, status) {
        console.log('error');
        $rootScope.$emit('messagePush', { succ: false, text: '修改摄像机信息失败。' });
      });
      if (live_ability === $scope.info.live_ability) {
        return;
      }
      var tip = $scope.info.live_ability ? '允许直播后可以远程观看直播，是否继续？' : '禁止直播后无法远程观看，同时会停止正在播放的直播，是否继续？';
      if (false === confirm(tip)) {
        return;
      }
      var data = {
        enable: $scope.info.live_ability
      };
      var text = $scope.info.live_ability ? '禁用' : '启用';
      $http.post(url + '/stream_toggle', data).success(function(response) {
        console.log('success');
        live_ability = $scope.info.live_ability;
        $rootScope.$emit('messagePush', { succ: true, text: text + '直播成功。' });
      }).error(function(response, status) {
        $rootScope.$emit('messagePush', { succ: false, text: text + '直播失败。' });
        console.log('error');
      });
    };
  }
])

.controller('camera-record-plan', [
  '$scope', '$rootScope', '$http', 'flagFactory',
  function($scope, $rootScope, $http, flagFactory) {
    $scope.boolFalse = false;
    $scope.boolTrue = true;
    var project = $rootScope.$stateParams.project;
    $scope.camera = $rootScope.$stateParams.camera;
    var url = api + "projects/" + project + '/cameras/' + $scope.camera + '/record/configure';

    $http.get(url, {}).success(function(response) {
      $scope.info = response;
    }).error(function(response, status) {
      console.log('error');
    });

    $http.get(api + "projects/" + project + '/record/schedules', {}).success(function(response) {
      $scope.schedules = response;
    }).error(function(response, status) {
      $rootScope.$emit('messageShow', { succ: false, text: '获取录像计划失败' });
      console.log('error');
    });

    $scope.save = function() {
      var schedule_id = $scope.info.schedule_id;
      if ('number' !== typeof schedule_id){
        schedule_id = -1;
      }
      var data = {
        stream_quality: $scope.info.stream_quality.toLowerCase(),
        schedule_id: schedule_id,
        record_lifecycle: $scope.info.record_lifecycle
      };
      $rootScope.$emit('messageHide');
      $http.post(url, data).success(function(response) {
        console.log('success');
        $rootScope.$emit('messagePush', { succ: true, text: '修改摄像机录像计划成功。' });
      }).error(function(response, status) {
        console.log('error');
        $rootScope.$emit('messagePush', { succ: false, text: '修改摄像机录像计划失败。' });
      });
    };
  }
])

.controller('camera-replay', [
  '$scope', '$rootScope', '$http', 'flagFactory',
  function($scope, $rootScope, $http, flagFactory) {
    $scope.camname = $rootScope.$stateParams.camname;
    var url = api + "projects/" + $rootScope.$stateParams.project + '/cameras/' + $rootScope.$stateParams.camera + '/record/search';
    $scope.options = {
      minDate: new Date('2016-01-01'),
      showWeeks: false
    };
    $scope.dt = new Date();

    var search = function(){
      var tmp = $scope.dt;
      tmp.setHours(0);
      tmp.setMinutes(0);
      tmp.setSeconds(0);
      tmp.setMilliseconds(0);
      var start = tmp.getTime();
      tmp.setHours(23);
      tmp.setMinutes(59);
      tmp.setSeconds(59);
      tmp.setMilliseconds(999);
      var end = tmp.getTime();
      $scope.recordlist = [];
      $http.get(url, {
        params: {
          start: start,
          end: end,
          seglength: 60
        }
      }).success(function(response) {
        $scope.record = response;
      }).error(function(response, status) {
        $rootScope.$emit('messageShow', { succ: false, text: '查询录像失败。' });
        console.log('error');
      });
    };
    $scope.play = function(it){
      if ('' === document.createElement('video').canPlayType('application/x-mpegURL')) {
        loadFlash(it.hls);
      } else {
        addVideoTag(it.hls);
      }
    };
    var loadFlash = function(hls) {
      var flashvars = {
        // src: 'http://www.opensight.cn/hls/camera1.m3u8',
        src: hls,
        plugin_hls: "../flashlsOSMF.swf",
        // scaleMode: 'none',
        autoPlay: true
      };

      var params = {
        allowFullScreen: true,
        allowScriptAccess: "always",
        wmode: 'opaque',
        bgcolor: "#000000"
      };
      var attrs = {
        name: "replayPlayer"
      };

      swfobject.embedSWF("../GrindPlayer.swf", "replayPlayer", "100%", "100%", "10.2", null, flashvars, params, attrs);
    };
    var addVideoTag = function(info) {};
    $scope.$watch('dt', search);
  }
])

.controller('schedule', [
  '$scope', '$rootScope', '$http', '$uibModal', 'flagFactory',
  function($scope, $rootScope, $http, $uibModal, flagFactory, pageFactory) {
    $scope.project = $rootScope.$stateParams.project;
    var url = api + "projects/" + $scope.project + '/record/schedules';

    $scope.query = function() {
      $http.get(url, {}).success(function(response) {
        $scope.schedules = response;
      }).error(function(response, status) {
        $rootScope.$emit('messageShow', { succ: false, text: '获取录像计划失败' });
        console.log('error');
      });
    };

    $scope.remove = function(item, index){
      if (false === confirm('确认删除录像计划模板 "' +   item.name + '" 吗？')){
        return;
      }
      $http.delete(url + '/' + item.id, {}).success(function(response) {
        $scope.schedules.list.splice(index, 1);
        $rootScope.$emit('messageShow', { succ: true, text: '删除录像模板成功。' });
      }).error(function(response, status) {
        $rootScope.$emit('messageShow', { succ: true, text: '删除录像模板失败。' });
        console.log('error');
      });
    };

    $scope.query();
  }
])

.controller('add-schedule', [
  '$scope', '$rootScope', '$http',
  function($scope, $rootScope, $http) {
    var url = api + "projects/" + $rootScope.$stateParams.project + '/record/schedules';

    $scope.boolFalse = false;
    $scope.boolTrue = true;
    $scope.datepicker = [];
    $scope.timepicker = [];
    $scope.info = {
      name: '',
      desc: '',
      long_desc: '',
      entries:[]
    };
    $scope.typechange = function(type) {
      $scope.type = type;
      $scope.info.entries = [];
      var l = 'weekday' === type ? 7 : 31;
      for (var i = 1; i <= l; i++){
        $scope.addItem(i);
      }
    };

    $scope.weekdays = [
      {name: '请选择星期', value: 0},
      {name: '星期一', value: 1},
      {name: '星期二', value: 2},
      {name: '星期三', value: 3},
      {name: '星期四', value: 4},
      {name: '星期五', value: 5},
      {name: '星期六', value: 6},
      {name: '星期天', value: 7}
    ];
    $scope.monthdays = [
      {name: '请选择日期', value: 0}
    ];
    for (var i = 1; i < 32; i++){
      $scope.monthdays.push({name: i + '日', value: i});
    }

    $scope.addItem = function(idx){
      idx = idx || 1;
      var it = {
        date: '',
        weekday: idx,
        monthday: idx,
        start: '00:00:00',
        end: '23:59:59',
        prerecord: true
      };
      if ('weekday' !== $scope.type){
        it.weekday = 0;
      } else {
        it.monthday = 0;
      }
      var s = new Date();
      

      $scope.info.entries.push(it);
      $scope.datepicker.push(false);

      var t = {
        start: new Date(),
        end: new Date()
      };
      t.start.setHours(0);
      t.start.setMinutes(0);
      t.start.setSeconds(0);
      t.end.setHours(23);
      t.end.setMinutes(59);
      t.end.setSeconds(59);
      $scope.timepicker.push(t);
    };

    $scope.removeItem = function(it, index){
      // if (false ==== confirm('确定要删除此条记录？')){
      //   return;
      // }
      $scope.info.entries.splice(index, 1);
      $scope.datepicker.splice(index, 1);
      $scope.timepicker.splice(index, 1);
    };

    $scope.timechange = function(index, key){
      var d = $scope.timepicker[index][key];
      $scope.info.entries[index][key] = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
    };

    $scope.add = function() {
      $http.post(url, $scope.info).success(function(response) {
        $rootScope.$emit('messageShow', { succ: true, text: '添加成功。' });
        $scope.typechange('weekday');
      }).error(function(response, status) {
        $rootScope.$emit('messageShow', { succ: false, text: '添加失败。' });
        console.log('error');
      });
    };
    $scope.typechange('weekday');
  }
])

.controller('schedule-detail', [
  '$scope', '$rootScope', '$http',
  function($scope, $rootScope, $http) {
    var url = api + "projects/" + $rootScope.$stateParams.project + '/record/schedules/' + $rootScope.$stateParams.schedule;
    
    $scope.boolFalse = false;
    $scope.boolTrue = true;
    $scope.datepicker = [];
    $scope.timepicker = [];
    $scope.info = {
      name: '',
      desc: '',
      long_desc: '',
      entries:[]
    };
    $scope.type = 'weekday';
    $scope.typechange = function(type) {
      $scope.type = type;
      $scope.info.entries = [];
      var l = 'weekday' === type ? 7 : 31;
      for (var i = 1; i <= l; i++){
        $scope.addItem(i);
      }
    };

    $scope.weekdays = [
      {name: '请选择星期', value: 0},
      {name: '星期一', value: 1},
      {name: '星期二', value: 2},
      {name: '星期三', value: 3},
      {name: '星期四', value: 4},
      {name: '星期五', value: 5},
      {name: '星期六', value: 6},
      {name: '星期天', value: 7}
    ];
    $scope.monthdays = [
      {name: '请选择日期', value: 0}
    ];
    for (var i = 1; i < 32; i++){
      $scope.monthdays.push({name: i + '日', value: i});
    }

    $scope.addItem = function(idx){
      idx = idx || 1;
      var it = {
        date: '',
        weekday: idx,
        monthday: idx,
        start: '00:00:00',
        end: '23:59:59',
        prerecord: true
      };
      if ('weekday' !== $scope.type){
        it.weekday = 0;
      } else {
        it.monthday = 0;
      }
      var s = new Date();
      

      $scope.info.entries.push(it);
      $scope.datepicker.push(false);

      var t = {
        start: new Date(),
        end: new Date()
      };
      t.start.setHours(0);
      t.start.setMinutes(0);
      t.start.setSeconds(0);
      t.end.setHours(23);
      t.end.setMinutes(59);
      t.end.setSeconds(59);
      $scope.timepicker.push(t);
    };

    $scope.removeItem = function(it, index){
      // if (false ==== confirm('确定要删除此条记录？')){
      //   return;
      // }
      $scope.info.entries.splice(index, 1);
      $scope.datepicker.splice(index, 1);
      $scope.timepicker.splice(index, 1);
    };

    $scope.timechange = function(index, key){
      var d = $scope.timepicker[index][key];
      $scope.info.entries[index][key] = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
    };

    $scope.modify = function() {
      $http.post(url, $scope.info).success(function(response) {
        $rootScope.$emit('messageShow', { succ: true, text: '修改录像计划模板成功。' });
        // $scope.typechange('weekday');
      }).error(function(response, status) {
        $rootScope.$emit('messageShow', { succ: false, text: '修改录像计划模板失败。' });
        console.log('error');
      });
    };

    (function(){
      $http.get(url, {}).success(function(response) {
        $scope.info = response;
        if (response.entries.length !== 0 && 
            (0 === response.entries[0].weekday || null === response.entries[0].weekday)){
          $scope.type = 'monthday';
        }
      }).error(function(response, status) {
        $rootScope.$emit('messageShow', { succ: false, text: '获取信息失败。' });
        console.log('error');
      });
    })();
  }
])

.controller('log', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
  $scope.project = $rootScope.$stateParams.project;
  $scope.list = [];
  $scope.start = {
    dt: new Date(),
    opened: false
  };
  $scope.end = {
    dt: new Date(),
    opened: false
  };
  $scope.params = { limit: 100 };
  $scope.bFirst = true;
  $scope.bLast = true;
  $scope.open = function(opts) {
    opts.opened = true;
  };
  $scope.query = function(opts) {
    $scope.params.start_from = format($scope.start.dt) + 'T00:00:00';
    $scope.params.end_to = format($scope.end.dt) + 'T23:59:59';
    $scope.params.reverse = false;
    $scope.params.last_end_time = undefined;
    $scope.params.last_session_id = undefined;
    $scope.bFirst = true;

    get($scope.params, function() {
      $scope.bLast = true;
    });
    $scope.bLast = false;
  };

  $scope.next = function() {
    $scope.params.reverse = false;
    $scope.params.last_end_time = $scope.list[$scope.list.length - 1].end;;
    $scope.params.last_session_id = $scope.list[$scope.list.length - 1].uuid;
    get($scope.params, function() {
      $scope.bLast = true;
    });
    $scope.bFirst = false;
  };
  $scope.prev = function() {
    $scope.params.reverse = true;
    $scope.params.last_end_time = $scope.list[0].end;;
    $scope.params.last_session_id = $scope.list[0].uuid;
    get($scope.params, function() {
      $scope.bFirst = true;
    });
    $scope.bLast = false;
  };

  var get = function(params, fn) {
    $http({
      url: api + "projects/" + $scope.project + '/session_logs',
      method: "GET",
      params: params
    }).success(function(response) {
      $scope.list = response.list;
      if (response.list.length !== params.limit) {
        fn();
      }
    }).error(function(response, status) {
      console.log('error');
    });
  };
  var format = function(dt) {
    return [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()].join('-');
  };
}])

.controller('default', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
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
}])

.controller('user-info', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
  $scope.username = $rootScope.$jwt.get().aud;

  $http.get(api + "users/" + $scope.username, {}).success(function(response) {
    $scope.info = response;
  }).error(function(response, status) {
    console.log('error');
  });
}])

.controller('user-passwd', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
  $scope.username = $rootScope.$jwt.get().aud;
  $scope.old_password = '';
  $scope.new_password = '';
  $scope.repeat_password = '';

  $scope.save = function() {
    if ($scope.new_password !== $scope.repeat_password) {
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
}])

.controller('key', [
  '$scope', '$rootScope', '$http', '$uibModal', 'pageFactory',
  function($scope, $rootScope, $http, $uibModal, pageFactory) {
    $scope.username = $rootScope.$jwt.get().aud;
    $scope.url = api + "users/" + $scope.username + '/access_keys';

    var query = function(params) {
      $http.get($scope.url, {
        params: params
      }).success(function(response) {
        $scope.keys = response;
        pageFactory.set(response, params);
      }).error(function(response, status) {
        console.log('error');
      });
    };

    $scope.page = pageFactory.init({
      query: query,
      jumperror: function() {
        alert('页码输入不正确。');
      }
    });

    $scope.query = function() {
      query({
        start: 0,
        limit: $scope.page.limit
      });
    };

    $scope.open = function(key_id) {
      $scope.key_id = key_id;
      var modalInstance = $uibModal.open({
        templateUrl: 'secretModalContent.html',
        controller: 'secret',
        resolve: {
          access_key: function() {
            return $scope.key_id;
          }
        }
      });
    };
    $scope.del = function(key_id) {
      if (false === confirm('是否删除密匙？')) {
        return;
      }
      $http.delete(api + 'access_keys/' + key_id, {}).success(function(response) {
        $scope.query();
        alert('删除成功。');
      }).error(function(response, status) {
        alert('删除失败。');
        console.log('error');
      });
    };

    $scope.query();
  }
])

.controller('add-key', ['$scope', '$rootScope', '$http', '$uibModal', function($scope, $rootScope, $http, $uibModal) {
  $scope.username = $rootScope.$jwt.get().aud;
  $scope.url = api + "users/" + $scope.username + '/access_keys';
  $scope.boolFalse = false;
  $scope.boolTrue = true;
  $scope.number0 = 0;
  $scope.number1 = 1;

  var init = function() {
    $scope.info = {
      key_type: 0,
      enabled: true,
      desc: ''
    };
  };
  init();

  $scope.add = function() {
    $http.post($scope.url, $scope.info).success(function(response) {
      alert('添加成功。');
      init();
    }).error(function(response, status) {
      alert('添加失败。');
      console.log('error');
    });
  };
}])

.controller('key-detail', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
  $scope.key = $rootScope.$stateParams.key;
  $scope.boolFalse = false;
  $scope.boolTrue = true;
  var url = api + 'access_keys/' + $scope.key;

  $http.get(url, {}).success(function(response) {
    $scope.info = response;
  }).error(function(response, status) {
    console.log('error');
  });

  $scope.save = function() {
    var data = {
      enabled: $scope.info.enabled,
      desc: $scope.info.desc
    };
    $http.put(url, data).success(function(response) {
      console.log('success');
    }).error(function(response, status) {
      console.log('error');
    });
  };
}])

.controller('secret', ['$scope', '$rootScope', '$http', '$uibModalInstance', 'access_key', function($scope, $rootScope, $http, $uibModalInstance, access_key) {
  $scope.username = $rootScope.$jwt.get().aud;
  $scope.url = api + 'access_keys/' + access_key + '/secret';

  $http.get($scope.url, {}).success(function(response) {
    $scope.secret = response.secret;
  }).error(function(response, status) {
    console.log('error');
  });
  $scope.ok = function() {
    $uibModalInstance.close();
  };
}])

.controller('session', ['$scope', '$rootScope', '$http', '$uibModalInstance', '$timeout', '$interval', 'caminfo',
  function($scope, $rootScope, $http, $uibModalInstance, $timeout, $interval, caminfo) {
    $scope.cam = caminfo;
    $scope.sec = 10;

    var user = $rootScope.$jwt.get().aud;
    var project = $rootScope.$stateParams.project;
    var url = api + 'projects/' + project + '/cameras/' + caminfo.uuid + '/sessions';
    var tiptimer = undefined;
    var alivetimer = undefined;

    var create = function() {
      $http.post(url, { format: caminfo.format.toLowerCase(), quality: caminfo.quality.toLowerCase(), create: true, user: user }).success(function(response) {
        $scope.id = response.session_id;
        if ('' === document.createElement('video').canPlayType('application/x-mpegURL')) {
          loadFlash(response);
        } else {
          addVideoTag(response);
        }
        keepalive(response);
        if (tiptimer) {
          $interval.cancel(tiptimer);
          tiptimer = undefined;
        }
      }).error(function(response, status) {
        console.log('error');
      });
    };
    var loadFlash = function(info) {
      var flashvars = {
        // src: 'http://www.opensight.cn/hls/camera1.m3u8',
        src: info.url,
        plugin_hls: "../flashlsOSMF.swf",
        // scaleMode: 'none',
        autoPlay: true
      };

      var params = {
        allowFullScreen: true,
        allowScriptAccess: "always",
        wmode: 'opaque',
        bgcolor: "#000000"
      };
      var attrs = {
        name: "videoPlayer"
      };

      swfobject.embedSWF("../GrindPlayer.swf", "videoPlayer", "100%", "100%", "10.2", null, flashvars, params, attrs);
    };
    var addVideoTag = function(info) {};
    var keepalive = function(info) {
      if (undefined !== alivetimer) {
        $interval.cancel(alivetimer);
        alivetimer = undefined;
      }
      var count = 1440;
      alivetimer = $interval(function() {
        if (0 === count) {
          stop();
          return;
        } else {
          count--;
        }
        $http.post(url + '/' + info.session_id, {}).success(function(response) {

        }).error(function(response, status) {
          console.log('error');
        });
      }, 30000);
    };
    var stop = function() {
      if (undefined !== alivetimer) {
        $interval.cancel(alivetimer);
        alivetimer = undefined;
      }
      if (undefined === $scope.id) {
        return;
      }
      $http.delete(url + '/' + $scope.id, {});
    };
    var updateTip = function() {
      tiptimer = $interval(function() {
        if (1 === $scope.sec && undefined !== tiptimer) {
          $interval.cancel(tiptimer);
          tiptimer = undefined;
          return;
        }
        $scope.sec--;
        // $scope.$apply();
      }, 1000);
    };

    $scope.speed = 50;
    $scope.options = {
      from: 0,
      to: 100,
      step: 10,
      dimension: ''
    };
    var moving = false;
    $scope.ptzmouseout = function() {
      if (false === moving) {
        return
      }
      $scope.ptzStop('stop');
    };
    $scope.ptzStart = function(op) {
      if (true === moving) {
        return;
      }
      ptz(op);
      moving = true;
    };
    $scope.ptzStop = function() {
      // alert(op);
      ptz('stop');
      moving = false;
    };
    var ptz = function(op) {
      var url = api + 'projects/' + project + '/cameras/' + caminfo.uuid + '/ptz/op';
      $http.post(url, { op: op, value: parseInt($scope.speed, 10) }).success(function(response) {}).error(function(response, status) {
        console.log('error');
      });
    };

    (function() {
      var list = {};
      $scope.selected = 'preset';

      var init = function(list) {
        $scope.ptzlist = list;
        if (0 !== $scope.ptzlist.length) {
          $scope.token = $scope.ptzlist[0].token;
        } else {
          $scope.token = undefined;
        }
      };
      $scope.ptzchange = function() {
        $scope.token = undefined;
        if ('patrol' === $scope.selected) {
          return;
        } else if (undefined !== list[$scope.selected]) {
          init(list[$scope.selected]);
          return;
        }
        var url = api + 'projects/' + project + '/cameras/' + caminfo.uuid + '/ptz/' + $scope.selected;
        $http.get(url, {}).success(function(response) {
          list[$scope.selected] = response;
          init(response);
        }).error(function(response, status) {
          console.log('error');
        });
      };

      $scope.cruise = function(op) {
        var url = api + 'projects/' + project + '/cameras/' + caminfo.uuid + '/ptz/' + $scope.selected;
        if ('patrol' === $scope.selected) {
          url += '/op';
        } else {
          url += '/' + $scope.token + '/op';
        }
        var params = { op: op };
        if ('preset' === $scope.selected) {
          params = {};
        }
        $http.post(url, params).success(function(response) {}).error(function(response, status) {
          console.log('error');
        });
      };
      if (true === $scope.cam.ptz) {
        $scope.ptzchange();
      }
    })();


    create();
    updateTip();
    $scope.ok = function() {
      stop();
      $uibModalInstance.close();
    };
  }
])

.controller('user', [
  '$scope', '$rootScope', '$http', 'pageFactory',
  function($scope, $rootScope, $http, pageFactory) {
    var pro = $rootScope.$stateParams.project;

    $scope.users = {
      start: 0,
      total: 10,
      list: []
    };
    $scope.params = {
      filter_key: 'username',
      filter_value: ''
    };

    var query = function(params) {
      $http.get(api + "projects/" + pro + '/users', {
        params: params
      }).success(function(response) {
        $scope.users = response;
        pageFactory.set(response, params);
      }).error(function(response, status) {
        console.log('error');
      });
    };
    $scope.page = pageFactory.init({
      query: query,
      jumperror: function() {
        alert('页码输入不正确。');
      }
    });
    $scope.query = function() {
      var params = {
        start: 0,
        limit: $scope.page.limit
      };
      if (undefined !== $scope.params.filter_value && '' !== $scope.params.filter_value) {
        params.filter_key = $scope.params.filter_key;
        params.filter_value = $scope.params.filter_value;
      }
      query(params);
    };

    $scope.query();
  }
])

.controller('session-status', [
  '$scope', '$rootScope', '$http', 'pageFactory',
  function($scope, $rootScope, $http, pageFactory) {
    var pro = $rootScope.$stateParams.project;

    $scope.sessions = {
      start: 0,
      total: 10,
      list: []
    };
    var query = function(params) {
      $http.get(api + "projects/" + pro + '/sessions', {
        params: params
      }).success(function(response) {
        $scope.sessions = response;
        pageFactory.set(response, params);
      }).error(function(response, status) {
        console.log('error');
      });
    };
    $scope.page = pageFactory.init({
      query: query,
      jumperror: function() {
        alert('页码输入不正确。');
      }
    });
    $scope.query = function() {
      var params = {
        start: 0,
        limit: $scope.page.limit
      };
      query(params);
    };
    $scope.query();
  }
])

.controller('bill', [
  '$scope', '$rootScope', '$http', 'dateFactory', 'pageFactory',
  function($scope, $rootScope, $http, dateFactory, pageFactory) {
    var pro = $rootScope.$stateParams.project;

    $scope.start = {
      dt: new Date(),
      opened: false
    };
    $scope.end = {
      dt: new Date(),
      opened: false
    };
    $scope.open = function(opts) {
      opts.opened = true;
    };
    $scope.bills = {
      start: 0,
      total: 10,
      list: []
    };

    var query = function(params) {
      $http.get(api + "projects/" + pro + '/bills', {
        params: params
      }).success(function(response) {
        $scope.bills = response;
        pageFactory.set(response, params);
      }).error(function(response, status) {
        console.log('error');
      });
    };
    $scope.page = pageFactory.init({
      query: query,
      jumperror: function() {
        alert('页码输入不正确。');
      }
    });

    $scope.query = function() {
      var params = {
        start_from: dateFactory.getStart($scope.start.dt),
        end_to: dateFactory.getEnd($scope.end.dt),
        start: 0,
        limit: $scope.page.limit
      };
      query(params);
    };

    (function() {
      $http.get(api + "projects/" + pro + '/account', {}).success(function(response) {
        $scope.account = response;
      }).error(function(response, status) {
        console.log('error');
      });
    })();

    $scope.query();
  }
]);
