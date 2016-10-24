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
          if (undefined !== $scope.recInfo.event_id) {
            $scope.precplay.onBackupShare();
            return;
          }
          $scope.precplay.onRecordShare();
          $scope.precplay.sotpInterval();
          $scope.precplay.interval = $interval(function(){
            $scope.precplay.onRecordShare();
          }, 10 * 1000);
        },
        onRecordShare: function(){
          var title = $rootScope.pCamera.name;

          var curtime = parseInt(document.getElementById("replayPlayer").currentTime, 10);
          var start = $scope.recInfo.start + (curtime - 10) * 1000;
          start = start > $scope.recInfo.start ? start : $scope.recInfo.start;
          var end = $scope.recInfo.start + (curtime + 5 * 60) * 1000;
          end = end < $scope.recInfo.end ? end : $scope.recInfo.end;

          var link = $scope.precplay.getMsgLink({
            project_name: $scope.pCamera.project_name,
            camera_id: $rootScope.pCamera.uuid,
            start: start,
            end: end
          });

          var desc = $scope.precplay.getMsgDesc(start, end - start);
          $scope.precplay.setShareMessage(title, desc, link);
        },
        onBackupShare: function(){
          var title = $scope.recInfo.desc;
          var link = $scope.precplay.getMsgLink({event_id: $scope.recInfo.event_id});
          var desc = '摄像机：' + $rootScope.pCamera.name + ' ' + $scope.precplay.getMsgDesc($scope.recInfo.start, $scope.recInfo.duration);
          $scope.precplay.setShareMessage(title, desc, link);
        },
        getMsgLink: function(params){
          var page = window.location.href.match(/^[^?#]+/)[0];
          var url = page.substr(0, page.lastIndexOf('/'));
          url += '/share/replay.html?jwt=' + jwt.getJwt();
          for (var key in params){
            url += '&' + key + '=' + params[key];
          }
          return url;
        },
        getMsgDesc: function (start, duration) {
          start = new Date(start);
          var desc = '开始时间：' +
            padding(start.getMonth() + 1, 2) + '-' +
            padding(start.getDate(), 2) + ' ' +
            padding(start.getHours(), 2) + ':' +
            padding(start.getMinutes(), 2) +
            ' 时长：' + getDuration(duration);
          return desc;
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
