app.register.controller('Stats', ['$scope', '$http', '$q','$state','$window', function($scope, $http, $q, $state, $window){
    $scope.state = {};
    $scope.state.userCount =  "获取中";
    $scope.state.userOnline =  "获取中";
    $scope.state.projectCount =  "获取中";
    $scope.state.cameraCount =  "获取中";
    $scope.state.cameraOnline =  "获取中";
    $scope.state.cameraOffline =  "获取中";
    $scope.authToken = G_token;

    $scope.projectlist = (function () {
        return {
            get: function () {
                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/projects?start=0&limit=100", {
                        timeout: $scope.aborter.promise,
                        headers:  {
                            "Authorization" : "Bearer "+$scope.authToken,
                            "Content-Type": "application/json"
                        }

                    }).success(function (response) {
                            if (response!==undefined)
                                $scope.state.projectCount = response.total;
                        }).error(function (response,status) {
                            $scope.state.projectCount =  "获取失败";
                            var tmpMsg = {};
                            tmpMsg.Label = "错误";
                            tmpMsg.ErrorContent = "获取项目列表失败";
                            tmpMsg.ErrorContentDetail = response;
                            tmpMsg.SingleButtonShown = true;
                            tmpMsg.MutiButtonShown = false;
                            
                            //tmpMsg.Token =  $scope.project.data_mod.addHotSpToken;
                            tmpMsg.Callback = "project.show";
                            if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                //$scope.$emit("Logout", tmpMsg);
                                $state.go('logOut',{info: response.info,traceback: response.traceback});
                            }else
                                $scope.$emit("Ctr1ModalShow", tmpMsg);

                        });

            },
            getKey: function (event, newkey) {
                $scope.authToken = newkey;
            }


        };
    })();

    $scope.customerlist = (function () {
        return {
            get: function () {
                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/users?start=0&limit=100", {
                        timeout: $scope.aborter.promise,
                        headers:  {
                            "Authorization" : "Bearer "+$scope.authToken,
                            "Content-Type": "application/json"
                        }

                    }).success(function (response) {
                            if (response!==undefined)
                                $scope.state.userCount = response.total;
                        }).error(function (response,status) {
                            $scope.state.userCount =  "获取失败";
                            var tmpMsg = {};
                            tmpMsg.Label = "错误";
                            tmpMsg.ErrorContent = "获取用户列表失败";
                            tmpMsg.ErrorContentDetail = response;
                            tmpMsg.SingleButtonShown = true;
                            tmpMsg.MutiButtonShown = false;
                            //tmpMsg.Token =  $scope.customer.data_mod.addHotSpToken;
                            tmpMsg.Callback = "customer.show";
                            if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                $scope.$emit("Logout", tmpMsg);
                            }else
                                $scope.$emit("Ctr1ModalShow", tmpMsg);

                        });

            },
            getKey: function (event, newkey) {
                $scope.authToken = newkey;
            }


        };
    })();

    $scope.projectlist.get();
    $scope.customerlist.get();
}]);

