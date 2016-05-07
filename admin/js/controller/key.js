app.register.controller('Key', ['$scope', '$http', '$q', function($scope, $http, $q){
    $scope.key = (function () {
        return {
            show: function () {
                $scope.destroy();
                $scope.authToken = G_token;
                $scope.key.addShown = false;
                $scope.keylist.get();
                return true;
            },

            refresh: function () {
                angular.forEach($scope.keylist.data.list, function (item, index, array) {
                    if ($scope.key.data_mod.bDetailShown && $scope.key.data_mod.bDetailShown[index] !== undefined)
                        $scope.key.data_mod.bDetailShown[index]  = false;
                });

                $scope.key.show();
            },

            add: function () {
                if ($scope.key.addShown === undefined) $scope.key.addShown = false;
                $scope.key.addShown = !$scope.key.addShown;
                if ($scope.key.addShown === true)
                    $scope.key.data_add.init();
            },

            data_add: (function () {
                return {
                    clean_data: function () {//clean add field
                        if ($scope.key.data_add === undefined)
                            $scope.key.data_add = {};
                        $scope.key.data_add.key_type = false;
                        $scope.key.data_add.enabled = true;
                        $scope.key.data_add.desc = "";
                    },

                    submitForm: function () {//add one key
                        var postData = {
                            key_type: (($scope.key.data_add.key_type === false)?0:1),
                            enabled: $scope.key.data_add.enabled,
                            desc: $scope.key.data_add.desc
                        };

                        $scope.key.data_add.token = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.post("http://api.opensight.cn/api/ivc/v1/users/" +G_user+ "/access_keys", postData, {
                                timeout: $scope.aborter.promise
                                /*                       headers:  {
                                 "Authorization" : "Bearer "+$scope.authToken,
                                 "Content-Type": "application/json"
                                 }
                                 */
                            }).success(function (response) {
                                    $scope.key.refresh();
                                }).error(function (response,status) {
                                    //response.ErrorContent = "添加key失败";
                                    //$scope.$emit("errorEmit",response);
                                    //bendichuliweimiao

                                    var tmpMsg = {};

                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "添加key失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.key.data_add.token;
                                    tmpMsg.Callback = "addMdCallBack";
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                        $scope.$emit("Logout", tmpMsg);
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    // $scope.key.refresh();
                                });
                    },

                    close: function () {//clean input,close add div
                        //$scope.key.data_add.clean_data();
                        //$scope.key.addShown = false;
                        $scope.key.add();
                    },

                    init: function () {
                        $scope.key.data_add.clean_data();
                    },

                    addMdCallBack:function (event, msg) {

                    }
                };
            })(),

            delete_one: function (item) {
                var r=confirm("确认删除key "+ item.key_id +"吗？");
                if (r===false) return;
                $scope.key.data.delOneToken = Math.random();
                $scope.aborter = $q.defer(),
                    $http.delete("http://api.opensight.cn/api/ivc/v1/access_keys/"+item.key_id, {
                        timeout: $scope.aborter.promise
                        /*                       headers:  {
                         "Authorization" : "Bearer "+$scope.authToken,
                         "Content-Type": "application/json"
                         }
                         */
                    }).success(function (response) {
                            $scope.key.refresh();
                        }).error(function (response,status) {
                            var tmpMsg = {};
                            tmpMsg.Label = "错误";
                            tmpMsg.ErrorContent = "删除key"+ item.key_id +"失败";
                            tmpMsg.ErrorContentDetail = response;
                            tmpMsg.SingleButtonShown = true;
                            tmpMsg.MutiButtonShown = false;
                            tmpMsg.Token =  $scope.key.data.delOneToken;
                            tmpMsg.Callback = "delMdCallBack";
                            if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                $scope.$emit("Logout", tmpMsg);
                            }else
                                $scope.$emit("Ctr1ModalShow", tmpMsg);
                            //$scope.key.refresh();
                        });
            },

            delMdCallBack:function (event, msg) {

            },

            data: (function () {
                return {
                    showDetail: function (item, index) {
                        if ($scope.key.data_mod.bDetailShown === undefined) $scope.key.data_mod.bDetailShown = [];
                        if ($scope.key.data_mod.bDetailShown[index] === undefined) $scope.key.data_mod.bDetailShown[index] = false;
                        $scope.key.data_mod.bDetailShown[index] = !(true === $scope.key.data_mod.bDetailShown[index]);
                        if ($scope.key.data_mod.bDetailShown[index] === true) {//开
                            $scope.key.data_mod.selectItem = item;
                            /*
                             if ($scope.key.data_mod.tabs===undefined)
                             $scope.key.data_mod.tabs = [];
                             $scope.key.data_mod.tabs[0] = true;
                             */
                            $scope.key.data_mod.initDetail(item, index);
                        } else {

                        }
                    }
                };
            })(),

            data_mod: (function () {
                return {
                    initData: function(item, index) {
                        if ($scope.key.data_mod.bDetailShown[index] === true) {
                            if ($scope.key.data_mod.data === undefined)
                                $scope.key.data_mod.data = [];
                            $scope.key.data_mod.data[index] = item;
                        }
                    },

                    initDetail: function (item, index) {
                        if ($scope.key.data_mod.bDetailShown[index] === undefined
                            || $scope.key.data_mod.bDetailShown[index] === false)
                            return;
                        $scope.key.data_mod.initData(item, index);


                    },

                    accessGet:function (item, index) {
                        //$scope.access.data_mod.updateCustomers = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.get("http://api.opensight.cn/api/ivc/v1/access_keys/"+item.key_id+"/secret", {
                                timeout: $scope.aborter.promise
                                /*                       headers:  {
                                 "Authorization" : "Bearer "+$scope.authToken,
                                 "Content-Type": "application/json"
                                 }
                                 */
                            }).success(function (response) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "secret信息";
                                    tmpMsg.ErrorContent = response.secret;
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = false;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.MessageShown = true;
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
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
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
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

    $scope.keylist = (function () {
        return {
            get: function () {//clean input,close add div
                $scope.key.data_add.clean_data();
                //$scope.key.addShown = false;
                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/users/" +G_user+ "/access_keys?start=0&limit=100", {
                        timeout: $scope.aborter.promise
                        /*                       headers:  {
                         "Authorization" : "Bearer "+$scope.authToken,
                         "Content-Type": "application/json"
                         }
                         */

                    }).success(function (response) {
                            $scope.keylist.data = response;
                        }).error(function (response,status) {
                            var tmpMsg = {};
                            tmpMsg.Label = "错误";
                            tmpMsg.ErrorContent = "获取key列表失败";
                            tmpMsg.ErrorContentDetail = response;
                            tmpMsg.SingleButtonShown = true;
                            tmpMsg.MutiButtonShown = false;
                            //tmpMsg.Token =  $scope.key.data_mod.addHotSpToken;
                            tmpMsg.Callback = "key.show";
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

    $scope.destroy = function () {
        if (undefined !== $scope.aborter) {
            $scope.aborter.resolve();
            delete $scope.aborter;
        }
    };

    $scope.$on('$destroy', $scope.destroy);
//    $scope.$on("newToken",$scope.keylist.getKey);
    /*
     $scope.$on("key.show",$scope.key.show);


     //add all callback
     $scope.$on('modMdCallBack', $scope.key.data_mod.modMdCallBack);
     $scope.$on('addMdCallBack', $scope.key.data_add.addMdCallBack);
     $scope.$on('delMdCallBack', $scope.key.delMdCallBack);
     */
    $scope.key.show();

//init key list
    //$scope.$emit("freshToken","key.show");

}]);
