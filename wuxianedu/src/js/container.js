'use strict';
var api = api || 'http://api.opensight.cn/api/ivc/v1/';
angular.module('app.controller', [])

.controller('header', [
  '$scope', '$rootScope', '$http', '$timeout',
  function ($scope, $rootScope, $http, $timeout) {
    $rootScope.$on('responseErrorStart', function (rejection) {
      console.log('responseErrorStart');
    });

    $scope.message = {
      bshow: false,
      list: [],
      timer: undefined,
      remove: function (idx) {
        $scope.message.list.splice(idx, 1);
        if (0 === $scope.message.list.length) {
          $scope.message.hide();
        }
      },
      show: function (msg) {
        $scope.message.clear();
        $scope.message.list = [msg];
        $scope.message.bshow = true;
        $scope.message.autohide();
        // $scope.$apply();
      },
      hide: function () {
        $scope.message.list = [];
        $scope.message.bshow = false;
        $scope.message.clear();
        // $scope.$apply();
      },
      clear: function () {
        if (undefined === $scope.message.timer) {
          return;
        }
        $timeout.cancel($scope.message.timer);
        $scope.message.timer = undefined;
      },
      push: function (msg) {
        $scope.message.clear();
        $scope.message.list.push(msg);
        $scope.message.bshow = true;
        $scope.message.autohide();
        // $scope.$apply();
      },
      autohide: function () {
        $scope.message.timer = $timeout(function () {
          $scope.message.timer = undefined;
          $scope.message.hide();
        }, 5000);
      }
    };
    $rootScope.$on('messageShow', function (event, data) {
      console.log('messageShow');
      $scope.message.show(data);
    });
    $rootScope.$on('messageHide', function (event) {
      console.log('messageHide');
      $scope.message.hide();
    });
    $rootScope.$on('messagePush', function (event, data) {
      $scope.message.push(data);
      console.log('messagePush');
    });
  }
])

.controller('config', [
  '$scope', '$rootScope', '$http',
  function ($scope, $rootScope) {
    $scope.classroom = config.get('classroom');
    $scope.desktop = config.get('desktop');

    $scope.change = function (key) {
      var res = config.set(key, $scope[key]);
      if (true === res) {
        $rootScope.$emit('messageShow', {
          succ: true,
          text: '保存成功。'
        });
      } else {
        $rootScope.$emit('messageShow', {
          succ: false,
          text: '保存失败。'
        });
      }
    };
  }
])

.controller('square', [
  '$scope', '$rootScope', '$http',
  function ($scope, $rootScope, $http) {
    $scope.classroom = project.get().classroom;
    $scope.desktop = project.get().desktop;

    $scope.click = function (it) {
      if (1 !== it.is_online && 2 !== it.is_online) {
        return true;
      }
      $rootScope.$state.go('live', {
        camera_uuid: it.uuid
      });
    };
  }
])

.controller('live', [
  '$scope', '$rootScope', '$http', 'flagFactory', '$timeout', '$interval', 'playerFactory',
  function ($scope, $rootScope, $http, flagFactory, $timeout, $interval, playerFactory) {
    var uuid = $rootScope.$state.params.camera_uuid;
    $scope.sec = 10;

    var url = $rootScope.$project + '/cameras/' + uuid + '/sessions';
    url = 'http://api.opensight.cn/api/ivc/v1/projects/demo/cameras/8e9afacb-c0b7-4e22-b7c1-9468ff9adc22/sessions';
    var tiptimer = undefined;
    var alivetimer = undefined;
    var playerId = 'videoPlayer';

    var init = function () {
      $scope.caminfo = get();
      var bitmap = flagFactory.getBitmap($scope.caminfo.flags, 8);
      var flags = flagFactory.parseCamera(bitmap);
      $scope.ability = flags.ability;

      if (0 !== $scope.ability.length) {
        $scope.quality = $scope.ability[$scope.ability.length - 1].text;
      }
    };

    var get = function () {
      var pro = project.get();
      for (var i = 0, l = pro.classroom.length; i < l; i++) {
        if (uuid === pro.classroom[i].uuid) {
          $scope.type = 'classroom';
          return pro.classroom[i];
        }
      }
      for (var i = 0, l = pro.desktop.length; i < l; i++) {
        if (uuid === pro.desktop[i].uuid) {
          $scope.type = 'desktop';
          return pro.desktop[i];
        }
      }
      return null;
    };

    var create = function () {
      $http.post(url, {
        format: 'rtmp',
        quality: $scope.quality.toLowerCase(),
        create: true,
        user: 'demo'
      }).success(function (response) {
        $scope.id = response.session_id;
        playerFactory.load(response.url, playerId);
        keepalive(response);
        if (tiptimer) {
          $interval.cancel(tiptimer);
          tiptimer = undefined;
        }
      }).error(function (response, status) {
        console.log('error');
      });
    };

    var keepalive = function (info) {
      if (undefined !== alivetimer) {
        $interval.cancel(alivetimer);
        alivetimer = undefined;
      }
      var duration = 2 * 60 * 60 * 1000;
      var intrvl = 20 * 1000;
      var count = duration / intrvl;
      alivetimer = $interval(function () {
        if (0 === count) {
          $scope.ok();
          return;
        } else {
          count--;
        }
        $http.post(url + '/' + info.session_id, {}).success(function (response) {

        }).error(function (response, status) {
          console.log('error');
        });
      }, intrvl);
    };

    var stop = function () {
      playerFactory.stop(playerId);
      if (undefined !== alivetimer) {
        $interval.cancel(alivetimer);
        alivetimer = undefined;
      }
      if (undefined === $scope.id) {
        return;
      }
      $http.delete(url + '/' + $scope.id, {});
    };

    var updateTip = function () {
      tiptimer = $interval(function () {
        if (1 === $scope.sec && undefined !== tiptimer) {
          $interval.cancel(tiptimer);
          tiptimer = undefined;
          return;
        }
        $scope.sec--;
        // $scope.$apply();
      }, 1000);
    };

    var initChangyan = function () {
      setTimeout(function(){
        window.changyan.api.config({
          appid: 'cysz4Q4lo',
          conf: 'prod_4193b6bf7521a984e9ed89e4407582cc'
        });
      }, 1000);
    };

    init();

    create();

    updateTip();

    initChangyan();
  }
]);
