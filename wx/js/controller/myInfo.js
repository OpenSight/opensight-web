var wx_api = "http://api.opensight.cn/api/ivc/v1/wechat/";
app.controller('MyInfo', ['$scope', '$http', '$q', '$window',  function($scope, $http, $q, $window){
    $scope.unbind = (function () {

        $scope.aborter = $q.defer(),
            $http.delete (wx_api+"bindings/"
                +$.cookie('binding_id'), {
                timeout: $scope.aborter.promise
            }).success(function (response) {
                    $scope.customerlist.data = response;
                }).error(function (response,status) {
                    alert("解绑失败！");
                    /*
                    var tmpMsg = {};
                    tmpMsg.Label = "错误";
                    tmpMsg.ErrorContent = "获取用户列表失败";
                    tmpMsg.ErrorContentDetail = response;
                    tmpMsg.SingleButtonShown = true;
                    tmpMsg.MutiButtonShown = false;
                    //tmpMsg.Token =  $scope.camera.data_mod.addHotSpToken;
                    tmpMsg.Callback = "customer.show";
                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                        //$scope.$emit("Logout", tmpMsg);
                        $state.go('logOut',{info: response.info,traceback: response.traceback});
                    }else
                        $scope.$emit("Ctr1ModalShow", tmpMsg);
                        */

                });
    });






}]);
