app.register.controller('SignOutCtrl', ['$scope', '$http', '$q','$stateParams', function($scope, $http, $q, $stateParams){
    $scope.logOutToken = Math.random();
    var tmpMsg = {};
    /*
    $http.post('/signout').success(function(){
        $scope.$emit("Logout", tmpMsg);
    }).error(function(response) {
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "注销失败";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            tmpMsg.Token = $scope.logOutToken;
            tmpMsg.Callback = "logOutCallBack";
            $scope.$emit("Ctr1ModalShow", tmpMsg);
        });
        */
    if ($stateParams.info === null){
        tmpMsg.Label = "确认";
        tmpMsg.ErrorContent = "确定要离开管理页面吗？";
        tmpMsg.ErrorContentDetail = "登出后将跳转到登录页面";
    }
    else{
        tmpMsg.Label = "错误";
        tmpMsg.ErrorContent = $stateParams.info;
        tmpMsg.ErrorContentDetail = $stateParams.traceback;
    }

    tmpMsg.LogoutButtonShown = true;
    tmpMsg.SingleButtonShown = false;
    tmpMsg.MutiButtonShown = false;
    tmpMsg.Token = $scope.logOutToken;
    tmpMsg.Callback = "logOutCallBack";
    tmpMsg.logOutCallBack = "login.html";
    $scope.$emit("Ctr1ModalShow", tmpMsg);
}]);
