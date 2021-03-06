app.register.controller('ShowSet', ['$rootScope', '$scope', '$http', '$q', '$window', '$stateParams', '$state', 'dateFactory', function($rootScope, $scope, $http, $q, $window, $stateParams, $state, dateFactory){
  $scope.showFun = (function () {
    return {
      init: function(){
        if ($rootScope.pShow === "" || $rootScope.pShow === undefined || $rootScope.pShow === null){
           var str = $.cookie('ProTemp');
           $rootScope.pShow = JSON.parse(str);
           $rootScope.PName = $rootScope.pShow.project_name;
           $.removeCookie('ProTemp');
        }
          var item = $rootScope.pShow;
          $scope.showFun.url = "http://api.opensight.cn/api/ivc/v1/projects/" + item.project_name + '/live_shows/' + item.uuid;
      },

      query: function() {
        $('#ToastTxt').html("正在获取活动信息");
        $('#loadingToast').show();
        $http.get($scope.showFun.url, {

        }).success(function(response) {
            $scope.showSet = response;
            $scope.recState = ($scope.showSet.flags === 1);
            if ($scope.showSet.desc.length > 20) $scope.descRow = 3;
            else $scope.descRow = 1;
            if ($scope.showSet.long_desc.length > 20) $scope.detailRow = 3;
            else $scope.detailRow = 1;
            setTimeout(function () {
              $('#loadingToast').hide();
            }, 100);
          }).error(function (response,status) {
            $('#ToastTxt').html("获取活动信息失败");
            $('#loadingToast').show();
            setTimeout(function () {
              $('#loadingToast').hide();
            }, 2000);
          });
      },

      backToLiveShowSwiper: function() {
        $state.go('liveShow');
      },

      op: function(operation, mes) {
        var tip = "确认要 " + mes + " 活动直播吗？";
        if (false === confirm(tip)) {
            return false;
        }
        var act = {
            op: operation
        };
        $http.post($scope.showFun.url, act).success(function(response) {
            $scope.showFun.refresh();
            $('#ToastTxt').html("操作成功");
            $('#loadingToast').show();
            setTimeout(function () {
                $('#loadingToast').hide();
            }, 2000);
        }).error(function(response, status) {
                $scope.showFun.refresh();
                $('#ToastTxt').html("操作失败");
                $('#loadingToast').show();
                setTimeout(function () {
                    $('#loadingToast').hide();
                }, 2000);

                console.log('error');
            });
    },

    enableRec: function() {
        if ($scope.showSet.flags === 1) $scope.showSet.flags = 0;
        else $scope.showSet.flags = 1;

       var modInfo = {
           flags: $scope.showSet.flags
       };

        $http.put($scope.showFun.url, modInfo).success(function(response) {
            $scope.showFun.refresh();
            $('#ToastTxt').html("设置成功");
            $('#loadingToast').show();
            setTimeout(function () {
                $('#loadingToast').hide();
            }, 2000);
        }).error(function(response, status) {
                $scope.showFun.refresh();
                $('#ToastTxt').html("设置失败");
                $('#loadingToast').show();
                setTimeout(function () {
                    $('#loadingToast').hide();
                }, 2000);
            });
    },

    web_go: function (wechat_url) {
        window.location.href = wechat_url;
        var str = JSON.stringify($rootScope.pShow);
        $.cookie('ProTemp', str);
    },

    refresh: function() {
        $scope.showFun.init();
        $scope.showFun.query();
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
  $scope.showFun.init();
  $scope.showFun.query();

}]);