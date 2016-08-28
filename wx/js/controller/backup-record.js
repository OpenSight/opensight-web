app.register.controller('BackupRecord', ['$rootScope', '$scope', '$http', '$q', '$window', '$stateParams', '$state', function($rootScope, $scope, $http, $q, $window, $stateParams, $state) {
  $scope.backuprecord = (function() {
    var padding = function(n) {
      if (10 > n) {
        return '0' + n;
      }
      return n.toString();
    };
    return {
      init: function() {
        $scope.caminfo = $rootScope.pCamera;
        $scope.recInfo = $rootScope.pRecInfo;

        $scope.start = new Date(Math.round($scope.recInfo.start / 1000 + $scope.recInfo.currentTime) * 1000);
        $scope.desc = $scope.caminfo.name + '_' + padding($scope.start.getMonth() + 1, 2) + padding($scope.start.getDate(), 2);
        $scope.duration = "5";
        $scope.long_desc = '';
      },
      backList: function() {
        // $scope.precplay.stopRec();
        //                $state.go('prec');
        window.history.back();
      },
      backup: function() {
        $('#ToastTxt').html("正在备份");
        $('#loadingToast').show();
        $http.post("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.caminfo.project_name + '/record/events', {
          desc: $scope.desc,
          camera_id: $scope.caminfo.uuid,
          start: $scope.start.getTime(),
          end: $scope.start.getTime() + parseInt($scope.duration, 10) * 60 *1000,
          long_desc: $scope.long_desc
        }).success(function(response) {
          setTimeout(function() {
            $('#loadingToast').hide();
          }, 100);
          window.history.back();
        }).error(function(response, status) {
          $('#ToastTxt').html("备份失败");
          $('#loadingToast').show();
          setTimeout(function() {
            $('#loadingToast').hide();
          }, 2000);
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
  $scope.backuprecord.init();

}]);
