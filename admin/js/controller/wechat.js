app.register.controller('WeChat', ['$scope', '$http', '$q', 'pageFactory', function($scope, $http, $q, pageFactory) {
  var api = 'http://api.opensight.cn/api/ivc/v1/wechat/bindings';
  var query = function(params) {
    $scope.aborter = $q.defer();
    $http.get(api, {
      params: params,
      timeout: $scope.aborter.promise
    }).success(function(response) {
      $scope.data = response;
      pageFactory.set(response, params);
    }).error(function(response, status) {
      var tmpMsg = {
        Label: '错误',
        ErrorContent: '获取微信用户列表失败',
        ErrorContentDetail: response,
        SingleButtonShown: true,
        MutiButtonShown: false
      };
      if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
        $state.go('logOut', { info: response.info, traceback: response.traceback });
      } else {
        $scope.$emit("Ctr1ModalShow", tmpMsg);
      }
    });
  };

  (function() {
    $scope.page = pageFactory.init({
      query: query,
      jumperror: function() {
        alert('页码输入不正确。');
      }
    });

    var params = {
      start: 0,
      limit: $scope.page.limit
    };
    query(params);
  })();

  $scope.detail = [];
  $scope.showDetail = function(item, index) {
    if (true === item.bDetailShown) {
      item.bDetailShown = false;
    } else {
      item.bDetailShown = true;
      $scope.detail[index] = angular.copy(item);
    }
  };
  $scope.remove = function(item, index) {
    if (false === confirm("是否解除微信绑定？")) {
      return;
    }
    $scope.aborter = $q.defer();
    $http.delete(api + '/' + item.binding_id, {
      timeout: $scope.aborter.promise
    }).success(function(response) {
      $scope.page.pageChanged();
    }).error(function(response, status) {
      var tmpMsg = {};
      tmpMsg.Label = "错误";
      tmpMsg.ErrorContent = "解除绑定失败";
      tmpMsg.ErrorContentDetail = response;
      tmpMsg.SingleButtonShown = true;
      tmpMsg.MutiButtonShown = false;
      if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
        //$scope.$emit("Logout", tmpMsg);
        $state.go('logOut', { info: response.info, traceback: response.traceback });
      } else {
        $scope.$emit("Ctr1ModalShow", tmpMsg);
      }
    });
  };

  $scope.destroy = function() {
    if (undefined !== $scope.aborter) {
      $scope.aborter.resolve();
      delete $scope.aborter;
    }
  };

  $scope.$on('$destroy', $scope.destroy);
}]);
