app.register.controller('Project', [
  '$scope', '$rootScope', '$http', '$q', '$state', 'FileSaver', 'Blob', 'dateFactory', 'pageFactory', 'flagFactory',
  function($scope, $rootScope, $http, $q, $state, FileSaver, Blob, dateFactory, pageFactory, flagFactory) {
    $scope.showDetail = function(obj, item, index) {
      if (true === item.bDetailShown) {
        item.bDetailShown = false;
      } else {
        item.bDetailShown = true;
        obj.detail[index] = angular.copy(item);
      }
    };
    $scope.project = (function() {
      return {
        show: function() {
          $scope.destroy();
          $scope.authToken = G_token;
          $scope.project.data_mod.showList();
          $scope.project.addShown = false;
          $scope.projectlist.searchKeyOptionsData = [{
            name: "项目名称",
            key: "name"
          }, {
            name: "描述",
            key: "desc"
          }, {
            name: "详细描述",
            key: "long_desc"
          }, {
            name: "项目标题",
            key: "title"
          }, {
            name: "媒体服务器",
            key: "media_server"
          }];
          $scope.projectlist.seachKey = $scope.projectlist.searchKeyOptionsData[0].key;
          $scope.projectlist.seachValue = "";
          $scope.projectlist.page = pageFactory.init({
            query: $scope.projectlist.get,
            jumperror: function() {
              alert('页码输入不正确。');
            }
          });
          $scope.projectlist.page.limit = 20;
          var params = {
            start: 0,
            limit: $scope.projectlist.page.limit
          };
          $scope.projectlist.get(params);
        },
        search: function() { //clean input,close add div
          var params = {
            start: 0,
            limit: $scope.projectlist.page.limit
          };

          $scope.project.data_add.clean_data();
          $scope.aborter = $q.defer(),

            $http.get("http://api.opensight.cn/api/ivc/v1/projects?filter_key=" + $scope.projectlist.seachKey + "&filter_value=" + $scope.projectlist.seachValue +
              "&start=0&limit=" + $scope.projectlist.page.limit, {
                timeout: $scope.aborter.promise
                  /*                       headers:  {
                   "Authorization" : "Bearer "+$scope.authToken,
                   "Content-Type": "application/json"
                   }
                   */

              }).success(function(response) {
                pageFactory.set(response, params);
              $scope.projectlist.data = response;
            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取项目列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              //tmpMsg.Token =  $scope.camera.data_mod.addHotSpToken;
              tmpMsg.Callback = "project.show";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

        },
        refresh: function() {
          angular.forEach($scope.projectlist.data.list, function(item, index, array) {
            if ($scope.project.data_mod.bDetailShown && $scope.project.data_mod.bDetailShown[index] !== undefined)
              $scope.project.data_mod.bDetailShown[index] = false;
          });

          $scope.project.show();
        },

        add: function() {
          if ($scope.project.addShown === undefined) $scope.project.addShown = false;
          $scope.project.addShown = !$scope.project.addShown;
          if ($scope.project.addShown === true)
            $scope.project.data_add.init();
        },

        data_add: (function() {
          return {
            clean_data: function() { //clean add field
              if ($scope.project.data_add === undefined)
                $scope.project.data_add = {};
              $scope.project.data_add.project_name = "";
              $scope.project.data_add.title = "";
              $scope.project.data_add.media_server = "";
              $scope.project.data_add.max_media_sessions = "";
              $scope.project.data_add.is_public = false;
              $scope.project.data_add.desc = "";
              $scope.project.data_add.long_desc = "";
            },

            submitForm: function() { //add one project
              var postData = {
                project_name: $scope.project.data_add.project_name,
                title: $scope.project.data_add.title,
                max_media_sessions: $scope.project.data_add.max_media_sessions,
                media_server: $scope.project.data_add.media_server,
                is_public: $scope.project.data_add.is_public,
                desc: $scope.project.data_add.desc,
                long_desc: $scope.project.data_add.long_desc
              };

              $scope.project.data_add.token = Math.random();
              $scope.aborter = $q.defer(),
                $http.post("http://api.opensight.cn/api/ivc/v1/projects", postData, {
                  timeout: $scope.aborter.promise
                    /*                       headers:  {
                     "Authorization" : "Bearer "+$scope.authToken,
                     "Content-Type": "application/json"
                     }
                     */
                }).success(function(response) {
                  $scope.project.refresh();
                }).error(function(response, status) {
                  //response.ErrorContent = "添加project失败";
                  //$scope.$emit("errorEmit",response);
                  //bendichuliweimiao

                  var tmpMsg = {};

                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "添加project失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token = $scope.project.data_add.token;
                  tmpMsg.Callback = "addMdCallBack";
                  if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut', { info: response.info, traceback: response.traceback });
                  } else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  // $scope.project.refresh();
                });
            },

            close: function() { //clean input,close add div
              //$scope.project.data_add.clean_data();
              //$scope.project.addShown = false;
              $scope.project.add();
            },

            init: function() {
              $scope.project.data_add.clean_data();
            },

            addMdCallBack: function(event, msg) {

            }
          };
        })(),

        delete_one: function(item) {
          var r = confirm("确认删除project " + item.name + "吗？");
          if (r === false) return;
          $scope.project.data.delOneToken = Math.random();
          $scope.aborter = $q.defer(),
            $http.delete("http://api.opensight.cn/api/ivc/v1/projects/" + item.name, {
              timeout: $scope.aborter.promise
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */
            }).success(function(response) {

              $scope.project.refresh();
            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "删除project" + item.name + "失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Token = $scope.project.data.delOneToken;
              tmpMsg.Callback = "delMdCallBack";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);
              //$scope.project.refresh();
            });
        },

        delMdCallBack: function(event, msg) {

        },

        data: (function() {
          return {
            showDetail: function(item, index) {
              /*
              if ($scope.project.data_mod.bDetailShown === undefined) $scope.project.data_mod.bDetailShown = false;
              $scope.project.data_mod.bDetailShown = !(true === $scope.project.data_mod.bDetailShown);
              */
              //$state.go('home.projectDetail');
              $scope.projectlist.curPageMark = $scope.projectlist.page.curr;
              $scope.projectlist.totalMark = $scope.projectlist.page.total;
              $scope.projectlist.limitMark = $scope.projectlist.page.limit;
              $scope.project.listShown = false;
              $scope.project.data_mod.bDetailShown = true;
              if ($scope.project.data_mod.bDetailShown === true) { //开
                $scope.project.data_mod.selectItem = item;
                if ($scope.project.data_mod.tabs === undefined)
                  $scope.project.data_mod.tabs = [];
                $scope.project.data_mod.tabs[0] = true;
                $scope.project.data_mod.tabs[1] = false;
                $scope.project.data_mod.initDetail();


              } else {

              }
            }
          };
        })(),

        data_mod: (function() {
          return {
            showList: function() {
              $scope.projectlist.page = pageFactory.init({
                query: $scope.projectlist.get,
                jumperror: function() {
                  alert('页码输入不正确。');
                }
              });

              $scope.projectlist.page.curr = ($scope.projectlist.curPageMark===undefined)?0:$scope.projectlist.curPageMark;
              $scope.projectlist.page.total = ($scope.projectlist.totalMark===undefined)?0:$scope.projectlist.totalMark;
              $scope.projectlist.page.limit = ($scope.projectlist.limitMark===undefined)?0:$scope.projectlist.limitMark;
              var params = {
                start:  $scope.projectlist.page.limit*($scope.projectlist.page.curr-1),
                limit: $scope.projectlist.page.limit
              };
              $scope.projectlist.get(params);
              $scope.project.listShown = true;
              $scope.project.data_mod.bDetailShown = false;
            },
            initData: function(item) {
              if ($scope.project.data_mod.bDetailShown === true) {
                $scope.project.data_mod.data = item;
              }
            },

            initDetail: function() {
              if ($scope.project.data_mod.bDetailShown === undefined || $scope.project.data_mod.bDetailShown === false)
                return;

              $scope.aborter = $q.defer(),
                $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name, {
                  timeout: $scope.aborter.promise
                }).success(function(response) {
                  $scope.project.data_mod.initData(response);
                }).error(function(response, status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "project" + $scope.project.data_mod.selectItem.name + "get失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token = $scope.project.data_mod.addHotSpToken;
                  tmpMsg.Callback = "modMdCallBack";
                  if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut', { info: response.info, traceback: response.traceback });
                  } else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  //$scope.project.data_mod.hotRefresh(item, index);
                });
            },

            submitForm: function() {
              var postData = {
                //name: $scope.project.data_mod.data.name,
                title: $scope.project.data_mod.data.title,
                max_media_sessions: $scope.project.data_mod.data.max_media_sessions,
                media_server: $scope.project.data_mod.data.media_server,
                desc: $scope.project.data_mod.data.desc,
                long_desc: $scope.project.data_mod.data.long_desc,
                is_public: $scope.project.data_mod.data.is_public
              };

              $scope.aborter = $q.defer(),
                $http.put("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name, postData, {
                  timeout: $scope.aborter.promise
                }).success(function(response) {
                    $rootScope.$emit('messageShow', { succ: true, text: '更新成功。' });
                    //$rootScope.$emit('messageShow', { succ: false, text: '重启失败。' });
                }).error(function(response, status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "project " + $scope.project.data_mod.selectItem.name + " 更新失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token = $scope.project.data_mod.submitForm;
                  //tmpMsg.Callback = "odCallBack";
                  if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut', { info: response.info, traceback: response.traceback });
                  } else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                });
            },
            reset: function() {
              $scope.project.data_mod.initDetail();
            },

            /*
            modMdCallBack:function (event, msg) {


            },
             */
            destroy: function() {}
          };
        })()
      }
    })();

    $scope.projectlist = (function() {
      return {
        get: function(params) { //clean input,close add div
          $scope.project.data_add.clean_data();

          //$scope.projectlist.page.limit = 10;

          //$scope.project.addShown = false;
          $scope.aborter = $q.defer(),
            $http.get("http://api.opensight.cn/api/ivc/v1/projects" , {
              params: params,
              timeout: $scope.aborter.promise
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */

            }).success(function(response) {
              pageFactory.set(response, params);
              $scope.projectlist.data = response;
            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取项目列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              //tmpMsg.Token =  $scope.project.data_mod.addHotSpToken;
              tmpMsg.Callback = "project.show";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

        },
        getKey: function(event, newkey) {
          $scope.authToken = newkey;
        }


      };
    })();

    (function() {
      var device = {
        initDevices: function() {
          $scope.destroy();
          device.addShown = false;
          device.detail = [];
          device.searchKeyOptionsData = [{
            name: "设备名称",
            key: "name"
          }, {
            name: "描述",
            key: "desc"
          }, {
            name: "详细描述",
            key: "long_desc"
          }, {
            name: "设备uuid",
            key: "uuid"
          }, {
            name: "设备类型",
            key: "type"
          }, {
            name: "设备登录名",
            key: "login_code"
          }, {
            name: "设备固件",
            key: "firmware_model"
          }, {
            name: "设备硬件",
            key: "hardware_model"
          }, {
            name: "设备厂家",
            key: "vendor"
          }];
          device.seachKey = device.searchKeyOptionsData[0].key;
          device.seachValue = "";
          device.page = pageFactory.init({
            query: device.query,
            jumperror: function() {
              alert('页码输入不正确。');
            }
          });

          device.search();
        },
        query: function(params) {
          $scope.aborter = $q.defer();
          $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/devices", {
            params: params,
            timeout: $scope.aborter.promise
          }).success(function(response) {
            device.data = response;
            device.detail = [];
            pageFactory.set(response, params);
          }).error(function(response, status) {
            var tmpMsg = {
              Label: '错误',
              ErrorContent: '获取设备列表失败',
              ErrorContentDetail: response,
              SingleButtonShown: true,
              MutiButtonShown: false,
              Callback: 'device.show'
            };
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              $state.go('logOut', { info: response.info, traceback: response.traceback });
            } else {
              $scope.$emit("Ctr1ModalShow", tmpMsg);
            }
          });
        },
        search: function() { //clean input,close add div
          if ($scope.project.data_mod.bDetailShown !== true) return;
          device.data_add.clean_data();
          var params = {
            filter_key: device.seachKey,
            filter_value: device.seachValue,
            start: 0,
            limit: 10
          };
          device.query(params);
        },
        refresh: function() {
          angular.forEach(device.data.list, function(item, index, array) {
            if (device.data_mod.bDetailShown && device.data_mod.bDetailShown[index] !== undefined)
              device.data_mod.bDetailShown[index] = false;
          });
          device.data = {};
          device.initDevices();
        },
        add: function() {
          if (device.addShown === undefined) device.addShown = false;
          device.addShown = !device.addShown;
          if (device.addShown === true)
            device.data_add.init();
        },

        data_add: (function() {
          return {
            clean_data: function() { //clean add field
              if (device.data_add === undefined)
                device.data_add = {};
              device.data_add.name = "";
              device.data_add.type = "camera";
              device.data_add.flags = 0;
              device.data_add.login_code = "";
              device.data_add.login_passwd = "123456";
              device.data_add.firmware_model = "";
              device.data_add.hardware_model = "";
              device.data_add.media_channel_num = 1;
              device.data_add.vendor = "open sight";
              device.data_add.desc = "";
              device.data_add.long_desc = "";
              device.data_add.longitude = 0;
              device.data_add.latitude = 0;
              device.data_add.altitude = 0;
            },

            submitForm: function() { //add one device
              var postData = {
                name: device.data_add.name,
                type: device.data_add.type,
                flags: device.data_add.flags,
                login_code: device.data_add.login_code,
                login_passwd: device.data_add.login_passwd,
                desc: device.data_add.desc,
                long_desc: device.data_add.long_desc,
                firmware_model: device.data_add.firmware_model,
                hardware_model: device.data_add.hardware_model,
                vendor: device.data_add.vendor,
                media_channel_num: device.data_add.media_channel_num,
                longitude: device.data_add.longitude,
                latitude: device.data_add.latitude,
                altitude: device.data_add.altitude
              };

              device.data_add.token = Math.random();
              $scope.aborter = $q.defer(),
                $http.post("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/devices", postData, {
                  timeout: $scope.aborter.promise
                    /*                       headers:  {
                     "Authorization" : "Bearer "+$scope.authToken,
                     "Content-Type": "application/json"
                     }
                     */
                }).success(function(response) {
                  // device.refresh();
                  device.data_add.clean_data();
                  device.addShown = !device.addShown;
                  device.page.pageChanged();
                }).error(function(response, status) {
                  //response.ErrorContent = "添加device失败";
                  //$scope.$emit("errorEmit",response);
                  //bendichuliweimiao

                  var tmpMsg = {};

                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "添加device失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token = device.data_add.token;
                  //tmpMsg.Callback = "addMdCallBack";
                  if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut', { info: response.info, traceback: response.traceback });
                  } else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  // device.refresh();
                });
            },

            close: function() { //clean input,close add div
              //device.data_add.clean_data();
              //device.addShown = false;
              device.add();
            },

            init: function() {
              device.data_add.clean_data();
            },

            addMdCallBack: function(event, msg) {

            }
          };
        })(),

        delete_one: function(item) {
          var r = confirm("确认删除device " + item.name + "吗？");
          if (r === false) return;
          device.data.delOneToken = Math.random();
          $scope.aborter = $q.defer();
          $http.delete("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/devices/" + item.uuid, {
            timeout: $scope.aborter.promise
          }).success(function(response) {
            // device.refresh();
            device.page.pageChanged();
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "删除device: " + item.name + " 失败";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            tmpMsg.Token = device.data.delOneToken;
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', { info: response.info, traceback: response.traceback });
            } else
              $scope.$emit("Ctr1ModalShow", tmpMsg);
          });
        },
        upgrade: function(item) {
          if (false === confirm('升级成功后设备会重启，是否继续？')) {
            return;
          }
          $http.post("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/devices/" + item.uuid + '/firmware', {}).success(function(response) {
            alert("升级device: " + item.name + " 成功。");
            // device.refresh();
            device.page.pageChanged();
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "升级device: " + item.name + " 失败";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            // tmpMsg.Token =  device.data.delOneToken;
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', { info: response.info, traceback: response.traceback });
            } else {
              $scope.$emit("Ctr1ModalShow", tmpMsg);
            }
          });
        },
        delMdCallBack: function(event, msg) {

        },
        showDetail: function(item, index) {
          if (true === item.bDetailShown) {
            item.bDetailShown = false;
          } else {
            item.bDetailShown = true;
            device.detail[index] = angular.copy(item);
          }
        },
        modify: function(item, index) {
          var data = {
            flags: device.detail[index].flags,
            login_code: device.detail[index].login_code,
            login_passwd: device.detail[index].login_passwd,
            desc: device.detail[index].desc,
            long_desc: device.detail[index].long_desc,
            firmware_model: device.detail[index].firmware_model,
            hardware_model: device.detail[index].hardware_model,
            vendor: device.detail[index].vendor,
            media_channel_num: device.detail[index].media_channel_num,
            longitude: device.detail[index].longitude,
            // login_passwd: device.detail[index].login_passwd,
            latitude: device.detail[index].latitude,
            altitude: device.detail[index].altitude
          };

          //device.data_mod.submitForm = Math.random();
          $scope.aborter = $q.defer();
          $http.put("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/devices/" + item.uuid, data, {
            timeout: $scope.aborter.promise
          }).success(function(response) {
            device.data.list[index] = angular.copy(device.detail[index], device.data.list[index]);
            device.showDetail(item, index);
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "device " + $scope.project.data_mod.selectItem.name + " 更新失败";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            tmpMsg.Token = device.data_mod.submitForm;
            //tmpMsg.Callback = "odCallBack";
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', { info: response.info, traceback: response.traceback });
            } else
              $scope.$emit("Ctr1ModalShow", tmpMsg);
          });
        }
      };
      $scope.project.device = device;
    })();

    (function() {
      var camera = {
        initCameras: function() {
          $scope.destroy();
          camera.addShown = false;
          camera.searchKeyOptionsData = [{
            name: "摄像头名称",
            key: "name"
          }, {
            name: "描述",
            key: "desc"
          }, {
            name: "详细描述",
            key: "long_desc"
          }, {
            name: "摄像头uuid",
            key: "uuid"
          }, {
            name: "设备uuid",
            key: "device_uuid"
          }];
          camera.seachKey = camera.searchKeyOptionsData[0].key;
          camera.seachValue = "";
          camera.page = pageFactory.init({
            query: camera.query,
            jumperror: function() {
              alert('页码输入不正确。');
            }
          });
          camera.initAddData();
          camera.search();
        },
        query: function(params) {
          $scope.aborter = $q.defer();
          $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/cameras", {
            params: params,
            timeout: $scope.aborter.promise
          }).success(function(response) {
            for (var i = 0, l = response.list.length; i < l; i++) {
              var bitmap = flagFactory.getBitmap(response.list[i].flags, 8);
              var flags = flagFactory.parseCamera(bitmap);
              response.list[i].ability = flags.ability;
              response.list[i].live = flags.live;
              response.list[i].ptz = flags.ptz;
              response.list[i].pic = flags.preview;
              response.list[i].qualityList = flagFactory.quality(bitmap);
              if (0 !== response.list[i].ability.length) {
                response.list[i].quality = response.list[i].ability[0].text;
              }
              if ('' !== response.list[i].preview) {
                response.list[i].preview = response.list[i].preview + '?_=' + (new Date().getTime());
              }
            }
            camera.data = response;
            camera.detail = [];
            pageFactory.set(response, params);
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "获取摄像头列表失败";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            //tmpMsg.Token =  $scope.camera.data_mod.addHotSpToken;
            // tmpMsg.Callback = "camera.show";
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', { info: response.info, traceback: response.traceback });
            } else
              $scope.$emit("Ctr1ModalShow", tmpMsg);
          });
        },
        search: function() {
          var params = {
            start: 0,
            limit: camera.page.limit
          };
          if (undefined !== camera.seachValue && '' !== camera.seachValue) {
            params.filter_key = camera.seachKey;
            params.filter_value = camera.seachValue;
          }
          camera.query(params);
        },
        modify: function(index) {
          var it = camera.detail[index];
          var flag = flagFactory.encodeCamera(it.qualityList, it.pic, !it.live, it.ptz);
          var params = {
            name: it.name,
            flags: flag,
            desc: it.desc,
            long_desc: it.long_desc,
            longitude: it.longitude,
            login_passwd: it.login_passwd,
            latitude: it.latitude,
            altitude: it.altitude
          };
          $scope.aborter = $q.defer();
          $http.put("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/cameras/" + it.uuid, params, {
            timeout: $scope.aborter.promise
          }).success(function(response) {
            camera.page.pageChanged();
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "camera " + $scope.project.data_mod.selectItem.name + " 更新失败";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            //tmpMsg.Callback = "odCallBack";
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', { info: response.info, traceback: response.traceback });
            } else
              $scope.$emit("Ctr1ModalShow", tmpMsg);
          });
        },
        showAdd: function() {
          camera.addShown = !camera.addShown;
        },
        initAddData: function() {
          camera.data_add = {
            name: '',
            channel_index: 0,
            device_uuid: '',
            desc: '',
            long_desc: '',
            longitude: 0,
            latitude: 0,
            altitude: 0
          };
          var bitmap = flagFactory.getBitmap(17, 8);
          var flags = flagFactory.parseCamera(bitmap);
          camera.data_add.ability = flags.ability;
          camera.data_add.live = flags.live;
          camera.data_add.ptz = flags.ptz;
          camera.data_add.pic = flags.preview;
          camera.data_add.qualityList = flagFactory.quality(bitmap);
        },
        add: function() {
          var flag = flagFactory.encodeCamera(camera.data_add.qualityList, camera.data_add.pic, !camera.data_add.live, camera.data_add.ptz);
          var params = {
            name: camera.data_add.name,
            device_uuid: camera.data_add.device_uuid,
            flags: flag,
            channel_index: camera.data_add.channel_index,
            desc: camera.data_add.desc,
            long_desc: camera.data_add.long_desc,
            longitude: camera.data_add.longitude,
            latitude: camera.data_add.latitude,
            altitude: camera.data_add.altitude
          };

          $scope.project.camera.data_add.token = Math.random();
          $scope.aborter = $q.defer();
          $http.post("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/cameras", params, {
            timeout: $scope.aborter.promise
          }).success(function(response) {
            camera.initAddData();
            camera.showAdd();
            camera.page.pageChanged();
          }).error(function(response, status) {
            var tmpMsg = {};

            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "添加camera失败";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            tmpMsg.Token = camera.data_add.token;
            //tmpMsg.Callback = "addMdCallBack";
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', { info: response.info, traceback: response.traceback });
            } else {
              $scope.$emit("Ctr1ModalShow", tmpMsg);
            }
          });
        },
        play_switch: function(item, index, enable) {
          var tip = enable ? '允许直播后可以远程观看直播，是否继续？' : '禁止直播后无法远程观看，同时会停止正在播放的直播，是否继续？';
          if (false === confirm(tip)) {
            return false;
          }

          $scope.aborter = $q.defer();
          $http.post("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/cameras/" + item.uuid + "/stream_toggle", {
            enable: enable
          }, {
            timeout: $scope.aborter.promise
          }).success(function(response) {
            item.live = enable;
            if (undefined !== camera.detail[index]) {
              camera.detail[index].live = enable;
            }
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "camera" + item.name + "直播控制失败";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            //tmpMsg.Token =  $scope.project.camera.data_mod.addHotSpToken;
            tmpMsg.Callback = "modMdCallBack";
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', { info: response.info, traceback: response.traceback });
            } else {
              $scope.$emit("Ctr1ModalShow", tmpMsg);
            }
          });
        },
        remove: function(item) {
          var r = confirm("确认删除camera " + item.name + "吗？");
          if (r === false) return;
          $scope.project.camera.data.delOneToken = Math.random();
          $scope.aborter = $q.defer();
          $http.delete("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/cameras/" + item.uuid, {
            timeout: $scope.aborter.promise
          }).success(function(response) {
            camera.page.pageChanged();
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "删除camera" + item.name + "失败";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            tmpMsg.Token = $scope.project.camera.data.delOneToken;
            //tmpMsg.Callback = "delMdCallBack";
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', { info: response.info, traceback: response.traceback });
            } else
              $scope.$emit("Ctr1ModalShow", tmpMsg);
            //$scope.project.camera.refresh();
          });
        },
        reboot: function(item, index) {
          $scope.aborter = $q.defer();
          $http.post("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/cameras/" + item.uuid + "/reboot", {
            timeout: $scope.aborter.promise
          }).success(function(response) {
              $rootScope.$emit('messageShow', { succ: true, text: '重启成功。' });
              //$rootScope.$emit('messageShow', { succ: false, text: '重启失败。' });
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "camera  " + item.name + "  重启失败";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            tmpMsg.Callback = "modMdCallBack";
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              $state.go('logOut', { info: response.info, traceback: response.traceback });
            } else {
              $scope.$emit("Ctr1ModalShow", tmpMsg);
            }
          });
        }
      }
      $scope.project.camera = camera;
    })();

    var getBitmap = function(f, bits) {
      var t = [];
      var i = 0;
      do {
        t[i] = f % 2;
        f = Math.floor(f / 2);
        i++;
      } while (f > 0);
      while (i < bits) {
        t[i] = 0;
        i++;
      }
      return t;
    };

    var parse = function(flags) {
      var m = getBitmap(flags, 8);
      var ab = [{
        text: 'LD',
        title: '流畅',
        cls: '',
        idx: 0
      }, {
        text: 'SD',
        title: '标清',
        cls: '',
        idx: 1
      }, {
        text: 'HD',
        title: '高清',
        cls: '',
        idx: 2
      }, {
        text: 'FHD',
        title: '超清',
        cls: '',
        idx: 3
      }];
      var t = [];
      for (var i = 0, l = ab.length; i < l; i++) {
        if (1 === m[ab[i].idx]) {
          t.push(ab[i]);
        }
      }

      return {
        live: 0 === m[5],
        ability: t
      };
    };

    $scope.project.sessionlog = (function() {
      return {
        init: function() {
          $scope.project.sessionlist.params = { limit: 50 };
          $scope.project.sessionlist.bFirst = true;
          $scope.project.sessionlist.bLast = true;
          $scope.project.sessionlog.sumShown = false;
          $scope.project.sessionlist.data = {};
          $scope.start = {
            dt: new Date(),
            opened: false
          };
          $scope.end = {
            dt: new Date(),
            opened: false
          };
        },
        initSum: function() {
          $scope.project.sessionlog.sumShown = true;
          $scope.project.sessionlog.sumData = {};
          $scope.project.sessionlog.sumData.total = 0;
          $scope.project.sessionlog.sumData.per_quality = {
            "ld": 0,
            "sd": 0,
            "hd": 0,
            "fhd": 0
          };
        },
        open: function(opts) {
          opts.opened = true;
        },
        search: function() {
          $scope.project.sessionlog.initSession();
        },
        down: function() {
          if ($scope.project.data_mod.bDetailShown !== true) return;
          $scope.aborter = $q.defer(),
            $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/session_logs_csv?start_from=" + $scope.project.sessionlist.format($scope.start.dt, 0) +
              "&end_to=" + $scope.project.sessionlist.format($scope.end.dt, 1), {
                timeout: $scope.aborter.promise,
                headers: {
                  "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }

              }).success(function(response) {
              var blob = new Blob([response], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              });
              FileSaver.saveAs(blob, $scope.project.sessionlist.format($scope.start.dt, 0) + "--" + $scope.project.sessionlist.format($scope.end.dt, 1) + '.csv');
            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "下载用户观看记录列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Callback = "session.show";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

        },
        sum: function() {
          if ($scope.project.data_mod.bDetailShown !== true) return;
          if ($scope.project.sessionlog.sumShown === true) {
            $scope.project.sessionlog.sumShown = false;
            return;
          }
          $scope.aborter = $q.defer(),
            $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/session_logs_sum?start_from=" + $scope.project.sessionlist.format($scope.start.dt, 0) +
              "&end_to=" + $scope.project.sessionlist.format($scope.end.dt, 1), {
                timeout: $scope.aborter.promise
                  /*                       headers:  {
                   "Authorization" : "Bearer "+$scope.authToken,
                   "Content-Type": "application/json"
                   }
                   */

              }).success(function(response) {
              $scope.project.sessionlog.initSum();
              if (response.total !== undefined)
                $scope.project.sessionlog.sumData.total = response.total;
              if (response.per_quality !== undefined) {
                if (response.per_quality.ld !== undefined)
                  $scope.project.sessionlog.sumData.per_quality.ld = response.per_quality.ld;
                if (response.per_quality.sd !== undefined)
                  $scope.project.sessionlog.sumData.per_quality.sd = response.per_quality.sd;
                if (response.per_quality.hd !== undefined)
                  $scope.project.sessionlog.sumData.per_quality.hd = response.per_quality.hd;
                if (response.per_quality.fhd !== undefined)
                  $scope.project.sessionlog.sumData.per_quality.fhd = response.per_quality.fhd;
              }
            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "统计用户观看记录列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Callback = "session.show";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

        },
        initSession: function() {
          if ($scope.project.sessionlist.data !== undefined && $scope.project.sessionlist.data.list !== undefined) {
            $scope.project.sessionlog.refresh();
          } else {
            $scope.destroy();
            $scope.project.sessionlog.sumShown = false;
            $scope.project.sessionlist.get();
          }
        },

        refresh: function() {
          angular.forEach($scope.project.sessionlist.data.list, function(item, index, array) {
            if ($scope.project.sessionlog.data_mod.bDetailShown && $scope.project.sessionlog.data_mod.bDetailShown[index] !== undefined)
              $scope.project.sessionlog.data_mod.bDetailShown[index] = false;
          });
          $scope.project.sessionlist.data = {};
          $scope.project.sessionlog.initSession();
        },

        data: (function() {
          return {
            showDetail: function(item, index) {
              if ($scope.project.sessionlog.data_mod.bDetailShown === undefined) $scope.project.sessionlog.data_mod.bDetailShown = [];
              if ($scope.project.sessionlog.data_mod.bDetailShown[index] === undefined) $scope.project.sessionlog.data_mod.bDetailShown[index] = false;
              $scope.project.sessionlog.data_mod.bDetailShown[index] = !(true === $scope.project.sessionlog.data_mod.bDetailShown[index]);

              if ($scope.project.sessionlog.data_mod.bDetailShown[index] === true) { //开
                $scope.project.sessionlog.data_mod.initDetail(item, index);
              } else {

              }
            }
          };
        })(),

        data_mod: (function() {
          return {
            initData: function(item, index) {
              if ($scope.project.sessionlog.data_mod.bDetailShown[index] === true) {
                if ($scope.project.sessionlog.data_mod.data === undefined)
                  $scope.project.sessionlog.data_mod.data = [];
                $scope.project.sessionlog.data_mod.data[index] = item;
              }
            },

            initDetail: function(item, index) {
              if ($scope.project.sessionlog.data_mod.bDetailShown[index] === undefined || $scope.project.sessionlog.data_mod.bDetailShown[index] === false)
                return;

              $scope.aborter = $q.defer(),
                $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/session_logs/" + item.uuid, {
                  timeout: $scope.aborter.promise
                    /*                       headers:  {
                     "Authorization" : "Bearer "+$scope.authToken,
                     "Content-Type": "application/json"
                     }
                     */
                }).success(function(response) {
                  $scope.project.sessionlog.data_mod.initData(response, index);
                }).error(function(response, status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "session" + item.name + "get失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  //tmpMsg.Token =  $scope.project.sessionlog.data_mod.addHotSpToken;
                  tmpMsg.Callback = "modMdCallBack";
                  if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut', { info: response.info, traceback: response.traceback });
                  } else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  //$scope.project.sessionlog.data_mod.hotRefresh(item, index);
                });
            },

            reset: function(item, index) {
              $scope.project.sessionlog.data_mod.initDetail(item, index);
            },

            destroy: function() {}
          };
        })()
      }
    })();

    $scope.project.sessionlist = (function() {
      return {
        format: function(dt, flag) {
          var ymd, hms;
          ymd = [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()].join('-');
          if (flag === 0)
            hms = "00:00:00";
          else hms = "23:59:59";
          return ymd + "T" + hms;
        },
        get: function() {
          if ($scope.project.data_mod.bDetailShown !== true) return;
          $scope.project.sessionlist.params.start_from = $scope.project.sessionlist.format($scope.start.dt, 0);
          $scope.project.sessionlist.params.end_to = $scope.project.sessionlist.format($scope.end.dt, 1);
          $scope.project.sessionlist.params.reverse = false;
          $scope.project.sessionlist.params.last_end_time = undefined;
          $scope.project.sessionlist.params.last_session_id = undefined;
          $scope.project.sessionlist.bFirst = true;
          $scope.project.sessionlist.bLast = true;
          $scope.aborter = $q.defer(),
            $http({
              url: "http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/session_logs",
              method: "GET",
              timeout: $scope.aborter.promise,
              params: $scope.project.sessionlist.params
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */

            }).success(function(response) {
              $scope.project.sessionlist.data = response;
              if ($scope.project.sessionlist.data.list.length === $scope.project.sessionlist.params.limit)
                $scope.project.sessionlist.bLast = false;
            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取用户观看记录列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Callback = "session.show";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });
        },
        next: function() {
          if ($scope.project.sessionlist.bLast === true) return;
          $scope.project.sessionlist.params.reverse = false;
          $scope.project.sessionlist.params.last_end_time = $scope.project.sessionlist.data.list[$scope.project.sessionlist.data.list.length - 1].end;
          $scope.project.sessionlist.params.last_session_id = $scope.project.sessionlist.data.list[$scope.project.sessionlist.data.list.length - 1].uuid;
          $scope.aborter = $q.defer(),
            $http({
              url: "http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/session_logs",
              method: "GET",
              timeout: $scope.aborter.promise,
              params: $scope.project.sessionlist.params
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */

            }).success(function(response) {
              $scope.project.sessionlist.data = response;
              if ($scope.project.sessionlist.data.list.length === $scope.project.sessionlist.params.limit)
                $scope.project.sessionlist.bLast = false;
              else $scope.project.sessionlist.bLast = true;
              if ($scope.project.sessionlist.data.list.length > 0)
                $scope.project.sessionlist.bFirst = false;
            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取用户观看记录列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Callback = "session.show";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });
        },
        prev: function() {
          if ($scope.project.sessionlist.bFirst === true) return;
          $scope.project.sessionlist.params.reverse = true;
          $scope.project.sessionlist.params.last_end_time = $scope.project.sessionlist.data.list[0].end;
          $scope.project.sessionlist.params.last_session_id = $scope.project.sessionlist.data.list[0].uuid;
          $scope.aborter = $q.defer(),
            $http({
              url: "http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/session_logs",
              method: "GET",
              timeout: $scope.aborter.promise,
              params: $scope.project.sessionlist.params
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */

            }).success(function(response) {
              if (response.list.length === $scope.project.sessionlist.params.limit)
                $scope.project.sessionlist.bFirst == false;
              else $scope.project.sessionlist.bFirst = true;
              if (response.list.length > 0) {
                $scope.project.sessionlist.bLast = false;
                $scope.project.sessionlist.data.list = [];
              }

              for (var i = 0; i < response.list.length; i++) {
                $scope.project.sessionlist.data.list[i] = response.list[response.list.length - i - 1];
              }

            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取用户观看记录列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Callback = "session.show";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });
        }


      };
    })();

    $scope.project.user = (function() {
      return {
        initUsers: function() {
          if ($scope.project.userlist.data !== undefined && $scope.project.userlist.data.list !== undefined) {
            $scope.project.user.refresh();
          } else {
            $scope.destroy();
            $scope.project.user.addShown = false;
            $scope.project.userlist.searchKeyOptionsData = [{
              name: "用户名",
              key: "username"
            }, {
              name: "描述",
              key: "desc"
            }, {
              name: "详细描述",
              key: "long_desc"
            }, {
              name: "别名",
              key: "title"
            }, {
              name: "手机号",
              key: "cellphone"
            }, {
              name: "电子邮箱",
              key: "email"
            }];
            $scope.project.userlist.seachKey = $scope.project.userlist.searchKeyOptionsData[0].key;
            $scope.project.userlist.seachValue = "";
            $scope.project.userlist.get();
          }
        },
        search: function() { //clean input,close add div
          if ($scope.project.data_mod.bDetailShown !== true) return;
          $scope.project.user.data_add.clean_data();
          //$scope.camera.addShown = false;
          $scope.aborter = $q.defer(),
            $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/users?filter_key=" + $scope.project.userlist.seachKey + "&filter_value=" + $scope.project.userlist.seachValue +
              "&start=0&limit=100", {
                timeout: $scope.aborter.promise
                  /*                       headers:  {
                   "Authorization" : "Bearer "+$scope.authToken,
                   "Content-Type": "application/json"
                   }
                   */

              }).success(function(response) {
              $scope.project.userlist.data = response;
            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取用户列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              //tmpMsg.Token =  $scope.camera.data_mod.addHotSpToken;
              tmpMsg.Callback = "user.show";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

        },
        refresh: function() {
          angular.forEach($scope.project.userlist.data.list, function(item, index, array) {
            if ($scope.project.user.data_mod.bDetailShown && $scope.project.user.data_mod.bDetailShown[index] !== undefined)
              $scope.project.user.data_mod.bDetailShown[index] = false;
          });
          $scope.project.userlist.data = {};
          $scope.project.user.initUsers();
        },

        add: function() {
          if ($scope.project.user.addShown === undefined) $scope.project.user.addShown = false;
          $scope.project.user.addShown = !$scope.project.user.addShown;
          if ($scope.project.user.addShown === true)
            $scope.project.user.data_add.init();
        },

        data_add: (function() {
          return {
            clean_data: function() { //clean add field
              if ($scope.project.user.data_add === undefined)
                $scope.project.user.data_add = {};
              $scope.project.user.data_add.username = "";
            },

            submitForm: function() { //add one user
              var postData = {
                username: $scope.project.user.data_add.username
              };

              $scope.project.user.data_add.token = Math.random();
              $scope.aborter = $q.defer(),
                $http.post("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/users", postData, {
                  timeout: $scope.aborter.promise
                    /*                       headers:  {
                     "Authorization" : "Bearer "+$scope.authToken,
                     "Content-Type": "application/json"
                     }
                     */
                }).success(function(response) {
                  $scope.project.user.refresh();
                }).error(function(response, status) {
                  //response.ErrorContent = "加入user失败";
                  //$scope.$emit("errorEmit",response);
                  //bendichuliweimiao

                  var tmpMsg = {};

                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "加入user失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token = $scope.project.user.data_add.token;
                  //tmpMsg.Callback = "addMdCallBack";
                  if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut', { info: response.info, traceback: response.traceback });
                  } else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  // $scope.project.user.refresh();
                });
            },

            close: function() { //clean input,close add div
              //$scope.project.user.data_add.clean_data();
              //$scope.project.user.addShown = false;
              $scope.project.user.add();
            },

            init: function() {
              $scope.project.user.data_add.clean_data();
            },

            addMdCallBack: function(event, msg) {

            }
          };
        })(),

        delete_one: function(item) {
          var r = confirm("确认删除user " + item.username + "吗？");
          if (r === false) return;
          $scope.project.user.data.delOneToken = Math.random();
          $scope.aborter = $q.defer(),
            $http.delete("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/users/" + item.username, {
              timeout: $scope.aborter.promise
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */
            }).success(function(response) {
              $scope.project.user.refresh();
            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "移出user" + item.username + "失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Token = $scope.project.user.data.delOneToken;
              //tmpMsg.Callback = "delMdCallBack";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);
              //$scope.project.user.refresh();
            });
        },

        delMdCallBack: function(event, msg) {

        },

        data: (function() {
          return {
            showDetail: function(item, index) {
              if ($scope.project.user.data_mod.bDetailShown === undefined) $scope.project.user.data_mod.bDetailShown = [];
              if ($scope.project.user.data_mod.bDetailShown[index] === undefined) $scope.project.user.data_mod.bDetailShown[index] = false;
              $scope.project.user.data_mod.bDetailShown[index] = !(true === $scope.project.user.data_mod.bDetailShown[index]);

              if ($scope.project.user.data_mod.bDetailShown[index] === true) { //开
                $scope.project.user.data_mod.initDetail(item, index);
              } else {

              }
            }
          };
        })(),

        data_mod: (function() {
          return {
            initData: function(item, index) {
              if ($scope.project.user.data_mod.bDetailShown[index] === true) {
                if ($scope.project.user.data_mod.data === undefined)
                  $scope.project.user.data_mod.data = [];
                $scope.project.user.data_mod.data[index] = item;
              }
            },

            initDetail: function(item, index) {
              if ($scope.project.user.data_mod.bDetailShown[index] === undefined || $scope.project.user.data_mod.bDetailShown[index] === false)
                return;

              $scope.aborter = $q.defer(),
                $http.get("http://api.opensight.cn/api/ivc/v1/users/" + item.username, {
                  timeout: $scope.aborter.promise
                    /*                       headers:  {
                     "Authorization" : "Bearer "+$scope.authToken,
                     "Content-Type": "application/json"
                     }
                     */
                }).success(function(response) {
                  $scope.project.user.data_mod.initData(response, index);
                }).error(function(response, status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "user" + item.username + "get失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  //tmpMsg.Token =  $scope.project.user.data_mod.addHotSpToken;
                  tmpMsg.Callback = "modMdCallBack";
                  if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut', { info: response.info, traceback: response.traceback });
                  } else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  //$scope.project.user.data_mod.hotRefresh(item, index);
                });
            },

            rm: function(item, index) {
              $scope.project.user.delete_one(item);
            },

            destroy: function() {}
          };
        })()



      }
    })();

    $scope.project.userlist = (function() {
      return {
        get: function() { //clean input,close add div
          if ($scope.project.data_mod.bDetailShown !== true) return;
          $scope.project.user.data_add.clean_data();
          //$scope.user.addShown = false;
          $scope.aborter = $q.defer(),
            $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/users?start=0&limit=100", {
              timeout: $scope.aborter.promise
                /*
                headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */

            }).success(function(response) {
              $scope.project.userlist.data = response;
            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取项目内用户列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              //tmpMsg.Token =  $scope.user.data_mod.addHotSpToken;
              tmpMsg.Callback = "user.show";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

        }
      };
    })();

    $scope.project.firmware = (function() {
      return {
        initFirmware: function() {
          if ($scope.project.firmwarelist.data !== undefined && $scope.project.firmwarelist.data.list !== undefined) {
            $scope.project.firmware.refresh();
          } else {
            $scope.destroy();
            $scope.project.firmware.addShown = false;
            $scope.project.firmwarelist.searchKeyOptionsData = [{
              name: "固件ID",
              key: "uuid"
            }, {
              name: "详细描述",
              key: "long_desc"
            }, {
              name: "描述",
              key: "desc"
            }, {
              name: "设备厂家",
              key: "vendor"
            }, {
              name: "设备硬件",
              key: "hardware_model"
            }, {
              name: "设备固件",
              key: "firmware_model"
            }];
            $scope.project.firmwarelist.seachKey = $scope.project.firmwarelist.searchKeyOptionsData[0].key;
            $scope.project.firmwarelist.seachValue = "";
            $scope.project.firmwarelist.match = {};
            $scope.project.firmwarelist.match.vendor = "";
            $scope.project.firmwarelist.match.hardware_model = "";
            $scope.project.firmwarelist.get();
          }
        },
        search: function() { //clean input,close add div
          if ($scope.project.data_mod.bDetailShown !== true) return;
          $scope.project.firmware.data_add.clean_data();

          $scope.aborter = $q.defer(),
            $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/firmwares?filter_key=" + $scope.project.firmwarelist.seachKey + "&filter_value=" + $scope.project.firmwarelist.seachValue +
              "&start=0&limit=100", {
                timeout: $scope.aborter.promise
              }).success(function(response) {
              $scope.project.firmwarelist.data = response;
            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取固件列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              //tmpMsg.Token =  $scope.camera.data_mod.addHotSpToken;
              tmpMsg.Callback = "firmware.show";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

        },
        match: function() { //clean input,close add div
          if ($scope.project.data_mod.bDetailShown !== true) return;
          $scope.project.firmware.data_add.clean_data();

          $scope.aborter = $q.defer(),
            $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/match_firmware?vendor=" + $scope.project.firmwarelist.match.vendor + "&hardware_model=" + $scope.project.firmwarelist.match.hardware_model, {
              timeout: $scope.aborter.promise
            }).success(function(response) {
              $scope.project.firmwarelist.data = {};
              $scope.project.firmwarelist.data.list = [];
              $scope.project.firmwarelist.data.list.push(response);
            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "match固件失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              //tmpMsg.Token =  $scope.camera.data_mod.addHotSpToken;
              tmpMsg.Callback = "firmware.show";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

        },
        refresh: function() {
          angular.forEach($scope.project.firmwarelist.data.list, function(item, index, array) {
            if ($scope.project.firmware.data_mod.bDetailShown && $scope.project.firmware.data_mod.bDetailShown[index] !== undefined)
              $scope.project.firmware.data_mod.bDetailShown[index] = false;
          });
          $scope.project.firmwarelist.data = {};
          $scope.project.firmware.initFirmware();
        },

        add: function() {
          if ($scope.project.firmware.addShown === undefined) $scope.project.firmware.addShown = false;
          $scope.project.firmware.addShown = !$scope.project.firmware.addShown;
          if ($scope.project.firmware.addShown === true)
            $scope.project.firmware.data_add.init();
        },

        data_add: (function() {
          return {
            clean_data: function() { //clean add field
              if ($scope.project.firmware.data_add === undefined)
                $scope.project.firmware.data_add = {};
              $scope.project.firmware.data_add.vendor = "";
              $scope.project.firmware.data_add.hardware_model = "";
              $scope.project.firmware.data_add.firmware_model = "";
              $scope.project.firmware.data_add.firmware_url = "";
              //                        $scope.project.firmware.data_add.project_name = "";
              $scope.project.firmware.data_add.desc = "";
              $scope.project.firmware.data_add.long_desc = "";
            },

            submitForm: function() { //add one firmware
              var postData = {
                vendor: $scope.project.firmware.data_add.vendor,
                hardware_model: $scope.project.firmware.data_add.hardware_model,
                firmware_model: $scope.project.firmware.data_add.firmware_model,
                desc: $scope.project.firmware.data_add.desc,
                long_desc: $scope.project.firmware.data_add.long_desc,
                //                            project_name: $scope.project.firmware.data_add.project_name,
                firmware_url: $scope.project.firmware.data_add.firmware_url
              };

              $scope.project.firmware.data_add.token = Math.random();
              $scope.aborter = $q.defer(),
                $http.post("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/firmwares", postData, {
                  timeout: $scope.aborter.promise
                }).success(function(response) {
                  $scope.project.firmware.refresh();
                }).error(function(response, status) {
                  var tmpMsg = {};

                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "加入固件失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token = $scope.project.firmware.data_add.token;
                  //tmpMsg.Callback = "addMdCallBack";
                  if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut', { info: response.info, traceback: response.traceback });
                  } else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                });
            },

            close: function() { //clean input,close add div
              $scope.project.firmware.add();
            },

            init: function() {
              $scope.project.firmware.data_add.clean_data();
            },

            addMdCallBack: function(event, msg) {

            }
          };
        })(),

        delete_one: function(item) {
          var r = confirm("确认删除firmware " + item.uuid + "吗？");
          if (r === false) return;
          $scope.project.firmware.data.delOneToken = Math.random();
          $scope.aborter = $q.defer(),
            $http.delete("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/firmwares/" + item.uuid, {
              timeout: $scope.aborter.promise
            }).success(function(response) {
              $scope.project.firmware.refresh();
            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "删除固件" + item.firmwarename + "失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Token = $scope.project.firmware.data.delOneToken;
              //tmpMsg.Callback = "delMdCallBack";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);
              //$scope.project.firmware.refresh();
            });
        },

        delMdCallBack: function(event, msg) {

        },

        data: (function() {
          return {
            showDetail: function(item, index) {
              if ($scope.project.firmware.data_mod.bDetailShown === undefined) $scope.project.firmware.data_mod.bDetailShown = [];
              if ($scope.project.firmware.data_mod.bDetailShown[index] === undefined) $scope.project.firmware.data_mod.bDetailShown[index] = false;
              $scope.project.firmware.data_mod.bDetailShown[index] = !(true === $scope.project.firmware.data_mod.bDetailShown[index]);

              if ($scope.project.firmware.data_mod.bDetailShown[index] === true) { //开
                $scope.project.firmware.data_mod.initDetail(item, index);
              } else {

              }
            }
          };
        })(),

        data_mod: (function() {
          return {
            initData: function(item, index) {
              if ($scope.project.firmware.data_mod.bDetailShown[index] === true) {
                if ($scope.project.firmware.data_mod.data === undefined)
                  $scope.project.firmware.data_mod.data = [];
                $scope.project.firmware.data_mod.data[index] = item;
              }
            },

            initDetail: function(item, index) {
              if ($scope.project.firmware.data_mod.bDetailShown[index] === undefined || $scope.project.firmware.data_mod.bDetailShown[index] === false)
                return;

              $scope.aborter = $q.defer(),
                $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/firmwares/" + item.uuid, {
                  timeout: $scope.aborter.promise

                }).success(function(response) {
                  $scope.project.firmware.data_mod.initData(response, index);
                }).error(function(response, status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "固件" + item.uuid + "get失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  //tmpMsg.Token =  $scope.project.firmware.data_mod.addHotSpToken;
                  tmpMsg.Callback = "modMdCallBack";
                  if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut', { info: response.info, traceback: response.traceback });
                  } else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  //$scope.project.firmware.data_mod.hotRefresh(item, index);
                });
            },

            submitForm: function(item, index) {
              var postData = {
                firmware_model: $scope.project.firmware.data_mod.data[index].firmware_model,
                firmware_url: $scope.project.firmware.data_mod.data[index].firmware_url,
                desc: $scope.project.firmware.data_mod.data[index].desc,
                long_desc: $scope.project.firmware.data_mod.data[index].long_desc
              };

              $scope.project.firmware.data_mod.updateCustomers = Math.random();
              $scope.aborter = $q.defer(),
                $http.put("http://api.opensight.cn/api/ivc/v1/firmwares/" + item.uuid, postData, {
                  timeout: $scope.aborter.promise
                }).success(function(response) {
                  $scope.project.firmware.refresh();
                }).error(function(response, status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "固件" + item.uuid + "更新固件失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token = $scope.project.firmware.data_mod.addHotSpToken;
                  tmpMsg.Callback = "modMdCallBack";
                  if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                    $scope.$emit("Logout", tmpMsg);
                  } else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  // $scope.project.firmware.data_mod.refresh(item, index);
                });
            },
            close: function(item, index) {
              $scope.project.firmware.data_mod.initDetail(item, index);
            },

            destroy: function() {}
          };
        })()



      }
    })();

    $scope.project.firmwarelist = (function() {
      return {
        get: function() { //clean input,close add div
          if ($scope.project.data_mod.bDetailShown !== true) return;
          $scope.project.firmware.data_add.clean_data();
          //$scope.project.firmware.addShown = false;
          $scope.aborter = $q.defer(),
            $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + "/firmwares?start=0&limit=100", {
              timeout: $scope.aborter.promise
                /*
                 headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */

            }).success(function(response) {
              $scope.project.firmwarelist.data = response;
            }).error(function(response, status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取项目内固件列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              //tmpMsg.Token =  $scope.project.firmware.data_mod.addHotSpToken;
              tmpMsg.Callback = "firmware.show";
              if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut', { info: response.info, traceback: response.traceback });
              } else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

        }
      };
    })();

    (function() {
      $scope.project.bill = {
        addShown: false,
        start: {
          dt: new Date(),
          opened: false
        },
        end: {
          dt: new Date(),
          opened: false
        },
        detail: [],
        init: function() {
          $scope.destroy();
          $scope.project.bill.initAddData();
          $scope.project.bill.query();
        },
        open: function(obj) {
          obj.opened = true;
        },
        initAddData: function() {
          return $scope.project.bill.data_add = {
            bill_type: 0,
            amount: 100,
            invoiced: false,
            start: {
              dt: new Date(),
              opened: false
            },
            end: {
              dt: new Date(),
              opened: false
            },
            comment: ''
          };
        },
        get: function(params) {
          $scope.project.bill.getAccount();

          $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + '/bills', {
            params: params
              // timeout: $scope.aborter.promise
          }).success(function(response) {
            $scope.project.bill.data = response;
            $scope.project.bill.detail = [];
            // $scope.page = page($scope.bills.start, $scope.bills.total, params.limit, 2);
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "获取账单失败";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            //tmpMsg.Token =  $scope.project.firmware.data_mod.addHotSpToken;
            // tmpMsg.Callback = "firmware.show";
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', {
                info: response.info,
                traceback: response.traceback
              });
            } else
              $scope.$emit("Ctr1ModalShow", tmpMsg);
          });
          $scope.project.bill.lastParams = angular.copy(params);
        },
        query: function() {
          $scope.params = {
            start_from: dateFactory.getStart($scope.project.bill.start.dt),
            end_to: dateFactory.getEnd($scope.project.bill.end.dt),
            start: 0,
            limit: 10
          };
          $scope.project.bill.get($scope.params);
        },
        getAccount: function() {
          $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + '/account', {}).success(function(response) {
            $scope.project.bill.account = response;
            $scope.project.bill.editing = false;
            $scope.project.bill.price_info = $scope.project.bill.account.price_info;
            // $scope.page = page($scope.bills.start, $scope.bills.total, params.limit, 2);
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "获取账户信息失败";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            //tmpMsg.Token =  $scope.project.firmware.data_mod.addHotSpToken;
            // tmpMsg.Callback = "firmware.show";
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', {
                info: response.info,
                traceback: response.traceback
              });
            } else{
              $scope.$emit("Ctr1ModalShow", tmpMsg);
            }
          });
        },
        showBillModal: function(){
          $scope.project.bill.price_info = $scope.project.bill.account.price_info;
          $('#billModal').modal('show');
        },
        saveAccount: function(){
          $http.put("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + '/account', {
            price_info: $scope.project.bill.price_info
          }).success(function(response) {
            $scope.project.bill.editing = false;
            $scope.project.bill.account.price_info = $scope.project.bill.price_info;
            $('#billModal').modal('hide');
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "修改账户信息失败";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            //tmpMsg.Token =  $scope.project.firmware.data_mod.addHotSpToken;
            // tmpMsg.Callback = "firmware.show";
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', {
                info: response.info,
                traceback: response.traceback
              });
            } else
              $scope.$emit("Ctr1ModalShow", tmpMsg);
          });
        },
        refresh: function() {
          $scope.project.bill.get($scope.project.bill.lastParams);
        },
        showAdd: function() {
          $scope.project.bill.addShown = !$scope.project.bill.addShown;
        },
        add: function() {
          var bill = {
            bill_type: $scope.project.bill.data_add.bill_type,
            invoiced: $scope.project.bill.data_add.invoiced,
            start_from: dateFactory.getStart($scope.project.bill.data_add.start.dt),
            end_to: dateFactory.getEnd($scope.project.bill.data_add.end.dt),
            comment: $scope.project.bill.data_add.comment
          };
          if (0 === $scope.project.bill.data_add.bill_type) {
            bill.income = $scope.project.bill.data_add.amount;
            bill.expense = 0;
          } else {
            bill.income = 0;
            bill.expense = $scope.project.bill.data_add.amount;
          }
          $http.post("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + '/bills', bill).success(function(response) {
            $scope.project.bill.showAdd();
            $scope.project.bill.initAddData();
            $scope.project.bill.refresh();
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "添加账单失败。";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            //tmpMsg.Token =  $scope.project.firmware.data_mod.addHotSpToken;
            // tmpMsg.Callback = "firmware.show";
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', {
                info: response.info,
                traceback: response.traceback
              });
            } else
              $scope.$emit("Ctr1ModalShow", tmpMsg);
          });
        },
        showDetail: function(item, index) {
          if (undefined === $scope.project.bill.detail[index]) {
            $scope.project.bill.detail[index] = angular.copy(item);
          }
          $scope.project.bill.detail[index].shown = true !== $scope.project.bill.detail[index].shown;
        },
        modify: function(index) {
          $http.put("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + '/bills/' + $scope.project.bill.detail[index].bill_id, {
            invoiced: $scope.project.bill.detail[index].invoiced,
            comment: $scope.project.bill.detail[index].comment
          }).success(function(response) {
            $scope.project.bill.refresh();
            // $scope.page = page($scope.bills.start, $scope.bills.total, params.limit, 2);
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "修改账单失败。";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            //tmpMsg.Token =  $scope.project.firmware.data_mod.addHotSpToken;
            // tmpMsg.Callback = "firmware.show";
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', {
                info: response.info,
                traceback: response.traceback
              });
            } else
              $scope.$emit("Ctr1ModalShow", tmpMsg);
          });
        },
        remove: function(bill, index) {
          if (false === confirm('确认删除账单：' + bill + ' 吗？')) {
            return;
          }
          $http.delete("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + '/bills/' + bill, {}).success(function(response) {
            $scope.project.bill.refresh();
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "删除账单失败。";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            //tmpMsg.Token =  $scope.project.firmware.data_mod.addHotSpToken;
            // tmpMsg.Callback = "firmware.show";
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', {
                info: response.info,
                traceback: response.traceback
              });
            } else
              $scope.$emit("Ctr1ModalShow", tmpMsg);
          });
        }
      };
    })();

    (function() {
      var api = 'http://api.opensight.cn/api/ivc/v1/projects/';
      var session = {
        init: function() {
          $scope.destroy();
          session.detail = [];
          session.page = pageFactory.init({
            query: session.query,
            jumperror: function() {
              alert('页码输入不正确。');
            }
          });
          session.search();
        },
        query: function(params) {
          $scope.aborter = $q.defer();
          $http.get(api + $scope.project.data_mod.selectItem.name + "/sessions", {
            params: params,
            timeout: $scope.aborter.promise
          }).success(function(response) {
            session.data = response;
            pageFactory.set(response, params);
          }).error(function(response, status) {
            var tmpMsg = {
              Label: '错误',
              ErrorContent: '获取会话列表失败',
              ErrorContentDetail: response,
              SingleButtonShown: true,
              MutiButtonShown: false
            };
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              $state.go('logOut', { info: response.info, traceback: response.traceback });
            } else {
              $scope.$emit("Ctr1ModalShow", tmpMsg);
            }
          });
        },
        search: function() {
          var params = {
            start: 0,
            limit: session.page.limit
          };
          session.query(params);
        },
        remove: function(item, index) {
          if (false === confirm("是否停止当前会话吗？")) {
            return;
          }
          $scope.aborter = $q.defer();
          $http.delete(api + $scope.project.data_mod.selectItem.name + '/cameras/' + item.camera_uuid + '/sessions/' + item.uuid, {
            timeout: $scope.aborter.promise
          }).success(function(response) {
            session.page.pageChanged();
          }).error(function(response, status) {
            var tmpMsg = {};
            tmpMsg.Label = "错误";
            tmpMsg.ErrorContent = "删除会话失败";
            tmpMsg.ErrorContentDetail = response;
            tmpMsg.SingleButtonShown = true;
            tmpMsg.MutiButtonShown = false;
            if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
              //$scope.$emit("Logout", tmpMsg);
              $state.go('logOut', { info: response.info, traceback: response.traceback });
            } else
              $scope.$emit("Ctr1ModalShow", tmpMsg);
          });
        },
        showDetail: function(item, index) {
          if (true === item.bDetailShown) {
            item.bDetailShown = false;
          } else {
            item.bDetailShown = true;
            session.detail[index] = angular.copy(item);
          }
        }
      };
      $scope.project.session = session;
    })();

    $scope.destroy = function() {
      if (undefined !== $scope.aborter) {
        $scope.aborter.resolve();
        delete $scope.aborter;
      }
    };

    $scope.$on('$destroy', $scope.destroy);

    $scope.project.show();

  }
]);
