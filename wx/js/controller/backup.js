app.register.controller('Backup', [
  '$rootScope', '$scope', '$http', '$q', '$window', '$stateParams', '$state', 'dateFactory',
  function ($rootScope, $scope, $http, $q, $window, $stateParams, $state, dateFactory) {
    $scope.backup = (function () {
      return {
        bDel: false,
        checked_num: 0,
        all_checked: false,
        alert_shown: false,
        confirm_shown: false,
        init: function () {
          $scope.backup.url = "http://api.opensight.cn/api/ivc/v1/projects/" + G_ProjectName + '/record/events';
        },
        query: function () {
          $('#ToastTxt').html("正在获取录像列表");
          $('#loadingToast').show();
          $http.get($scope.backup.url, {
            params: {
              start: 0,
              limit: 10
            }
          }).success(function (response) {
            $scope.filelist = response;
            setTimeout(function () {
              $('#loadingToast').hide();
            }, 100);
          }).error(function (response, status) {
            $('#ToastTxt').html("获取录像列表失败");
            $('#loadingToast').show();
            setTimeout(function () {
              $('#loadingToast').hide();
            }, 2000);
          });
        },
        play: function (item, bDel) {
          if (0 === item.state || true == bDel) {
            return;
          }
          $rootScope.pRecInfo = item;
          $state.go('precplay');
        },
        backProject: function () {
          if ($scope.Player !== undefined)
            $scope.Player.destroy();
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
        actionShow: function () {
          var mask = $('#mask');
          var weuiActionsheet = $('#weui_actionsheet');
          weuiActionsheet.addClass('weui_actionsheet_toggle');
          mask.show()
            .focus() //加focus是为了触发一次页面的重排(reflow or layout thrashing),使mask的transition动画得以正常触发
            .addClass('weui_fade_toggle').one('click', function () {
              hideActionSheet(weuiActionsheet, mask);
            });

          mask.unbind('transitionend').unbind('webkitTransitionEnd');

          function hideActionSheet(weuiActionsheet, mask) {
            weuiActionsheet.removeClass('weui_actionsheet_toggle');
            mask.removeClass('weui_fade_toggle');
            mask.on('transitionend', function () {
              mask.hide();
            }).on('webkitTransitionEnd', function () {
              mask.hide();
            })
          }
        },
        checkeItem: function (item) {
          if (true === item.checked) {
            // item.checked = false;
            $scope.backup.checked_num++;
          } else {
            // item.checked = true;
            $scope.backup.checked_num--;
          }
          if ($scope.backup.checked_num === $scope.filelist.list.length) {
            $scope.backup.all_checked = true;
          } else if (0 === $scope.backup.checked_num) {
            $scope.backup.all_checked = false;
          }
        },
        checkeAll: function (list) {
          var checked = $scope.backup.all_checked;
          for (var i = 0, l = list.length; i < l; i++) {
            list[i].checked = checked;
          }
        },
        del: function () {
          if (0 === $scope.backup.checked_num) {
            $scope.backup.alert_shown = true;
          } else {
            $scope.backup.confirm_shown = true;
          }
        },
        delItems: function () {
          $scope.backup.confirm_shown = false;
          $('#ToastTxt').html("正在删除");
          $('#loadingToast').show();
          var succ_num = 0;
          var err_num = 0;
          var total = 0;
          for (var i = 0, l = $scope.filelist.list.length; i < l; i++) {
            if (true === $scope.filelist.list[i].checked) {
              total++;
              var event_id = $scope.filelist.list[i].event_id;
              $http.delete("http://api.opensight.cn/api/ivc/v1/projects/" + G_ProjectName + '/record/events/' + event_id, {}).success((function (id) {
                return function(response){
                  for (var i = 0, l = $scope.filelist.list.length; i < l; i++){
                    if (id === $scope.filelist.list[i].event_id){
                      $scope.filelist.list.splice(i, 1);
                      break;
                    }
                  }
                  succ_num++;
                };
              })(event_id)).error(function (response, status) {
                err_num++;
                console.log('error');
              });
            }
          }
          var getTip = function(succ_num, err_num){
            var str = '';
            str += '成功' + succ_num;
            if (0 !== err_num){
              str += '，失败' + err_num;
            }
            return str;
          };
          var timer = setInterval(function(){
            var tip = getTip(succ_num, err_num);
            $('#ToastTxt').html(tip);
            if (succ_num + err_num === total){
              clearInterval(timer);
              setTimeout(function() {
                $('#loadingToast').hide();
              }, 2000);
            }
          }, 2000);
        }
      }
    })();

    $scope.destroy = function () {
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
