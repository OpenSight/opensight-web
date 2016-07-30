app.register.controller('Backup', [
  '$rootScope', '$scope', '$http', '$q', '$window', '$stateParams', '$state', 'dateFactory',
  function($rootScope, $scope, $http, $q, $window, $stateParams, $state, dateFactory) {
    $scope.backup = (function() {
      return {
        init: function() {
          $scope.backup.url = "http://api.opensight.cn/api/ivc/v1/projects/" + G_ProjectName + '/record/events';
        },
        query: function() {
          $('#ToastTxt').html("正在获取录像列表");
          $('#loadingToast').show();
          $http.get($scope.backup.url, {
            params: {
              start: 0,
              limit: 10
            }
          }).success(function(response) {
            $scope.filelist = response;
            setTimeout(function() {
              $('#loadingToast').hide();
            }, 100);
          }).error(function(response, status) {
            $('#ToastTxt').html("获取录像列表失败");
            $('#loadingToast').show();
            setTimeout(function() {
              $('#loadingToast').hide();
            }, 2000);
          });
        },
        play: function(item) {
          $rootScope.pRecInfo = item;
          $state.go('precplay');
        },
        backProject: function() {
          if ($scope.Player !== undefined)
            $scope.Player.destroy();
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
        actionShow: function() {
          var mask = $('#mask');
          var weuiActionsheet = $('#weui_actionsheet');
          weuiActionsheet.addClass('weui_actionsheet_toggle');
          mask.show()
            .focus() //加focus是为了触发一次页面的重排(reflow or layout thrashing),使mask的transition动画得以正常触发
            .addClass('weui_fade_toggle').one('click', function() {
              hideActionSheet(weuiActionsheet, mask);
            });

          mask.unbind('transitionend').unbind('webkitTransitionEnd');

          function hideActionSheet(weuiActionsheet, mask) {
            weuiActionsheet.removeClass('weui_actionsheet_toggle');
            mask.removeClass('weui_fade_toggle');
            mask.on('transitionend', function() {
              mask.hide();
            }).on('webkitTransitionEnd', function() {
              mask.hide();
            })
          }
        }
      }
    })();

    $scope.destroy = function() {
      if (undefined !== $scope.aborter) {
        $scope.aborter.resolve();
        delete $scope.aborter;
      }
    };

    $scope.$on('$destroy', $scope.destroy);
    $scope.backup.init();
    $scope.backup.query();

  }
]);
