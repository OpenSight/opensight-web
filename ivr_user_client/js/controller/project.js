app.register.controller('Project', ['$scope', '$http', '$q', function($scope, $http, $q){
    $scope.staticData = [];
    $scope.staticData.levelOptionsData = [
        {
            key: "raid0",
            value: 0
        },
        {
            key: "raid1",
            value: 1
        },
        {
            key: "raid5",
            value: 5
        },
        {
            key: "raid10",
            value: 10
        },
        {
            key: "raid6",
            value: 6
        }
    ];

    $scope.project = (function () {
        return {
            show: function () {
                $scope.destroy();
                $scope.projectlist.get();
                return true;
            },

            refresh: function () {
                angular.forEach($scope.projectlist.data.servers, function (item, index, array) {
                    if ($scope.project.data_mod.bDetailShown && $scope.project.data_mod.bDetailShown[index] !== undefined)
                        $scope.project.data_mod.bDetailShown[index]  = false;
                });

                $scope.project.show();
            },

            add: function () {
                if ($scope.project.addShown === undefined) $scope.project.addShown = false;
                $scope.project.addShown = !$scope.project.addShown;
                if ($scope.project.addShown === true)
                    $scope.project.data_add.init();
            },

            data_add: (function () {
                return {
                    clean_data: function () {//clean add field
                        if ($scope.project.data_add === undefined)
                            $scope.project.data_add = {};
                        $scope.project.data_add.name = "";
                        $scope.project.data_add.level = 1;
                        $scope.project.data_add.dev = "";
                    },

                    submitForm: function () {//add one project
                        var postData = {
                            name: $scope.project.data_add.name,
                            level: $scope.project.data_add.level,
                            dev: $scope.project.data_add.dev
                        };

                        $scope.project.data_add.token = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.post("/storlever/api/v1/block/project_list", postData, {
                                timeout: $scope.aborter.promise
                            }).success(function (response) {
                                    $scope.project.refresh();
                                }).error(function (response) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "添加project失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.project.data_add.token;
                                    tmpMsg.Callback = "addMdCallBack";
                                    $scope.$emit("Ctr1ModalShow", tmpMsg);
                                    $scope.project.refresh();
                                });
                    },

                    close: function () {//clean input,close add div
                        //$scope.project.data_add.clean_data();
                        //$scope.project.addShown = false;
                        $scope.project.add();
                    },

                    init: function () {
                        $scope.project.data_add.clean_data();
                    },

                    addMdCallBack:function (event, msg) {

                    }
                };
            })(),

            delete_one: function (item) {
                $scope.project.data.delOneToken = Math.random();
                $scope.aborter = $q.defer(),
                    $http.delete("/storlever/api/v1/block/project_list/"+item.name, {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $scope.project.refresh();
                        }).error(function (response) {
                            var tmpMsg = {};
                            tmpMsg.Label = "错误";
                            tmpMsg.ErrorContent = "删除project"+ item.name +"失败";
                            tmpMsg.ErrorContentDetail = response;
                            tmpMsg.SingleButtonShown = true;
                            tmpMsg.MutiButtonShown = false;
                            tmpMsg.Token =  $scope.project.data.delOneToken;
                            tmpMsg.Callback = "delMdCallBack";
                            $scope.$emit("Ctr1ModalShow", tmpMsg);
                            $scope.project.refresh();
                        });
            },

            delMdCallBack:function (event, msg) {

            },

            data: (function () {
                return {
                    showDetail: function (item, index) {
                        if ($scope.project.data_mod.bDetailShown === undefined) $scope.project.data_mod.bDetailShown = [];
                        if ($scope.project.data_mod.bDetailShown[index] === undefined) $scope.project.data_mod.bDetailShown[index] = false;
                        $scope.project.data_mod.bDetailShown[index] = !(true === $scope.project.data_mod.bDetailShown[index]);
                        if ($scope.project.data_mod.bDetailShown[index] === true) {//开
                            $scope.project.data_mod.initDetail(item,index);
                        } else {

                        }
                    }
                };
            })(),

            data_mod: (function () {
                return {
                    initData: function(item,index) {
                        if ($scope.project.data_mod.bDetailShown[index] === true) {
                            if ($scope.project.data_mod.name === undefined) $scope.project.data_mod.name = [];
                            $scope.project.data_mod.name[index] = item.name;
                            if ($scope.project.data_mod.dev_file === undefined) $scope.project.data_mod.dev_file = [];
                            $scope.project.data_mod.dev_file[index] = item.dev_file;
                            if ($scope.project.data_mod.spare_devices === undefined) $scope.project.data_mod.spare_devices = [];
                            $scope.project.data_mod.spare_devices[index] = item.spare_devices;
                            if ($scope.project.data_mod.array_size === undefined) $scope.project.data_mod.array_size = [];
                            $scope.project.data_mod.array_size[index] = item.array_size;
                            if ($scope.project.data_mod.used_dev_size === undefined) $scope.project.data_mod.used_dev_size = [];
                            $scope.project.data_mod.used_dev_size[index] = item.used_dev_size;
                            if ($scope.project.data_mod.active_device === undefined) $scope.project.data_mod.active_device = [];
                            $scope.project.data_mod.active_device[index] = item.active_device;
                            if ($scope.project.data_mod.total_devices === undefined) $scope.project.data_mod.total_devices = [];
                            $scope.project.data_mod.total_devices[index] = item.total_devices;
                            if ($scope.project.data_mod.creation_time === undefined) $scope.project.data_mod.creation_time = [];
                            $scope.project.data_mod.creation_time[index] = item.creation_time;
                            if ($scope.project.data_mod.raid_level === undefined) $scope.project.data_mod.raid_level = [];
                            $scope.project.data_mod.raid_level[index] = item.raid_level;
                            if ($scope.project.data_mod.update_time === undefined) $scope.project.data_mod.update_time = [];
                            $scope.project.data_mod.update_time[index] = item.update_time;
                            if ($scope.project.data_mod.state === undefined) $scope.project.data_mod.state = [];
                            $scope.project.data_mod.state[index] = item.state;
                            if ($scope.project.data_mod.raid_devices === undefined) $scope.project.data_mod.raid_devices = [];
                            $scope.project.data_mod.raid_devices[index] = item.raid_devices;
                            if ($scope.project.data_mod.full_name === undefined) $scope.project.data_mod.full_name = [];
                            $scope.project.data_mod.full_name[index] = item.full_name;
                            if ($scope.project.data_mod.working_device === undefined) $scope.project.data_mod.working_device = [];
                            $scope.project.data_mod.working_device[index] = item.working_device;
                            if ($scope.project.data_mod.resync_status === undefined) $scope.project.data_mod.resync_status = [];
                            $scope.project.data_mod.resync_status[index] = item.resync_status;
                            if ($scope.project.data_mod.failed_devices === undefined) $scope.project.data_mod.failed_devices = [];
                            $scope.project.data_mod.failed_devices[index] = item.failed_devices;
                            if ($scope.project.data_mod.persistence === undefined) $scope.project.data_mod.persistence = [];
                            $scope.project.data_mod.persistence[index] = item.persistence;
                            if ($scope.project.data_mod.uuid === undefined) $scope.project.data_mod.uuid = [];
                            $scope.project.data_mod.uuid[index] = item.uuid;
                            if ($scope.project.data_mod.members === undefined) $scope.project.data_mod.members = [];
                            $scope.project.data_mod.members[index] = item.members;
                        }
                    },

                    initDetail: function (item, index) {
                        if ($scope.project.data_mod.bDetailShown === undefined
                            || $scope.project.data_mod.bDetailShown[index] === undefined
                            || $scope.project.data_mod.bDetailShown[index] === false)
                            return;
                        item.indexKey = index;
                        $scope.aborter = $q.defer(),
                            $http.get("/storlever/api/v1/block/project_list/"+item.name, {
                                timeout: $scope.aborter.promise
                            }).success(function (response) {
                                    $scope.project.data_mod.initData(response,index);
                                });
                    },

                    initMembers: function (item, index) {
                        $scope.aborter = $q.defer(),
                            $http.get("/storlever/api/v1/block/project_list/"+item.name, {
                                timeout: $scope.aborter.promise
                            }).success(function (response) {
                                    $scope.project.data_mod.initData(response,index);
                                });
                    },

                    addHotSp: function (item, index) {
                        var postData =  {
                            dev: $scope.project.data_mod.devs[index],
                            opt: "add"
                            //sum: $scope.project.data_mod.spare_devices[index],
                        };

                        $scope.project.data_mod.addHotSpToken = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.post("/storlever/api/v1/block/project_list/"+item.name+"/op", postData, {
                                timeout: $scope.aborter.promise
                            }).success(function (response) {
                                    $scope.project.data_mod.hotRefresh(item, index);
                                }).error(function (response) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "project"+ item.name +"添加热备失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.project.data_mod.addHotSpToken;
                                    tmpMsg.Callback = "modMdCallBack";
                                    $scope.$emit("Ctr1ModalShow", tmpMsg);
                                    $scope.project.data_mod.hotRefresh(item, index);
                                });
                    },

                    delete_one: function (item,device) {
                        var postData =  {
                            dev: device,
                            opt: "remove"
                            //sum: $scope.project.data_mod.spare_devices[index],
                        };

                        $scope.project.data_mod.rmHotSpToken = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.post("/storlever/api/v1/block/project_list/"+item.name+"/op", postData, {
                                timeout: $scope.aborter.promise
                            }).success(function (response) {
                                    $scope.project.data_mod.hotRefresh(item, item.indexKey);
                                }).error(function (response) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "project"+ item.name +"删除热备失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.project.data_mod.rmHotSpToken;
                                    tmpMsg.Callback = "modMdCallBack";
                                    $scope.$emit("Ctr1ModalShow", tmpMsg);
                                    $scope.project.data_mod.hotRefresh(item, item.indexKey);
                                });
                    },

                    hotRefresh: function (item, index) {
                        var postData =  {
                            opt: "refresh"
                            //sum: $scope.project.data_mod.spare_devices[index],
                        };

                        $scope.project.data_mod.freshHotSpToken = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.post("/storlever/api/v1/block/project_list/"+item.name+"/op", postData, {
                                timeout: $scope.aborter.promise
                            }).success(function (response) {
                                    $scope.project.data_mod.initMembers(item, index);
                                }).error(function (response) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "project"+ item.name +"刷新失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.project.data_mod.freshHotSpToken;
                                    tmpMsg.Callback = "modMdCallBack";
                                    $scope.$emit("Ctr1ModalShow", tmpMsg);
                                    $scope.project.data_mod.initMembers(item, index);
                                });
                    },

                    grow: function (item, index) {
                        var postData =  {
                            opt: "grow",
                            sum: $scope.project.data_mod.sums[index]
                        };

                        $scope.project.data_mod.growToken = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.post("/storlever/api/v1/block/project_list/"+item.name+"/op", postData, {
                                timeout: $scope.aborter.promise
                            }).success(function (response) {
                                    $scope.project.data_mod.hotRefresh(item, index);
                                }).error(function (response) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "project "+ item.name +" 扩容失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    tmpMsg.Token =  $scope.project.data_mod.growToken;
                                    tmpMsg.Callback = "modMdCallBack";
                                    $scope.$emit("Ctr1ModalShow", tmpMsg);
                                    $scope.project.data_mod.hotRefresh(item, index);
                                });
                    },

                    hotAdd: function (item, index) {
                        if ($scope.project.data_mod.hotAddShown === undefined) $scope.project.data_mod.hotAddShown = [];
                        if ($scope.project.data_mod.hotAddShown[index] === undefined) $scope.project.data_mod.hotAddShown[index] = false;
                        $scope.project.data_mod.hotAddShown[index] = !$scope.project.data_mod.hotAddShown[index];
                        if ($scope.project.data_mod.hotAddShown[index] === true){
                            if ($scope.project.data_mod.devs === undefined) $scope.project.data_mod.devs = [];
                            $scope.project.data_mod.devs[index] = "";
                            if ($scope.project.data_mod.sums === undefined) $scope.project.data_mod.sums = [];
                            $scope.project.data_mod.sums[index] = "";
                        }

                    },

                    close: function (item,index) {//close add div
                        $scope.project.data_mod.hotAddShown[index] = false;
                    },

                    modMdCallBack:function (event, msg) {

                    },

                    destroy: function () {
                    }
                };
            })()

        }
    })();

    $scope.projectlist = (function () {
        return {
            get: function () {//clean input,close add div
                $scope.project.data_add.clean_data();
                //$scope.project.addShown = false;
                $scope.aborter = $q.defer(),
                    $http.get("/storlever/api/v1/block/project_list", {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $scope.projectlist.data = {};
                            $scope.projectlist.data.servers = response;
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

//add all callback
    $scope.$on('modMdCallBack', $scope.project.data_mod.modMdCallBack);
    $scope.$on('addMdCallBack', $scope.project.data_add.addMdCallBack);
    $scope.$on('delMdCallBack', $scope.project.delMdCallBack);

//init project list
    $scope.project.show();


}]);
