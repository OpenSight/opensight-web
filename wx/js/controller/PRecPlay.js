app.register.controller('PRecPlay', [
  '$rootScope', '$scope', '$http', '$q', '$window', '$stateParams', '$state', '$interval',
  function ($rootScope, $scope, $http, $q, $window, $stateParams, $state, $interval) {
    $scope.precplay = (function () {
      var padding = function (n) {
        if (10 > n) {
          return '0' + n;
        }
        return n.toString();
      };
      var getDuration = function (dur) {
        var a = [{
          t: '分',
          v: 60
        }, {
          t: '时',
          v: 60
        }, {
          t: '天',
          v: 24
        }];
        var s = '';
        dur = Math.floor(dur / (1000 * 60));
        for (var i = 0, l = a.length; i < l; i++) {
          s = dur % a[i].v + a[i].t + s;
          dur = Math.floor(dur / a[i].v);
          if (0 === dur) {
            break;
          }
        }
        return s;
      };
      var getPath = function () {
        var pathname = window.location.pathname;
        var last = pathname.lastIndexOf('/');
        var path = pathname.substr(0, pathname.lastIndexOf('/') + 1);
        return window.location.origin + path;
      };
      return {
        showShareTip: false,
        init: function () {
          $scope.recInfo = $rootScope.pRecInfo;
          var player = document.getElementById("replayPlayer");
          $rootScope.RecPlayer = player;
          player.src = $scope.recInfo.hls;
          player.load();
          player.play();
          $scope.precplay.on();
        },
        on: function () {
          var title = $scope.precplay.getMsgTitle();
          var link = $scope.precplay.getMsgLink();
          var desc = $scope.precplay.getMsgDesc();

          $scope.precplay.setShareMessage(title, desc, link);
          $scope.precplay.sotpInterval();
          $scope.precplay.interval = $interval(function(){
            var link = $scope.precplay.getMsgLink();
            $scope.precplay.setShareMessage(title, desc, link);
          }, 10 * 1000);

        },
        getMsgLink: function (curtime) {
          var url = window.location.href.substr(0, window.location.href.lastIndexOf('/', window.location.href.indexOf('?')));
          url += '/share/replay.html?jwt=' + jwt.getJwt(7);
          if (undefined !== $scope.recInfo.event_id) {
            return url + '&project_name=' + encodeURI($scope.recInfo.project_name) + '&event_id=' + encodeURI($scope.recInfo.event_id);
          }
          debugger;
          return url + '&project_name=' + encodeURI($scope.pCamera.project_name) + '&camera_id=' + encodeURI($rootScope.pCamera.uuid) + '&start=' + encodeURI($scope.recInfo.start) + '&end=' + encodeURI($scope.recInfo.end) + '&current_time=' + document.getElementById("replayPlayer").currentTime;
        },
        getMsgDesc: function () {
          var start = new Date($scope.recInfo.start);
          var desc = '开始时间: ' + padding(start.getMonth() + 1, 2) + '-' + padding(start.getDate(), 2) + ' ' + padding(start.getHours(), 2) + ':' + padding(start.getMinutes(), 2) + '    ' +
            '时长: ' + getDuration($scope.recInfo.end - $scope.recInfo.start);
          if (undefined !== $scope.recInfo.event_id) {
            return desc;
          } else {
            return '摄像机: ' + $rootScope.pCamera.name + '    ' + desc;
          }
        },
        getMsgTitle: function () {
          return undefined === $scope.recInfo.event_id ? $rootScope.pCamera.name : $scope.recInfo.desc;
        },
        setShareMessage: function (title, desc, link) {
          var s = $scope;
          wx.onMenuShareAppMessage({
            title: title, // 分享标题
            desc: desc, // 分享描述
            link: link, // 分享链接
            imgUrl: getPath() + 'img/play-logo.png', // 分享图标
            success: function () {
              // 用户确认分享后执行的回调函数
              s.precplay.showShareTip = false;
            },
            cancel: function () {
              // 用户取消分享后执行的回调函数
              s.precplay.showShareTip = false;
            }
          });
          wx.onMenuShareTimeline({
            title: title, // 分享标题
            link: link, // 分享链接
            imgUrl: getPath() + 'img/play-logo.png', // 分享图标
            success: function () {
              // 用户确认分享后执行的回调函数
              s.precplay.showShareTip = false;
            },
            cancel: function () {
              // 用户取消分享后执行的回调函数
              s.precplay.showShareTip = false;
            }
          });
        },
        backList: function () {
          // $scope.precplay.unload();
          //                $state.go('prec');
          window.history.back();
        },
        stopRec: function () {
          var player = $rootScope.RecPlayer;
          if (player !== null && player !== undefined && player.currentTime) {
            player.currentTime = 0;
            player.pause();
            player.src = "movie.ogg";
            player.load();
          }
        },
        sotpInterval: function(){
          if (undefined !== $scope.precplay.interval){
            $interval.cancel($scope.precplay.interval);
            $scope.precplay.interval = undefined;
          }
        },
        unload: function(){
          debugger;
          $scope.precplay.sotpInterval();
          $scope.precplay.stopRec();
        },
        goBackup: function () {
          $scope.recInfo.currentTime = document.getElementById("replayPlayer").currentTime;
          // $rootScope.pRecInfo = $scope.recInfo;
          // $scope.precplay.unload();
          $state.go('backuprecord');
        },
        share: function () {
          wx.showMenuItems({
            menuList: [
              'menuItem:share:appMessage', // 分享给朋友
              'menuItem:share:timeline' // 分享到朋友圈
            ],
            success: function (res) {
              alert('已显示“分享给朋友”，“分享到朋友圈”等按钮');
            },
            fail: function (res) {
              alert(JSON.stringify(res));
            }
          });
        }
      };
    })();

    $scope.destroy = function () {
      $scope.precplay.unload();
      if (undefined !== $scope.aborter) {
        $scope.aborter.resolve();
        delete $scope.aborter;
      }
    };

    $scope.$on('$destroy', $scope.destroy);
    $scope.precplay.init();

  }
]);
