app.register.controller('UserInfo', ['$scope', '$http', '$q','$state', function($scope, $http, $q, $state){
    
    $scope.userinfo = (function () {
        return {
            data: (function () {
                return {
                    showDetail: function (item, index) {
                        if ($scope.userinfo.data_mod.bDetailShown === undefined) $scope.userinfo.data_mod.bDetailShown = false;
                        $scope.userinfo.data_mod.bDetailShown = !(true === $scope.userinfo.data_mod.bDetailShown);
                        if ($scope.userinfo.data_mod.bDetailShown === true) {//开
                            $scope.userinfo.data_mod.selectItem = item;
                            $scope.userinfo.data_mod.tabs[0].active = true;
                        } else {

                        }
                    }
                };
            })(),

            data_mod: (function () {
                return {
                    initData: function(item) {
                        $scope.userinfo.data_mod.data = item;
                    },

                    close: function() {
                        $scope.userinfo.data_mod.initDetail();
                    },

                    initDetail: function () {
                        if ($scope.userinfo.data_mod.tabs === undefined) $scope.userinfo.data_mod.tabs = [];
                        if ($scope.userinfo.data_mod.tabs[0] === undefined) $scope.userinfo.data_mod.tabs[0] = {};
                        $scope.userinfo.data_mod.tabs[0].active = true;
                        $scope.aborter = $q.defer(),
                            $http.get("http://121.41.72.231:5001/api/ivc/v1/users/"+G_user, {
                                timeout: $scope.aborter.promise,
                                headers:  {
                                    "Authorization" : "Bearer "+G_token,
                                    "Content-Type": "application/json"
                                }
                            }).success(function (response) {
                                    $scope.userinfo.data_mod.initData(response);
                                }).error(function (response,status) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "获取"+ G_user +"的userinfo失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    //tmpMsg.Token =  $scope.userinfo.data_mod.addHotSpToken;
                                    //tmpMsg.Callback = "modMdCallBack";
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined &&  response.info.indexOf("Token ")>=0)){
                                        //$scope.$emit("Logout", tmpMsg);
                                        $state.go('logOut',{info: response.info,traceback: response.traceback});
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                });
                    },

                    submitForm: function () {
                        var postData =  {
                            title: $scope.userinfo.data_mod.data.title,
                            desc: $scope.userinfo.data_mod.data.desc,
                            long_desc: $scope.userinfo.data_mod.data.long_desc,
                            email: $scope.userinfo.data_mod.data.email,
                            cellphone: $scope.userinfo.data_mod.data.cellphone
                        };

                       // $scope.userinfo.data_mod.modUserInfoToken = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.put("http://121.41.72.231:5001/api/ivc/v1/users/"+G_user, postData, {
                                timeout: $scope.aborter.promise,
                                headers:  {
                                    "Authorization" : "Bearer "+G_token,
                                    "Content-Type": "application/json"
                                }
                            }).success(function (response) {

                                }).error(function (response,status) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "更新用户 "+ G_user+" 的userinfo失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    //tmpMsg.Token =  $scope.userinfo.data_mod.modUserInfoToken;
                                    //tmpMsg.Callback = "modMdCallBack";
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined &&  response.info.indexOf("Token ")>=0)){
                                        //$scope.$emit("Logout", tmpMsg);
                                        $state.go('logOut',{info: response.info,traceback: response.traceback});
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    // $scope.userinfo.data_mod.hotRefresh(item, index);
                                });
                    },


                    initPasswd: function () {
                        $scope.userinfo.data_mod.old_password = "";
                        $scope.userinfo.data_mod.new_password = "";
                        $scope.userinfo.data_mod.new_password_confirm = "";
                    },

                    encryptPasswd: function (passwd) {
                        return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(passwd, G_salt, 100000));
                        //return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2("password", "salt", 1));
                    },


                    modPasswd: function () {
                        var tmpMsg = {};
                        tmpMsg.Label = "错误";
                        tmpMsg.ErrorContent = "修改用户 "+ G_user+" 的密码失败";
                        tmpMsg.SingleButtonShown = true;
                        tmpMsg.MutiButtonShown = false;

                       if ($scope.userinfo.data_mod.old_password === "" ||
                           $scope.userinfo.data_mod.new_password === "" ||
                           $scope.userinfo.data_mod.new_password_confirm === ""){
                           tmpMsg.ErrorContentDetail = "密码不能为空";
                           $scope.$emit("Ctr1ModalShow", tmpMsg);
                           return;
                       }else if ($scope.userinfo.data_mod.new_password !== $scope.userinfo.data_mod.new_password_confirm){
                           tmpMsg.ErrorContentDetail = "新密码填写不一致";
                           $scope.$emit("Ctr1ModalShow", tmpMsg);
                           return;
                       }

                        var postData =  {
                            old_password: $scope.userinfo.data_mod.encryptPasswd($scope.userinfo.data_mod.old_password),
                            new_password: $scope.userinfo.data_mod.encryptPasswd($scope.userinfo.data_mod.new_password)
                        };

                        // $scope.userinfo.data_mod.modUserInfoToken = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.put("http://121.41.72.231:5001/api/ivc/v1/users/"+G_user+"/password", postData, {
                                timeout: $scope.aborter.promise,
                                headers:  {
                                    "Authorization" : "Bearer "+G_token,
                                    "Content-Type": "application/json"
                                }
                            }).success(function (response) {

                                }).error(function (response,status) {
                                    tmpMsg.ErrorContentDetail = response;
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined &&  response.info.indexOf("Token ")>=0)){
                                        //$scope.$emit("Logout", tmpMsg);
                                        $state.go('logOut',{info: response.info,traceback: response.traceback});
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    // $scope.userinfo.data_mod.hotRefresh(item, index);
                                });

                    },



                    destroy: function () {
                    }
                };
            })()

        }
    })();


    $scope.destroy = function () {
        if (undefined !== $scope.aborter) {
            $scope.aborter.resolve();
            delete $scope.aborter;
        }
    };

    $scope.$on('$destroy', $scope.destroy);


//add all callback
    /*
    $scope.$on('modMdCallBack', $scope.userinfo.data_mod.modMdCallBack);
    $scope.$on('addMdCallBack', $scope.userinfo.data_add.addMdCallBack);
    $scope.$on('delMdCallBack', $scope.userinfo.delMdCallBack);
*/


//init userinfo


    $scope.userinfo.data_mod.initDetail();

}]);
