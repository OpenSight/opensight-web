app.register.controller('PRecPlay', ['$rootScope', '$scope', '$http', '$q', '$window', '$stateParams', '$state', function($rootScope, $scope, $http, $q, $window, $stateParams, $state) {
  $scope.precplay = (function() {
    var padding = function(n) {
      if (10 > n) {
        return '0' + n;
      }
      return n.toString();
    };
    var getDuration = function(dur, ms) {
      var a = [{ t: '秒', v: 60 }, { t: '分', v: 60 }, { t: '时', v: 60 }, { t: '天', v: 24 }];
      var s = '';
      if (true === ms) {
        dur = Math.floor(dur / 1000);
      }
      for (var i = 0, l = a.length; i < l; i++) {
        s = dur % a[i].v + a[i].t + s;
        dur = Math.floor(dur / a[i].v);
        if (0 === dur) {
          break;
        }
      }
      return s;
    };
    return {
      init: function() {
        $scope.recInfo = $rootScope.pRecInfo;
        var player = document.getElementById("replayPlayer");
        $rootScope.RecPlayer = player;
        player.src = $scope.recInfo.hls;
        player.load();
        player.play();
        $scope.precplay.on();
      },
      on: function() {
        var start = new Date($scope.recInfo.start);
        var desc = '开始时间: ' +  padding(start.getMonth() + 1, 2) + '-' + padding(start.getDate(), 2) + ' ' + padding(start.getHours(), 2) + ':' + padding(start.getMinutes(), 2) + '\r\n' +
          '时长: ' +  getDuration($scope.recInfo.end - $scope.recInfo.start, true);
        // $scope.caminfo.name + '_' + padding($scope.start.getMonth() + 1, 2) + padding($scope.start.getDate(), 2)
        var url = window.location.href.substr(0, window.location.href.lastIndexOf('/', window.location.href.indexOf('?'))) + '/share/replay.html?jwt=' + jwt.getJwt(7) + '&project_name=' + encodeURI($scope.recInfo.project_name) + '&event_id=' + encodeURI($scope.recInfo.event_id);
        wx.onMenuShareAppMessage({
          title: $scope.recInfo.desc, // 分享标题
          desc: desc, // 分享描述
          link: url, // 分享链接
          imgUrl: 'http://www.opensight.cn/img/play-logo.png', // 分享图标
          success: function() {
            // 用户确认分享后执行的回调函数
          },
          cancel: function() {
            // 用户取消分享后执行的回调函数
          }
        });
        wx.onMenuShareTimeline({
          title: $scope.recInfo.desc, // 分享标题
          link: url, // 分享链接
          imgUrl: 'http://www.opensight.cn/img/play-logo.png', // 分享图标
          success: function() {
            // 用户确认分享后执行的回调函数
          },
          cancel: function() {
            // 用户取消分享后执行的回调函数
          }
        });
      },
      backList: function() {
        $scope.precplay.stopRec();
        //                $state.go('prec');
        window.history.back();
      },
      stopRec: function() {
        var player = $rootScope.RecPlayer;
        if (player !== null && player !== undefined && player.currentTime) {
          player.currentTime = 0;
          player.pause();
          player.src = "movie.ogg";
          player.load();
        }
      },
      goBackup: function() {
        $scope.recInfo.currentTime = document.getElementById("replayPlayer").currentTime;
        // $rootScope.pRecInfo = $scope.recInfo;
        $state.go('backuprecord');
      },
      share: function() {
        wx.showMenuItems({
          menuList: [
            'menuItem:share:appMessage', // 分享给朋友
            'menuItem:share:timeline' // 分享到朋友圈
          ],
          success: function(res) {
            alert('已显示“分享给朋友”，“分享到朋友圈”等按钮');
          },
          fail: function(res) {
            alert(JSON.stringify(res));
          }
        });

      }
    };
  })();

  $scope.destroy = function() {
    if (undefined !== $scope.aborter) {
      $scope.aborter.resolve();
      delete $scope.aborter;
    }
  };

  $scope.$on('$destroy', $scope.destroy);
  $scope.precplay.init();

}]);
