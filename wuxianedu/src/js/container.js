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

      $scope.save = function () {
        config.set('classroom', $scope.classroom);
        config.set('desktop', $scope.desktop);
        $rootScope.$emit('messageShow', {
          succ: true,
          text: '保存成功。'
        });
      };
    }
  ])

  .controller('square', [
    '$scope', '$rootScope', '$http',
    function ($scope, $rootScope, $http) {
      $scope.classroom = project.classroom();
      $scope.desktop = project.desktop();

      var ivcproxy = window.location.protocol + '//' + window.location.host + '/api/ivc/v1/projects/' + project.getName() + '/cameras/';
      var uri = api + 'projects/' + project.getName() + '/cameras/';
      $scope.click = function (it) {
        if (1 !== it.is_online && 2 !== it.is_online) {
          return true;
        }
        $rootScope.$state.go('live', {
          camera_uuid: it.uuid
        });
      };

      $scope.replay = function (it) {
        $http.get(ivcproxy + it.uuid + '/ivcproxy/replay_config', {}).success(function (info) {
          if (undefined === info.replay_url || '' === info.replay_url) {
            $rootScope.$emit('messageShow', {
              succ: false,
              text: '回放地址未设置。'
            });
          } else {
            window.location.href = info.replay_url;
            // window.open(info.replay_url);
          }
        }).error(function () {
          $rootScope.$emit('messageShow', {
            succ: false,
            text: '获取回放地址失败。'
          });
        });
      };
    }
  ])

  .controller('detail', [
    '$scope', '$rootScope', '$http',
    function ($scope, $rootScope, $http) {
      var uuid = $rootScope.$state.params.camera_uuid;

      var ivcproxy = window.location.protocol + '//' + window.location.host + '/api/ivc/v1/projects/' + project.getName() + '/cameras/' + uuid;
      var uri = api + 'projects/' + project.getName() + '/cameras/' + uuid;;

      $http.get(uri, {}).success(function (info) {
        $scope.cam = info;
      });

      $http.get(ivcproxy + '/ivcproxy/rtp_url', {}).success(function (info) {
        $scope.rtp_url = info.rtp_url;
      });

      $http.get(ivcproxy + '/ivcproxy/replay_config', {}).success(function (info) {
        $scope.replay_url = info.replay_url;
      });

      $scope.save = function () {
        $http.put(ivcproxy + '/ivcproxy/replay_config', {
          replay_url: $scope.replay_url
        }).success(function () {
          $rootScope.$emit('messageShow', {
            succ: true,
            text: '保存成功。'
          });
        }).error(function () {
          $rootScope.$emit('messageShow', {
            succ: false,
            text: '保存失败。'
          });
        });
      };
    }
  ])

  .controller('live', [
    '$scope', '$rootScope', '$http', 'flagFactory', '$timeout', '$interval', 'playerFactory',
    function ($scope, $rootScope, $http, flagFactory, $timeout, $interval, playerFactory) {
      var uuid = $rootScope.$state.params.camera_uuid;
      $scope.sec = 10;
      var sessions_url = window.location.protocol + '//' + window.location.host + '/api/ivc/v1/projects/' + project.getName() + '/cameras/' + uuid + '/sessions';

      var tiptimer = undefined;
      var alivetimer = undefined;
      var playerId = 'videoPlayer';

      $scope.change = function (quality) {
        $scope.quality = quality;
        create();
        showTip();
      };

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
        $http.post(sessions_url, {
          format: 'rtmp',
          quality: $scope.quality.toLowerCase(),
          create: true,
          user: 'demo'
        }).success(function (response) {
          hideTip();
          $scope.id = response.session_id;
          var bufferTime = config.get($scope.type);
          playerFactory.load(response.url, playerId, bufferTime);
          keepalive(response);
        }).error(function (response, status) {
          hideTip();
          $rootScope.$emit('messageShow', {
            succ: false,
            text: '直播启动失败。'
          });
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
          $http.post(sessions_url + '/' + info.session_id, {}).success(function (response) {

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

      var showTip = function () {
        $scope.sec = 10;
        $scope.tipshow = true;
        tiptimer = $interval(function () {
          if (1 === $scope.sec) {
            $interval.cancel(tiptimer);
            tiptimer = undefined;
            return;
          }
          $scope.sec--;
        }, 1000);
      };
      var hideTip = function () {
        if (undefined !== tiptimer) {
          $interval.cancel(tiptimer);
          tiptimer = undefined;
        }
        $scope.tipshow = false;
      };

      var initChangyan = function () {
        $('#changyan-container').html('<div id="SOHUCS" sid="' + uuid + '"></div><script charset="utf-8" type="text/javascript" src="http://changyan.sohu.com/upload/changyan.js" ></script>');
        setTimeout(function () {
          window.changyan.api.config({
            appid: 'cysz4Q4lo',
            conf: 'prod_4193b6bf7521a984e9ed89e4407582cc'
          });
        }, 1000);
      };

      init();

      create();

      showTip();

      $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
        if (-1 === oldUrl.search(/#\/live\//)) {
          return;
        }
        hideTip();
        stop();
      })

      initChangyan();
    }
  ]);
