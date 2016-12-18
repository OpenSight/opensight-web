app.register.controller('PLive', ['$rootScope', '$scope', '$http', '$q', '$window', '$stateParams', '$state', function ($rootScope, $scope, $http, $q, $window, $stateParams, $state) {
  $scope.plive = (function () {
    var getPath = function () {
      var pathname = window.location.pathname;
      var last = pathname.lastIndexOf('/');
      var path = pathname.substr(0, pathname.lastIndexOf('/') + 1);
      return window.location.origin + path;
    };

    return {
      showShareTip: false,
      showPlayer: function (item) {
        $scope.c.img = "img/video4x4.jpg";
        $scope.c.tip = true;
        $scope.Player = new HlsVideo(item);
        $rootScope.Player = $scope.Player;
      },
      init: function () {
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

        $scope.share_status = (item.flags & 0x100) === 0;

        var stream = $.cookie('stream');
        if (stream === "" || stream === undefined) {
          stream = 0;
        }
        if ($scope.c.stearmOptions[stream].on !== 0) {
          $scope.c.stearmOptions[stream].on = 2;
          item.playStream = $scope.c.stearmOptions[stream].text.toLowerCase();
          $scope.c.playTitle = $scope.c.stearmOptions[stream].title
        } else {
          for (var i in $scope.c.stearmOptions) {
            if ($scope.c.stearmOptions[i].on !== 0) {
              $scope.c.stearmOptions[i].on = 2;
              item.playStream = $scope.c.stearmOptions[i].text.toLowerCase();
              $scope.c.playTitle = $scope.c.stearmOptions[i].title
              break;
            }
          }
        }

        $scope.c.playStream = item.playStream;

        $scope.plive.showPlayer(item);
        $scope.plive.on();
      },
      on: function () {
        var _live = $scope.plive;
        var url = window.location.href.substr(0, window.location.href.lastIndexOf('/', window.location.href.indexOf('?'))) + '/share/live.html?jwt=' + jwt.getJwt() + '&project_name=' + encodeURI($scope.c.project_name) + '&camera_id=' + encodeURI($scope.c.uuid) + '&quality=' + encodeURI($scope.c.playStream);
        wx.onMenuShareAppMessage({
          title: $scope.c.name, // 分享标题
          desc: $scope.c.desc, // 分享描述
          link: url, // 分享链接
          imgUrl: getPath() + 'img/play-logo.png', // 分享图标
          success: function () {
            // 用户确认分享后执行的回调函数
            _live.showShareTip = false;
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
            _live.showShareTip = false;
          }
        });
        wx.onMenuShareTimeline({
          title: $scope.c.name, // 分享标题
          link: url, // 分享链接
          imgUrl: getPath() + 'img/play-logo.png', // 分享图标
          success: function () {
            // 用户确认分享后执行的回调函数
            _live.showShareTip = false;
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
            _live.showShareTip = false;
          }
        });
      },
      checkBtn: function (it) {
        if (it.on === 1) {
          for (var i in $scope.c.stearmOptions) { //reset all checked
            if ($scope.c.stearmOptions[i].on === 2) {
              $scope.c.stearmOptions[i].on = 1;
            }
            if (it.text === $scope.c.stearmOptions[i].text)
              $.cookie('stream', i, {
                expires: 1440 * 360
              });
          }

          it.on = 2;
          $scope.Player.destroy();
          $scope.c.playStream = it.text.toLowerCase();
          $scope.c.playTitle = it.title
          $scope.Player = new HlsVideo($scope.c);
        } else it.on = 1;

        $scope.actionNoShow();
      },
      backToCameraList: function () {
        if ($scope.Player !== undefined)
          $scope.Player.destroy();
        //                $state.go('camera');
        window.history.back();
      }
    };
  })();

  $scope.destroy = function () {
    if (undefined !== $scope.aborter) {
      $scope.aborter.resolve();
      delete $scope.aborter;
    }
  };

  $scope.actionNoShow = function () {
    var mask = $('#mask');
    var weuiActionsheet = $('#weui_actionsheet');

    weuiActionsheet.removeClass('weui_actionsheet_toggle');
    mask.removeClass('weui_fade_toggle');
    mask.on('transitionend', function () {
      mask.hide();
    }).on('webkitTransitionEnd', function () {
      mask.hide();
    })
  };

  $scope.setShareStatus = function () {
    // $('#ToastTxt').html("保存中");
    // $('#loadingToast').show();
    $http.put("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.c.project_name + '/cameras/' + $scope.c.uuid + '/basic_info', {
      name: $scope.c.name,
      desc: $scope.c.desc,
      long_desc: $scope.c.long_desc,
      longitude: $scope.c.longitude,
      latitude: $scope.c.latitude,
      altitude: $scope.c.altitude,
      disable_share: !$scope.share_status
    }).success(function (response) {
      $('#loadingToast').hide();
    }).error(function (response, status) {
      $('#ToastTxt').html("保存失败");
      $('#loadingToast').show();
      setTimeout(function () {
        $('#loadingToast').hide();
      }, 2000);
    });
  };

  $scope.actionShow = function () {
    var mask = $('#mask');
    var weuiActionsheet = $('#weui_actionsheet');
    weuiActionsheet.addClass('weui_actionsheet_toggle');
    mask.show()
      .focus() //加focus是为了触发一次页面的重排(reflow or layout thrashing),使mask的transition动画得以正常触发
      .addClass('weui_fade_toggle').one('click', function () {
        $scope.actionNoShow();
      });
    mask.unbind('transitionend').unbind('webkitTransitionEnd')
  };

  $scope.$on('$destroy', $scope.destroy);
  $scope.plive.init();


}]);
