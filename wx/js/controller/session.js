app.register.controller('Session', ['$scope', '$http', '$q', function($scope, $http, $q){
    $scope.session = (function () {
        return {
            show: function () {
                $scope.destroy();
                $scope.authToken = G_token;
                $scope.sessionlist.get();
                return true;
            },

            refresh: function () {
                angular.forEach($scope.sessionlist.data.list, function (item, index, array) {
                    if ($scope.session.data_mod.bDetailShown && $scope.session.data_mod.bDetailShown[index] !== undefined)
                        $scope.session.data_mod.bDetailShown[index]  = false;
                });

                $scope.session.show();
            },

            data: (function () {
                return {
                    showDetail: function (item, index) {
                        if ($scope.session.data_mod.bDetailShown === undefined) $scope.session.data_mod.bDetailShown = [];
                        if ($scope.session.data_mod.bDetailShown[index] === undefined) $scope.session.data_mod.bDetailShown[index] = false;
                        $scope.session.data_mod.bDetailShown[index] = !(true === $scope.session.data_mod.bDetailShown[index]);
                        if ($scope.session.data_mod.bDetailShown[index] === true) {//开
                            $scope.session.data_mod.selectItem = item;
                            $scope.session.data_mod.initDetail(item, index);
                        } else {

                        }
                    }
                };
            })(),

            data_mod: (function () {
                return {
                    initData: function(item, index) {
                        if ($scope.session.data_mod.bDetailShown[index] === true) {
                            if ($scope.session.data_mod.data === undefined)
                                $scope.session.data_mod.data = [];
                            $scope.session.data_mod.data[index] = item;
                        }
                    },

                    initDetail: function (item, index) {
                        if ($scope.session.data_mod.bDetailShown[index] === undefined
                            || $scope.session.data_mod.bDetailShown[index] === false)
                            return;

                        $scope.session.data_mod.initData(item, index);
                    },


                    destroy: function () {
                    }
                };
            })()

        }
    })();

    $scope.sessionlist = (function () {
        return {
            get: function () {
                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/sessions?start=0&limit=100", {
                        timeout: $scope.aborter.promise
 /*                       headers:  {
                            "Authorization" : "Bearer "+$scope.authToken,
                            "Content-Type": "application/json"
                        }
*/
                    }).success(function (response) {
                            $scope.sessionlist.data = response;
                        }).error(function (response,status) {
                            var tmpMsg = {};
                            tmpMsg.Label = "错误";
                            tmpMsg.ErrorContent = "获取会话列表失败";
                            tmpMsg.ErrorContentDetail = response;
                            tmpMsg.SingleButtonShown = true;
                            tmpMsg.MutiButtonShown = false;
                            //tmpMsg.Token =  $scope.session.data_mod.addHotSpToken;
                            tmpMsg.Callback = "session.show";
                            if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                $scope.$emit("Logout", tmpMsg);
                            }else
                                $scope.$emit("Ctr1ModalShow", tmpMsg);

                        });

            }

        };
    })();

    $scope.destroy = function () {
        if (undefined !== $scope.aborter) {
            $scope.aborter.resolve();
            delete $scope.aborter;
        }
    };

    $scope.$on('$destroy', $scope.destroy);
    $scope.session.show();
}]);
