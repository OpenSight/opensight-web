app.register.controller('PLive', ['$rootScope', '$scope', '$http', '$q', '$window', '$stateParams', '$state', function($rootScope, $scope, $http, $q, $window, $stateParams, $state) {
  $scope.plive = (function() {
    return {
      showPlayer: function(item) {
        $scope.c.img = "img/video4x4.jpg";
        $scope.c.tip = true;
        $scope.Player = new HlsVideo(item);
        $rootScope.Player = $scope.Player;
      },
      init: function() {
        var item = $rootScope.pCamera;
        $scope.c = item;
        $scope.c.tip = false;
        $scope.c.img = item.preview;
        $scope.c.stearmOptions = [{
          text: 'LD',
          title: '流畅',
          on: ((item.flags & 0x01) === 0) ? 0 : 1
        }, {
          text: 'SD',
          title: '标清',
          on: ((item.flags & 0x02) === 0) ? 0 : 1
        }, {
          text: 'HD',
          title: '高清',
          on: ((item.flags & 0x04) === 0) ? 0 : 1
        }, {
          text: 'FHD',
          title: '超清',
          on: ((item.flags & 0x08) === 0) ? 0 : 1
        }];

        var stream = $.cookie('stream');
        if (stream === "" || stream === undefined) {
          stream = 0;
        }
        if ($scope.c.stearmOptions[stream].on !== 0) {
          $scope.c.stearmOptions[stream].on = 2;
          item.playStream = $scope.c.stearmOptions[stream].text.toLowerCase();
        } else {
          for (var i in $scope.c.stearmOptions) {
            if ($scope.c.stearmOptions[i].on !== 0) {
              $scope.c.stearmOptions[i].on = 2;
              item.playStream = $scope.c.stearmOptions[i].text.toLowerCase();
              break;
            }
          }
        }

        $scope.plive.showPlayer(item);
        $scope.plive.on();
      },
      on: function() {
        var url = window.location.href.substr(0, window.location.href.lastIndexOf('/', window.location.href.indexOf('?'))) + '/share/live.html?jwt=' + jwt.getJwt(7) + '&project_name=' + encodeURI($scope.c.project_name) + '&camera_id=' + encodeURI($scope.c.uuid);
        wx.onMenuShareAppMessage({
          title: $scope.c.name, // 分享标题
          desc: $scope.c.desc, // 分享描述
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
          title: $scope.c.name, // 分享标题
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
      checkBtn: function(it) {
        if (it.on === 1) {
          for (var i in $scope.c.stearmOptions) { //reset all checked
            if ($scope.c.stearmOptions[i].on === 2) {
              $scope.c.stearmOptions[i].on = 1;
            }
            if (it.text === $scope.c.stearmOptions[i].text)
              $.cookie('stream', i, { expires: 1440 * 360 });
          }

          it.on = 2;
          $scope.Player.destroy();
          $scope.c.playStream = it.text.toLowerCase();
          $scope.Player = new HlsVideo($scope.c);
        } else it.on = 1;
      },
      backToCameraList: function() {
        if ($scope.Player !== undefined)
          $scope.Player.destroy();
        //                $state.go('camera');
        window.history.back();

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
  $scope.plive.init();

}]);
