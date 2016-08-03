app.register.controller('PRecPlay', ['$rootScope', '$scope', '$http', '$q', '$window', '$stateParams', '$state', function($rootScope, $scope, $http, $q, $window, $stateParams, $state) {
  $scope.precplay = (function() {
    return {
      init: function() {
        $scope.recInfo = $rootScope.pRecInfo;
        var player = document.getElementById("replayPlayer");
        $rootScope.RecPlayer = player;
        player.src = $scope.recInfo.hls;
        player.load();
        player.play();
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
      goBackup: function(){
        $scope.recInfo.currentTime = document.getElementById("replayPlayer").currentTime;
        // $rootScope.pRecInfo = $scope.recInfo;
        $state.go('backuprecord');
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
