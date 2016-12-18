app.register.controller('PRec', [
  '$rootScope', '$scope', '$http', '$q', '$window', '$stateParams', '$state', 'dateFactory', 'cookieFactory',
  function ($rootScope, $scope, $http, $q, $window, $stateParams, $state, dateFactory, cookieFactory) {
    $scope.prec = (function () {
      return {
        getDt: function () {
          var dt = cookieFactory.get('selected_date');
          if (undefined === dt) {
            return new Date();
          }
          return new Date(dt);
        },
        cacheDt: function (dt) {
          var str = dt.toLocaleDateString();
          cookieFactory.set('selected_date', str);
        },
        init: function () {
          var item = $rootScope.pCamera;
          $scope.prec.url = "http://api.opensight.cn/api/ivc/v1/projects/" + item.project_name + '/cameras/' + item.uuid + '/record/search';
          $scope.dt = $scope.prec.getDt();

          $scope.timepicker = {
            start: '00:00:00',
            end: '23:59:59'
          };
          $scope.timepicker.startdt = dateFactory.str2time($scope.timepicker.start, true);
          $scope.timepicker.enddt = dateFactory.str2time($scope.timepicker.end, false);
          $scope.seglength = '60';
        },
        rank: function(segments){
          var list = [];
          var info = {
            opened: false,
            duration: 0
          };
          for (var i = 0, l = segments.length; i < l; i++){
            if (3600000 <= segments[i].duration){
              if (0 < info.duration){
                list.push(info);
              }
              list.push({
                start: segments[i].start,
                end: segments[i].end,
                opened: false,
                duration: segments[i].duration,
                segments: [segments[i]]
              });
              info = {
                opened: false,
                duration: 0
              };
              continue;
            }
            if (0 === info.duration){
              info = {
                start: segments[i].start,
                end: segments[i].end,
                duration: segments[i].duration,
                opened: false,
                segments: [segments[i]]
              };
              continue;
            }
            info.end = segments[i].end;
            info.opened = false;
            info.duration = info.duration + segments[i].duration;
            info.segments.push(segments[i]);
            if (3600000 <= info.duration){
              list.push(info);
              info = {
                opened: false,
                duration: 0
              };
            }
          }
          return list;
        },
        query: function () {
          $('#ToastTxt').html("正在获取录像列表");
          $('#loadingToast').show();
          $http.get($scope.prec.url, {
            params: {
              start: dateFactory.getms($scope.dt, $scope.timepicker.startdt),
              end: dateFactory.getms($scope.dt, $scope.timepicker.enddt),
              seglength: parseInt($scope.seglength, 10)
            }
          }).success(function (response) {
            $scope.segments = $scope.prec.rank(response.segments);
            // $scope.reclist = response;
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
        timechange: function () {
          $scope.prec.cacheDt($scope.dt);

          $scope.timepicker = {
            start: '00:00:00',
            end: '23:59:59'
          };
          $scope.timepicker.startdt = dateFactory.str2time($scope.timepicker.start, true);
          $scope.timepicker.enddt = dateFactory.str2time($scope.timepicker.end, false);
          $scope.seglength = '60';
          $scope.prec.query();
        },
        play: function (item) {
          $rootScope.pRecInfo = item;
          $state.go('precplay');
        },
        open: function(item){
          if (1 === item.segments.length){
            $scope.prec.play(item);
          } else {
            item.opened = !item.opened;
          }
        },
        backToCameraList: function () {
          $scope.prec.stopRec();
          //                $state.go('camera');
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
            .focus()//加focus是为了触发一次页面的重排(reflow or layout thrashing),使mask的transition动画得以正常触发
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
    $scope.prec.init();
    $scope.prec.query();

  }]);