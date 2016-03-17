app.register.controller('FirmWare', ['$scope', '$http', '$q', function($scope, $http, $q){
    $scope.firmware = (function () {
        return {
            show: function () {
                $scope.destroy();
                $scope.firmware.addShown = false;
                $scope.firmwarelist.searchKeyOptionsData = [
                    {
                        name: "项目名称",
                        key: "project_name"
                    },
                    {
                        name: "固件ID",
                        key: "uuid"
                    },
                    {
                        name: "详细描述",
                        key: "long_desc"
                    },
                    {
                        name: "描述",
                        key: "desc"
                    },
                    {
                        name: "设备厂家",
                        key: "vendor"
                    },
                    {
                        name: "设备硬件",
                        key: "hardware_model"
                    },
                    {
                        name: "设备固件",
                        key: "firmware_model"
                    }
                ];
                $scope.firmwarelist.seachKey = $scope.firmwarelist.searchKeyOptionsData[0].key;
                $scope.firmwarelist.seachValue = "";
                $scope.firmwarelist.get();
                return true;
            },
            search: function () {//clean input,close add div
                $scope.firmware.data_add.clean_data();
                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/firmwares?filter_key="
                        +$scope.firmwarelist.seachKey+"&filter_value="+$scope.firmwarelist.seachValue+
                        "&start=0&limit=100", {
                        timeout: $scope.aborter.promise
                        /*                       headers:  {
                         "Authorization" : "Bearer "+$scope.authToken,
                         "Content-Type": "application/json"
                         }
                         */

                    }).success(function (response) {
                            $scope.firmwarelist.data = response;
                        }).error(function (response,status) {
                            var tmpMsg = {};
                            tmpMsg.Label = "错误";
                            tmpMsg.ErrorContent = "获取固件列表失败";
                            tmpMsg.ErrorContentDetail = response;
                            tmpMsg.SingleButtonShown = true;
                            tmpMsg.MutiButtonShown = false;
                            //tmpMsg.Token =  $scope.camera.data_mod.addHotSpToken;
                            tmpMsg.Callback = "firmware.show";
                            if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                //$scope.$emit("Logout", tmpMsg);
                                $state.go('logOut',{info: response.info,traceback: response.traceback});
                            }else
                                $scope.$emit("Ctr1ModalShow", tmpMsg);

                        });

            },
            refresh: function () {
                angular.forEach($scope.firmwarelist.data.list, function (item, index, array) {
                    if ($scope.firmware.data_mod.bDetailShown && $scope.firmware.data_mod.bDetailShown[index] !== undefined)
                        $scope.firmware.data_mod.bDetailShown[index]  = false;
                });

                $scope.firmware.show();
            },

            add: function () {
                if ($scope.firmware.addShown === undefined) $scope.firmware.addShown = false;
                $scope.firmware.addShown = !$scope.firmware.addShown;
                if ($scope.firmware.addShown === true)
                    $scope.firmware.data_add.init();
            },

            data_add: (function () {
                return {
                    clean_data: function () {//clean add field
                        if ($scope.firmware.data_add === undefined)
                            $scope.firmware.data_add = {};
                        $scope.firmware.data_add.vendor = "";
                        $scope.firmware.data_add.hardware_model = "";
                        $scope.firmware.data_add.firmware_model = "";
                        $scope.firmware.data_add.firmware_url = "";
                        $scope.firmware.data_add.project_name = "";
                        $scope.firmware.data_add.desc = "";
                        $scope.firmware.data_add.long_desc = "";
                    },

                    submitForm: function () {//add one firmware
                        var postData = {
                            vendor: $scope.firmware.data_add.vendor,
                            hardware_model: $scope.firmware.data_add.hardware_model,
                            firmware_model: $scope.firmware.data_add.firmware_model,
                            desc: $scope.firmware.data_add.desc,
                            long_desc: $scope.firmware.data_add.long_desc,
                            project_name: $scope.firmware.data_add.project_name,
                            firmware_url: $scope.firmware.data_add.firmware_url
                        };

                        $scope.firmware.data_add.token = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.post("http://api.opensight.cn/api/ivc/v1/firmwares", postData, {
                                timeout: $scope.aborter.promise
                                /*                       headers:  {
                                 "Authorization" : "Bearer "+$scope.authToken,
                                 "Content-Type": "application/json"
                                 }
                                 */
                            }).success(function (response) {
                                    $scope.firmware.refresh();
                                }).error(function (response,status) {
                                    //response.ErrorContent = "添加firmware失败";
                                    //$scope.$emit("errorEmit",response);
                                    //bendichuliweimiao

                                    var tmpMsg = {};

                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "添加固件失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.firmware.data_add.token;
                                    tmpMsg.Callback = "addMdCallBack";
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                        $scope.$emit("Logout", tmpMsg);
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    // $scope.firmware.refresh();
                                });
                    },

                    close: function () {//clean input,close add div
                        //$scope.firmware.data_add.clean_data();
                        //$scope.firmware.addShown = false;
                        $scope.firmware.add();
                    },

                    init: function () {
                        $scope.firmware.data_add.clean_data();
                    },

                    addMdCallBack:function (event, msg) {

                    }
                };
            })(),

            delete_one: function (item) {
                var r=confirm("确认删除固件 "+ item.uuid +"吗？");
                if (r===false) return;
                $scope.firmware.data.delOneToken = Math.random();
                $scope.aborter = $q.defer(),
                    $http.delete("http://api.opensight.cn/api/ivc/v1/firmwares/"+item.uuid, {
                        timeout: $scope.aborter.promise
                        /*                       headers:  {
                         "Authorization" : "Bearer "+$scope.authToken,
                         "Content-Type": "application/json"
                         }
                         */
                    }).success(function (response) {
                            $scope.firmware.refresh();
                        }).error(function (response,status) {
                            var tmpMsg = {};
                            tmpMsg.Label = "错误";
                            tmpMsg.ErrorContent = "删除固件"+ item.uuid +"失败";
                            tmpMsg.ErrorContentDetail = response;
                            tmpMsg.SingleButtonShown = true;
                            tmpMsg.MutiButtonShown = false;
                            tmpMsg.Token =  $scope.firmware.data.delOneToken;
                            tmpMsg.Callback = "delMdCallBack";
                            if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                $scope.$emit("Logout", tmpMsg);
                            }else
                                $scope.$emit("Ctr1ModalShow", tmpMsg);
                            //$scope.firmware.refresh();
                        });
            },

            delMdCallBack:function (event, msg) {


            },

            data: (function () {
                return {
                    showDetail: function (item, index) {
                        if ($scope.firmware.data_mod.bDetailShown === undefined) $scope.firmware.data_mod.bDetailShown = [];
                        if ($scope.firmware.data_mod.bDetailShown[index] === undefined) $scope.firmware.data_mod.bDetailShown[index] = false;
                        $scope.firmware.data_mod.bDetailShown[index] = !(true === $scope.firmware.data_mod.bDetailShown[index]);
                        if ($scope.firmware.data_mod.bDetailShown[index] === true) {//开
                            $scope.firmware.data_mod.selectItem = item;
                            /*
                            if ($scope.firmware.data_mod.tabs===undefined)
                                $scope.firmware.data_mod.tabs = [];
                            $scope.firmware.data_mod.tabs[0] = true;
                            */
                            $scope.firmware.data_mod.initDetail(item, index);
                        } else {

                        }
                    }
                };
            })(),

            data_mod: (function () {
                return {
                    initData: function(item, index) {
                        if ($scope.firmware.data_mod.bDetailShown[index] === true) {
                            if ($scope.firmware.data_mod.data === undefined)
                                $scope.firmware.data_mod.data = [];
                            $scope.firmware.data_mod.data[index] = item;
                        }
                    },

                    initDetail: function (item, index) {
                        if ($scope.firmware.data_mod.bDetailShown[index] === undefined
                            || $scope.firmware.data_mod.bDetailShown[index] === false)
                            return;

                        $scope.aborter = $q.defer(),
                            $http.get("http://api.opensight.cn/api/ivc/v1/firmwares/"+item.uuid, {
                                timeout: $scope.aborter.promise
                                /*                       headers:  {
                                 "Authorization" : "Bearer "+$scope.authToken,
                                 "Content-Type": "application/json"
                                 }
                                 */
                            }).success(function (response) {
                                    $scope.firmware.data_mod.initData(response, index);
                                }).error(function (response,status) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "固件"+ item.uuid +"详细信息get失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.firmware.data_mod.addHotSpToken;
                                    tmpMsg.Callback = "modMdCallBack";
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                        $scope.$emit("Logout", tmpMsg);
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    //$scope.firmware.data_mod.refresh(item, index);
                                });
                    },

                    submitForm: function (item, index) {
                        var postData =  {
                            firmware_model: $scope.firmware.data_mod.data[index].firmware_model,
                            firmware_url: $scope.firmware.data_mod.data[index].firmware_url,
                            desc: $scope.firmware.data_mod.data[index].desc,
                            long_desc: $scope.firmware.data_mod.data[index].long_desc
                        };

                        $scope.firmware.data_mod.updateCustomers = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.put("http://api.opensight.cn/api/ivc/v1/firmwares/"+item.uuid, postData, {
                                timeout: $scope.aborter.promise
                                /*                       headers:  {
                                 "Authorization" : "Bearer "+$scope.authToken,
                                 "Content-Type": "application/json"
                                 }
                                 */
                            }).success(function (response) {
                                    $scope.firmware.refresh();
                                }).error(function (response,status) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "固件"+ item.uuid  +"更新固件失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.firmware.data_mod.addHotSpToken;
                                    tmpMsg.Callback = "modMdCallBack";
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                                        $scope.$emit("Logout", tmpMsg);
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    // $scope.firmware.data_mod.refresh(item, index);
                                });
                    },
                    close: function (item, index) {
                        $scope.firmware.data_mod.initDetail(item, index);
                    },
                    modMdCallBack:function (event, msg) {

                    },

                    destroy: function () {
                    }
                };
            })()

        }
    })();

    $scope.firmwarelist = (function () {
        return {
            get: function () {//clean input,close add div
                $scope.firmware.data_add.clean_data();
                //$scope.firmware.addShown = false;
                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/firmwares?start=0&limit=100", {
                        timeout: $scope.aborter.promise
 /*                       headers:  {
                            "Authorization" : "Bearer "+$scope.authToken,
                            "Content-Type": "application/json"
                        }
*/
                    }).success(function (response) {
                            $scope.firmwarelist.data = response;
                        }).error(function (response,status) {
                            var tmpMsg = {};
                            tmpMsg.Label = "错误";
                            tmpMsg.ErrorContent = "获取固件列表失败";
                            tmpMsg.ErrorContentDetail = response;
                            tmpMsg.SingleButtonShown = true;
                            tmpMsg.MutiButtonShown = false;
                            //tmpMsg.Token =  $scope.firmware.data_mod.addHotSpToken;
                            tmpMsg.Callback = "firmware.show";
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
//    $scope.$on("newToken",$scope.firmwarelist.getKey);
    /*
    $scope.$on("firmware.show",$scope.firmware.show);


//add all callback
    $scope.$on('modMdCallBack', $scope.firmware.data_mod.modMdCallBack);
    $scope.$on('addMdCallBack', $scope.firmware.data_add.addMdCallBack);
    $scope.$on('delMdCallBack', $scope.firmware.delMdCallBack);
     */
    $scope.firmware.show();

//init firmware list
    //$scope.$emit("freshToken","firmware.show");

}]);
