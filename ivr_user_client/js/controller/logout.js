app.register.controller('SignOutCtrl', function ($scope, $http, $location, $window) {
    $scope.logOutToken = Math.random();
    var tmpMsg = {};
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
});
