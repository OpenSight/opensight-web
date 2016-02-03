app.register.controller('Access', ['$scope', '$http', '$q', function($scope, $http, $q){
    $scope.access = (function () {
        return {
            show: function () {
                $scope.destroy();
                $scope.authToken = G_token;
                $scope.accesslist.get();
                return true;
            },

            refresh: function () {
                angular.forEach($scope.accesslist.data.list, function (item, index, array) {
                    if ($scope.access.data_mod.bDetailShown && $scope.access.data_mod.bDetailShown[index] !== undefined)
                        $scope.access.data_mod.bDetailShown[index]  = false;
                });

                $scope.access.show();
            },

            add: function () {
                if ($scope.access.addShown === undefined) $scope.access.addShown = false;
                $scope.access.addShown = !$scope.access.addShown;
                if ($scope.access.addShown === true)
                    $scope.access.data_add.init();
            },

            data_add: (function () {
                return {
                    clean_data: function () {//clean add field
                        if ($scope.access.data_add === undefined)
                            $scope.access.data_add = {};
                        $scope.access.data_add.key_type = false;
                        $scope.access.data_add.enabled = true;
                        $scope.access.data_add.desc = "";
                        $scope.access.data_add.username = "";
                    },

                    submitForm: function () {//add one access
                        var postData = {
                            key_type: (($scope.access.data_add.key_type === false)?0:1),
                            enabled: $scope.access.data_add.enabled,
                            desc: $scope.access.data_add.desc,
                            username: $scope.access.data_add.username
                        };

                        $scope.access.data_add.token = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.post("http://121.41.72.231:5001/api/ivc/v1/access_keys", postData, {
                                timeout: $scope.aborter.promise,
                                headers:  {
                                    "Authorization" : "Bearer "+$scope.authToken,
                                    "Content-Type": "application/json"
                                }
                            }).success(function (response) {
                                    $scope.access.refresh();
                                }).error(function (response,status) {
                                    //response.ErrorContent = "添加access失败";
                                    //$scope.$emit("errorEmit",response);
                                    //bendichuliweimiao

                                    var tmpMsg = {};

                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "添加access key失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.access.data_add.token;
                                    tmpMsg.Callback = "addMdCallBack";
                                    if (status === 403 || (response!==undefined && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                        $scope.$emit("Logout", tmpMsg);
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    // $scope.access.refresh();
                                });
                    },

                    close: function () {//clean input,close add div
                        //$scope.access.data_add.clean_data();
                        //$scope.access.addShown = false;
                        $scope.access.add();
                    },

                    init: function () {
                        $scope.access.data_add.clean_data();
                    },

                    addMdCallBack:function (event, msg) {

                    }
                };
            })(),

            delete_one: function (item) {
                $scope.access.data.delOneToken = Math.random();
                $scope.aborter = $q.defer(),
                    $http.delete("http://121.41.72.231:5001/api/ivc/v1/access_keys/"+item.key_id, {
                        timeout: $scope.aborter.promise,
                        headers:  {
                            "Authorization" : "Bearer "+$scope.authToken,
                            "Content-Type": "application/json"
                        }
                    }).success(function (response) {
                            $scope.access.refresh();
                        }).error(function (response,status) {
                            var tmpMsg = {};
                            tmpMsg.Label = "错误";
                            tmpMsg.ErrorContent = "删除access key"+ item.key_id +"失败";
                            tmpMsg.ErrorContentDetail = response;
                            tmpMsg.SingleButtonShown = true;
                            tmpMsg.MutiButtonShown = false;
                            tmpMsg.Token =  $scope.access.data.delOneToken;
                            tmpMsg.Callback = "delMdCallBack";
                            if (status === 403 || (response!==undefined && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                $scope.$emit("Logout", tmpMsg);
                            }else
                                $scope.$emit("Ctr1ModalShow", tmpMsg);
                            //$scope.access.refresh();
                        });
            },

            delMdCallBack:function (event, msg) {

            },

            data: (function () {
                return {
                    showDetail: function (item, index) {
                        if ($scope.access.data_mod.bDetailShown === undefined) $scope.access.data_mod.bDetailShown = [];
                        if ($scope.access.data_mod.bDetailShown[index] === undefined) $scope.access.data_mod.bDetailShown[index] = false;
                        $scope.access.data_mod.bDetailShown[index] = !(true === $scope.access.data_mod.bDetailShown[index]);
                        if ($scope.access.data_mod.bDetailShown[index] === true) {//开
                            $scope.access.data_mod.selectItem = item;
                            $scope.access.data_mod.initDetail(item, index);
                        } else {

                        }
                    }
                };
            })(),

            data_mod: (function () {
                return {
                    initData: function(item, index) {
                        if ($scope.access.data_mod.bDetailShown[index] === true) {
                            if ($scope.access.data_mod.data === undefined)
                                $scope.access.data_mod.data = [];
                            $scope.access.data_mod.data[index] = item;
                        }
                    },

                    initDetail: function (item, index) {
                        if ($scope.access.data_mod.bDetailShown[index] === undefined
                            || $scope.access.data_mod.bDetailShown[index] === false)
                            return;

                        $scope.aborter = $q.defer(),
                            $http.get("http://121.41.72.231:5001/api/ivc/v1/access_keys/"+item.key_id, {
                                timeout: $scope.aborter.promise,
                                headers:  {
                                    "Authorization" : "Bearer "+$scope.authToken,
                                    "Content-Type": "application/json"
                                }
                            }).success(function (response) {
                                    $scope.access.data_mod.initData(response, index);
                                }).error(function (response,status) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "用户"+ $scope.access.data_mod.selectItem.username +"详细信息get失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.access.data_mod.addHotSpToken;
                                    tmpMsg.Callback = "modMdCallBack";
                                    if (status === 403 || (response!==undefined && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                        $scope.$emit("Logout", tmpMsg);
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    //$scope.access.data_mod.refresh(item, index);
                                });


                    },

                    submitForm: function (item, index) {//mod one access
                        var postData = {
                            enabled: $scope.access.data_mod.data[index].enabled,
                            desc: $scope.access.data_mod.data[index].desc
                        };

                        $scope.access.data_add.token = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.put("http://121.41.72.231:5001/api/ivc/v1/access_keys/"+item.key_id, postData, {
                                timeout: $scope.aborter.promise,
                                headers:  {
                                    "Authorization" : "Bearer "+$scope.authToken,
                                    "Content-Type": "application/json"
                                }
                            }).success(function (response) {
                                   // $scope.access.refresh();
                                }).error(function (response,status) {
                                    //response.ErrorContent = "添加access失败";
                                    //$scope.$emit("errorEmit",response);
                                    //bendichuliweimiao

                                    var tmpMsg = {};

                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "修改access key失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.access.data_add.token;
                                    tmpMsg.Callback = "addMdCallBack";
                                    if (status === 403 || (response!==undefined && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                        $scope.$emit("Logout", tmpMsg);
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    // $scope.access.refresh();
                                });
                    },

                    close: function (item, index) {
                        $scope.access.data_mod.initDetail(item, index);
                    },

                    accessGet:function (item, index) {
                        //$scope.access.data_mod.updateCustomers = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.get("http://121.41.72.231:5001/api/ivc/v1/access_keys/"+item.key_id+"/secret", {
                                timeout: $scope.aborter.promise,
                                headers:  {
                                    "Authorization" : "Bearer "+$scope.authToken,
                                    "Content-Type": "application/json"
                                }
                            }).success(function (response) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "secret信息";
                                    tmpMsg.ErrorContent = response.secret;
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = false;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.MessageShown = true;
                                    if (status === 403 || (response!==undefined && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                        $scope.$emit("Logout", tmpMsg);
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);
                                }).error(function (response,status) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "获取密钥失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.access.data_mod.addHotSpToken;
                                    tmpMsg.Callback = "modMdCallBack";
                                    if (status === 403 || (response!==undefined && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                        $scope.$emit("Logout", tmpMsg);
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    // $scope.access.data_mod.refresh(item, index);
                                });

                    },

                    modMdCallBack:function (event, msg) {

                    },

                    destroy: function () {
                    }
                };
            })()

        }
    })();

    $scope.accesslist = (function () {
        return {
            get: function () {//clean input,close add div
                $scope.access.data_add.clean_data();
                //$scope.access.addShown = false;
                $scope.aborter = $q.defer(),
                    $http.get("http://121.41.72.231:5001/api/ivc/v1/access_keys?start=0&limit=100", {
                        timeout: $scope.aborter.promise,
                        headers:  {
                            "Authorization" : "Bearer "+$scope.authToken,
                            "Content-Type": "application/json"
                        }

                    }).success(function (response) {
                            $scope.accesslist.data = response;
                        }).error(function (response,status) {
                            var tmpMsg = {};
                            tmpMsg.Label = "错误";
                            tmpMsg.ErrorContent = "获取access key列表失败";
                            tmpMsg.ErrorContentDetail = response;
                            tmpMsg.SingleButtonShown = true;
                            tmpMsg.MutiButtonShown = false;
                            //tmpMsg.Token =  $scope.access.data_mod.addHotSpToken;
                            tmpMsg.Callback = "access.show";
                            if (status === 403 || (response!==undefined && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                $scope.$emit("Logout", tmpMsg);
                            }else
                                $scope.$emit("Ctr1ModalShow", tmpMsg);

                        });

            },
            getKey: function (event, newaccess) {
                $scope.authToken = newaccess;
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
    $scope.$on("newToken",$scope.accesslist.getKey);
    /*
     $scope.$on("access.show",$scope.access.show);


     //add all callback
     $scope.$on('modMdCallBack', $scope.access.data_mod.modMdCallBack);
     $scope.$on('addMdCallBack', $scope.access.data_add.addMdCallBack);
     $scope.$on('delMdCallBack', $scope.access.delMdCallBack);
     */
    $scope.access.show();

//init access list
    //$scope.$emit("freshToken","access.show");

}]);
