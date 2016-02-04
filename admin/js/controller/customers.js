app.register.controller('Customers', ['$scope', '$http', '$q', function($scope, $http, $q){
    $scope.customer = (function () {
        return {
            show: function () {
                $scope.destroy();
                $scope.authToken = G_token;
                $scope.trHidden = [];
                $scope.trHidden[0] = false;
                $scope.trHidden[1] = true;
                $scope.customerlist.get();
                return true;
            },

            refresh: function () {
                angular.forEach($scope.customerlist.data.list, function (item, index, array) {
                    if ($scope.customer.data_mod.bDetailShown && $scope.customer.data_mod.bDetailShown[index] !== undefined)
                        $scope.customer.data_mod.bDetailShown[index]  = false;
                });

                $scope.customer.show();
            },

            add: function () {
                if ($scope.customer.addShown === undefined) $scope.customer.addShown = false;
                $scope.customer.addShown = !$scope.customer.addShown;
                if ($scope.customer.addShown === true)
                    $scope.customer.data_add.init();
            },

            encryptPasswd: function (passwd) {
                return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(passwd, G_salt, 100000));
                //return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2("password", "salt", 1));
            },

            data_add: (function () {
                return {
                    clean_data: function () {//clean add field
                        if ($scope.customer.data_add === undefined)
                            $scope.customer.data_add = {};
                        $scope.customer.data_add.username = "";
                        $scope.customer.data_add.password = "";
                        $scope.customer.data_add.is_privilege = false;
                        $scope.customer.data_add.title = "";
                        $scope.customer.data_add.flags = 0;
                        $scope.customer.data_add.cellphone = "";
                        $scope.customer.data_add.email = "";
                        $scope.customer.data_add.desc = "";
                        $scope.customer.data_add.long_desc = "";
                    },

                    submitForm: function () {//add one customer
                        var postData = {
                            username: $scope.customer.data_add.username,
                            title: $scope.customer.data_add.title,
                            password: $scope.customer.encryptPasswd($scope.customer.data_add.password),
                            is_privilege: $scope.customer.data_add.is_privilege,
                            desc: $scope.customer.data_add.desc,
                            long_desc: $scope.customer.data_add.long_desc,
                            flags: $scope.customer.data_add.flags,
                            cellphone: $scope.customer.data_add.cellphone,
                            email: $scope.customer.data_add.email
                        };

                        $scope.customer.data_add.token = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.post("http://121.41.72.231:5001/api/ivc/v1/users", postData, {
                                timeout: $scope.aborter.promise,
                                headers:  {
                                    "Authorization" : "Bearer "+$scope.authToken,
                                    "Content-Type": "application/json"
                                }
                            }).success(function (response) {
                                    $scope.customer.refresh();
                                }).error(function (response,status) {
                                    //response.ErrorContent = "添加customer失败";
                                    //$scope.$emit("errorEmit",response);
                                    //bendichuliweimiao

                                    var tmpMsg = {};

                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "添加用户失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.customer.data_add.token;
                                    tmpMsg.Callback = "addMdCallBack";
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                        $scope.$emit("Logout", tmpMsg);
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    // $scope.customer.refresh();
                                });
                    },

                    close: function () {//clean input,close add div
                        //$scope.customer.data_add.clean_data();
                        //$scope.customer.addShown = false;
                        $scope.customer.add();
                    },

                    init: function () {
                        $scope.customer.data_add.clean_data();
                    },

                    addMdCallBack:function (event, msg) {

                    }
                };
            })(),

            delete_one: function (item) {
                $scope.customer.data.delOneToken = Math.random();
                $scope.aborter = $q.defer(),
                    $http.delete("http://121.41.72.231:5001/api/ivc/v1/users/"+item.username, {
                        timeout: $scope.aborter.promise,
                        headers:  {
                            "Authorization" : "Bearer "+$scope.authToken,
                            "Content-Type": "application/json"
                        }
                    }).success(function (response) {
                            $scope.customer.refresh();
                        }).error(function (response,status) {
                            var tmpMsg = {};
                            tmpMsg.Label = "错误";
                            tmpMsg.ErrorContent = "删除用户"+ item.username +"失败";
                            tmpMsg.ErrorContentDetail = response;
                            tmpMsg.SingleButtonShown = true;
                            tmpMsg.MutiButtonShown = false;
                            tmpMsg.Token =  $scope.customer.data.delOneToken;
                            tmpMsg.Callback = "delMdCallBack";
                            if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                $scope.$emit("Logout", tmpMsg);
                            }else
                                $scope.$emit("Ctr1ModalShow", tmpMsg);
                            //$scope.customer.refresh();
                        });
            },

            delMdCallBack:function (event, msg) {

            },

            data: (function () {
                return {
                    showDetail: function (item, index) {
                        if ($scope.customer.data_mod.bDetailShown === undefined) $scope.customer.data_mod.bDetailShown = [];
                        if ($scope.customer.data_mod.bDetailShown[index] === undefined) $scope.customer.data_mod.bDetailShown[index] = false;
                        $scope.customer.data_mod.bDetailShown[index] = !(true === $scope.customer.data_mod.bDetailShown[index]);
                        if ($scope.customer.data_mod.bDetailShown[index] === true) {//开
                            $scope.customer.data_mod.selectItem = item;
                            /*
                            if ($scope.customer.data_mod.tabs===undefined)
                                $scope.customer.data_mod.tabs = [];
                            $scope.customer.data_mod.tabs[0] = true;
                            */
                            $scope.customer.data_mod.initDetail(item, index);
                        } else {

                        }
                    }
                };
            })(),

            data_mod: (function () {
                return {
                    initData: function(item, index) {
                        if ($scope.customer.data_mod.bDetailShown[index] === true) {
                            if ($scope.customer.data_mod.data === undefined)
                                $scope.customer.data_mod.data = [];
                            $scope.customer.data_mod.data[index] = item;
                        }
                    },

                    initDetail: function (item, index) {
                        if ($scope.customer.data_mod.bDetailShown[index] === undefined
                            || $scope.customer.data_mod.bDetailShown[index] === false)
                            return;

                        $scope.aborter = $q.defer(),
                            $http.get("http://121.41.72.231:5001/api/ivc/v1/users/"+$scope.customer.data_mod.selectItem.username, {
                                timeout: $scope.aborter.promise,
                                headers:  {
                                    "Authorization" : "Bearer "+$scope.authToken,
                                    "Content-Type": "application/json"
                                }
                            }).success(function (response) {
                                    $scope.customer.data_mod.initData(response, index);
                                }).error(function (response,status) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "用户"+ $scope.customer.data_mod.selectItem.username +"详细信息get失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.customer.data_mod.addHotSpToken;
                                    tmpMsg.Callback = "modMdCallBack";
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                        $scope.$emit("Logout", tmpMsg);
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    //$scope.customer.data_mod.refresh(item, index);
                                });
                    },

                    submitForm: function (item, index) {
                        var postData =  {
                            cellphone: $scope.customer.data_mod.data[index].cellphone,
                            title: $scope.customer.data_mod.data[index].title,
                            desc: $scope.customer.data_mod.data[index].desc,
                            long_desc: $scope.customer.data_mod.data[index].long_desc,
                            email: $scope.customer.data_mod.data[index].email
                        };

                        $scope.customer.data_mod.updateCustomers = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.put("http://121.41.72.231:5001/api/ivc/v1/users/"+$scope.customer.data_mod.selectItem.username, postData, {
                                timeout: $scope.aborter.promise,
                                headers:  {
                                    "Authorization" : "Bearer "+$scope.authToken,
                                    "Content-Type": "application/json"
                                }
                            }).success(function (response) {
                                    $scope.customer.refresh();
                                }).error(function (response,status) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "用户"+ $scope.customer.data_mod.name+"更新用户失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.customer.data_mod.addHotSpToken;
                                    tmpMsg.Callback = "modMdCallBack";
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                        $scope.$emit("Logout", tmpMsg);
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    // $scope.customer.data_mod.refresh(item, index);
                                });
                    },
                    close: function (item, index) {
                        $scope.customer.data_mod.initDetail(item, index);
                    },
                    passwdReset:function (item, index) {
                        var postData =  {
                            new_password: $scope.customer.encryptPasswd($scope.customer.data_mod.data[index].new_password)
                        };

                        //$scope.customer.data_mod.updateCustomers = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.post("http://121.41.72.231:5001/api/ivc/v1/users/"+$scope.customer.data_mod.selectItem.username+"/password_reset", postData, {
                                timeout: $scope.aborter.promise,
                                headers:  {
                                    "Authorization" : "Bearer "+$scope.authToken,
                                    "Content-Type": "application/json"
                                }
                            }).success(function (response) {
                                    //$scope.customer.data_mod.refresh(item, index);
                                }).error(function (response,status) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "用户"+ $scope.customer.data_mod.selectItem.username+"重置用户密码失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.customer.data_mod.addHotSpToken;
                                    tmpMsg.Callback = "modMdCallBack";
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                        $scope.$emit("Logout", tmpMsg);
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    // $scope.customer.data_mod.refresh(item, index);
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

    $scope.customerlist = (function () {
        return {
            get: function () {//clean input,close add div
                $scope.customer.data_add.clean_data();
                //$scope.customer.addShown = false;
                $scope.aborter = $q.defer(),
                    $http.get("http://121.41.72.231:5001/api/ivc/v1/users?start=0&limit=100", {
                        timeout: $scope.aborter.promise,
                        headers:  {
                            "Authorization" : "Bearer "+$scope.authToken,
                            "Content-Type": "application/json"
                        }

                    }).success(function (response) {
                            $scope.customerlist.data = response;
                        }).error(function (response,status) {
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

    $scope.destroy = function () {
        if (undefined !== $scope.aborter) {
            $scope.aborter.resolve();
            delete $scope.aborter;
        }
    };

    $scope.$on('$destroy', $scope.destroy);
    $scope.$on("newToken",$scope.customerlist.getKey);
    /*
    $scope.$on("customer.show",$scope.customer.show);


//add all callback
    $scope.$on('modMdCallBack', $scope.customer.data_mod.modMdCallBack);
    $scope.$on('addMdCallBack', $scope.customer.data_add.addMdCallBack);
    $scope.$on('delMdCallBack', $scope.customer.delMdCallBack);
     */
    $scope.customer.show();

//init customer list
    //$scope.$emit("freshToken","customer.show");

}]);
