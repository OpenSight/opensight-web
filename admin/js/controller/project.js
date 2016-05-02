app.register.controller('Project', [
  '$scope', '$http', '$q', '$state','FileSaver', 'Blob', 'dateFactory', 'pageFactory',
  function($scope, $http, $q, $state, FileSaver, Blob, dateFactory, pageFactory){
  $scope.project = (function () {
    return {
      show: function () {
        $scope.destroy();
        $scope.authToken = G_token;
        $scope.project.data_mod.showList();
        $scope.project.addShown = false;
        $scope.projectlist.searchKeyOptionsData = [
          {
            name: "项目名称",
            key: "name"
          },
          {
            name: "描述",
            key: "desc"
          },
          {
            name: "详细描述",
            key: "long_desc"
          },
          {
            name: "项目标题",
            key: "title"
          },
          {
            name: "媒体服务器",
            key: "media_server"
          }
        ];
        $scope.projectlist.seachKey = $scope.projectlist.searchKeyOptionsData[0].key;
        $scope.projectlist.seachValue = "";
        $scope.projectlist.get();
      },
      search: function () {//clean input,close add div
        $scope.project.data_add.clean_data();
        $scope.aborter = $q.defer(),
          $http.get("http://api.opensight.cn/api/ivc/v1/projects?filter_key="
            +$scope.projectlist.seachKey+"&filter_value="+$scope.projectlist.seachValue+
            "&start=0&limit=100", {
            timeout: $scope.aborter.promise
            /*                       headers:  {
             "Authorization" : "Bearer "+$scope.authToken,
             "Content-Type": "application/json"
             }
             */

          }).success(function (response) {
              $scope.projectlist.data = response;
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取项目列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              //tmpMsg.Token =  $scope.camera.data_mod.addHotSpToken;
              tmpMsg.Callback = "project.show";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

      },
      refresh: function () {
        angular.forEach($scope.projectlist.data.list, function (item, index, array) {
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
            $scope.project.data_add.project_name = "";
            $scope.project.data_add.title = "";
            $scope.project.data_add.media_server = "";
            $scope.project.data_add.max_media_sessions = "";
            $scope.project.data_add.is_public = false;
            $scope.project.data_add.desc = "";
            $scope.project.data_add.long_desc = "";
          },

          submitForm: function () {//add one project
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
              }).success(function (response) {
                  $scope.project.refresh();
                }).error(function (response,status) {
                  //response.ErrorContent = "添加project失败";
                  //$scope.$emit("errorEmit",response);
                  //bendichuliweimiao

                  var tmpMsg = {};

                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "添加project失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token =  $scope.project.data_add.token;
                  tmpMsg.Callback = "addMdCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut',{info: response.info,traceback: response.traceback});
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                   // $scope.project.refresh();
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
        var r=confirm("确认删除project "+ item.name +"吗？");
        if (r===false) return;
        $scope.project.data.delOneToken = Math.random();
        $scope.aborter = $q.defer(),
          $http.delete("http://api.opensight.cn/api/ivc/v1/projects/"+item.name, {
            timeout: $scope.aborter.promise
            /*                       headers:  {
             "Authorization" : "Bearer "+$scope.authToken,
             "Content-Type": "application/json"
             }
             */
          }).success(function (response) {
              $scope.project.refresh();
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "删除project"+ item.name +"失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Token =  $scope.project.data.delOneToken;
              tmpMsg.Callback = "delMdCallBack";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
                $scope.$emit("Ctr1ModalShow", tmpMsg);
              //$scope.project.refresh();
            });
      },

      delMdCallBack:function (event, msg) {

      },

      data: (function () {
        return {
          showDetail: function (item, index) {
            /*
            if ($scope.project.data_mod.bDetailShown === undefined) $scope.project.data_mod.bDetailShown = false;
            $scope.project.data_mod.bDetailShown = !(true === $scope.project.data_mod.bDetailShown);
            */
            //$state.go('home.projectDetail');
            $scope.project.listShown = false;
            $scope.project.data_mod.bDetailShown = true;
            if ($scope.project.data_mod.bDetailShown === true) {//开
              $scope.project.data_mod.selectItem = item;
              if ($scope.project.data_mod.tabs===undefined)
                $scope.project.data_mod.tabs = [];
              $scope.project.data_mod.tabs[0] = true;
              $scope.project.data_mod.initDetail();


            } else {

            }
          }
        };
      })(),

      data_mod: (function () {
        return {
          showList: function() {
            $scope.project.listShown = true;
            $scope.project.data_mod.bDetailShown = false;
          },
          initData: function(item) {
            if ($scope.project.data_mod.bDetailShown === true) {
              /*
              $scope.project.data_mod.name = item.name;
              $scope.project.data_mod.title = item.title;
              $scope.project.data_mod.max_media_sessions = item.max_media_sessions;
              $scope.project.data_mod.desc = item.desc;
              $scope.project.data_mod.long_desc = item.long_desc;
              $scope.project.data_mod.ctime = item.ctime;
              $scope.project.data_mod.utime = item.utime;*/
              $scope.project.data_mod.data = item;
            }
          },

          initDetail: function () {
            if ($scope.project.data_mod.bDetailShown === undefined
              || $scope.project.data_mod.bDetailShown === false )
              return;

            $scope.aborter = $q.defer(),
              $http.get("http://api.opensight.cn/api/ivc/v1/projects/"+$scope.project.data_mod.selectItem.name, {
                timeout: $scope.aborter.promise
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */
              }).success(function (response) {
                  $scope.project.data_mod.initData(response);
                }).error(function (response,status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "project"+ $scope.project.data_mod.selectItem.name +"get失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token =  $scope.project.data_mod.addHotSpToken;
                  tmpMsg.Callback = "modMdCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut',{info: response.info,traceback: response.traceback});
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  //$scope.project.data_mod.hotRefresh(item, index);
                });
          },

          submitForm: function () {
            var postData =  {
              title: $scope.project.data_mod.data.title,
              max_media_sessions: $scope.project.data_mod.data.max_media_sessions,
              media_server: $scope.project.data_mod.data.media_server,
              desc: $scope.project.data_mod.data.desc,
              long_desc: $scope.project.data_mod.data.long_desc,
              is_public: $scope.project.data_mod.data.is_public
            };

            //$scope.project.data_mod.submitForm = Math.random();
            $scope.aborter = $q.defer(),
              $http.put("http://api.opensight.cn/api/ivc/v1/projects/"+$scope.project.data_mod.selectItem.name, postData, {
                timeout: $scope.aborter.promise
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */
              }).success(function (response) {

                }).error(function (response,status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "project "+ $scope.project.data_mod.selectItem.name+" 更新失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token =  $scope.project.data_mod.submitForm;
                  //tmpMsg.Callback = "odCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut',{info: response.info,traceback: response.traceback});
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                });
          },
          reset: function () {
            $scope.project.data_mod.initDetail();
          },

          /*
          modMdCallBack:function (event, msg) {


          },
           */
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
          $http.get("http://api.opensight.cn/api/ivc/v1/projects?start=0&limit=100", {
            timeout: $scope.aborter.promise
            /*                       headers:  {
             "Authorization" : "Bearer "+$scope.authToken,
             "Content-Type": "application/json"
             }
             */

          }).success(function (response) {
              $scope.projectlist.data = response;
            }).error(function (response,status) {
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

  $scope.project.device = (function () {
    return {
      initDevices: function () {
        if ($scope.project.device.data!==undefined && $scope.project.device.data.list!==undefined){
          $scope.project.device.refresh();
        } else {
          $scope.destroy();
          $scope.project.device.addShown = false;
          $scope.project.device.detail = [];
          $scope.project.device.searchKeyOptionsData = [
            {
              name: "设备名称",
              key: "name"
            },
            {
              name: "描述",
              key: "desc"
            },
            {
              name: "详细描述",
              key: "long_desc"
            },
            {
              name: "设备uuid",
              key: "uuid"
            },
            {
              name: "设备类型",
              key: "type"
            },
            {
              name: "设备登录名",
              key: "login_code"
            },
            {
              name: "设备固件",
              key: "firmware_model"
            },
            {
              name: "设备硬件",
              key: "hardware_model"
            },
            {
              name: "设备厂家",
              key: "vendor"
            }
          ];
          $scope.project.device.seachKey = $scope.project.device.searchKeyOptionsData[0].key;
          $scope.project.device.seachValue = "";
          $scope.page = pageFactory.init();
          $scope.pageChanged = function() {
            $scope.lastParams.start = pageFactory.getStart();
            $scope.project.device.query($scope.lastParams);
          };
          $scope.jump = function() {
            if (true === pageFactory.jump($scope.jumpto)) {
              $scope.pageChanged();
            } else {
              alert('页码输入不正确。')
            }
            $scope.jumpto = '';
          };

          $scope.project.device.search();
        }
      },
      query: function(params){
        $scope.aborter = $q.defer();
        $http.get("http://api.opensight.cn/api/ivc/v1/projects/"+$scope.project.data_mod.selectItem.name+ "/devices", {
          params: params,
          timeout: $scope.aborter.promise
        }).success(function (response) {
          $scope.project.device.data = response;
          pageFactory.set(response);
        }).error(function (response,status) {
          var tmpMsg = {
            Label: '错误',
            ErrorContent: '获取设备列表失败',
            ErrorContentDetail: response,
            SingleButtonShown: true,
            MutiButtonShown: false,
            Callback: 'device.show'
          };
          if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
            $state.go('logOut',{info: response.info,traceback: response.traceback});
          } else{
            $scope.$emit("Ctr1ModalShow", tmpMsg);
          }
        });
        $scope.lastParams = angular.copy(params);
      },
      search: function () {//clean input,close add div
        if ($scope.project.data_mod.bDetailShown !== true) return;
        $scope.project.device.data_add.clean_data();
        var params = {
          filter_key: $scope.project.device.seachKey,
          filter_value: $scope.project.device.seachValue,
          start: 0,
          limit: 10
        };
        $scope.project.device.query(params);
      },
      refresh: function () {
        angular.forEach($scope.project.device.data.list, function (item, index, array) {
          if ($scope.project.device.data_mod.bDetailShown && $scope.project.device.data_mod.bDetailShown[index] !== undefined)
            $scope.project.device.data_mod.bDetailShown[index]  = false;
        });
        $scope.project.device.data = {};
        $scope.project.device.initDevices();
      },
      add: function () {
        if ($scope.project.device.addShown === undefined) $scope.project.device.addShown = false;
        $scope.project.device.addShown = !$scope.project.device.addShown;
        if ($scope.project.device.addShown === true)
          $scope.project.device.data_add.init();
      },

      data_add: (function () {
        return {
          clean_data: function () {//clean add field
            if ($scope.project.device.data_add === undefined)
              $scope.project.device.data_add = {};
            $scope.project.device.data_add.name = "";
            $scope.project.device.data_add.type = "camera";
            $scope.project.device.data_add.flags = 0;
            $scope.project.device.data_add.login_code = "admin";
            $scope.project.device.data_add.login_passwd = "123456";
            $scope.project.device.data_add.firmware_model = "";
            $scope.project.device.data_add.hardware_model = "";
            $scope.project.device.data_add.media_channel_num = 0;
            $scope.project.device.data_add.vendor = "";
            $scope.project.device.data_add.desc = "";
            $scope.project.device.data_add.long_desc = "";
            $scope.project.device.data_add.longitude = 0;
            $scope.project.device.data_add.latitude = 0;
            $scope.project.device.data_add.altitude = 0;
          },

          submitForm: function () {//add one device
            var postData = {
              name: $scope.project.device.data_add.name,
              type: $scope.project.device.data_add.type,
              flags: $scope.project.device.data_add.flags,
              login_code: $scope.project.device.data_add.login_code,
              login_passwd: $scope.project.device.data_add.login_passwd,
              desc: $scope.project.device.data_add.desc,
              long_desc: $scope.project.device.data_add.long_desc,
              firmware_model: $scope.project.device.data_add.firmware_model,
              hardware_model: $scope.project.device.data_add.hardware_model,
              vendor: $scope.project.device.data_add.vendor,
              media_channel_num: $scope.project.device.data_add.media_channel_num,
              longitude: $scope.project.device.data_add.longitude,
              latitude: $scope.project.device.data_add.latitude,
              altitude: $scope.project.device.data_add.altitude
            };

            $scope.project.device.data_add.token = Math.random();
            $scope.aborter = $q.defer(),
              $http.post("http://api.opensight.cn/api/ivc/v1/projects/"+$scope.project.data_mod.selectItem.name+"/devices", postData, {
                timeout: $scope.aborter.promise
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */
              }).success(function (response) {
                  $scope.project.device.refresh();
                }).error(function (response,status) {
                  //response.ErrorContent = "添加device失败";
                  //$scope.$emit("errorEmit",response);
                  //bendichuliweimiao

                  var tmpMsg = {};

                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "添加device失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token =  $scope.project.device.data_add.token;
                  //tmpMsg.Callback = "addMdCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut',{info: response.info,traceback: response.traceback});
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  // $scope.project.device.refresh();
                });
          },

          close: function () {//clean input,close add div
            //$scope.project.device.data_add.clean_data();
            //$scope.project.device.addShown = false;
            $scope.project.device.add();
          },

          init: function () {
            $scope.project.device.data_add.clean_data();
          },

          addMdCallBack:function (event, msg) {

          }
        };
      })(),

      delete_one: function (item) {
        var r=confirm("确认删除device "+ item.name +"吗？");
        if (r===false) return;
        $scope.project.device.data.delOneToken = Math.random();
        $scope.aborter = $q.defer();
        $http.delete("http://api.opensight.cn/api/ivc/v1/projects/"+ $scope.project.data_mod.selectItem.name +"/devices/"+item.uuid, {
          timeout: $scope.aborter.promise
        }).success(function (response) {
          $scope.project.device.refresh();
        }).error(function (response,status) {
          var tmpMsg = {};
          tmpMsg.Label = "错误";
          tmpMsg.ErrorContent = "删除device: "+ item.name +" 失败";
          tmpMsg.ErrorContentDetail = response;
          tmpMsg.SingleButtonShown = true;
          tmpMsg.MutiButtonShown = false;
          tmpMsg.Token =  $scope.project.device.data.delOneToken;
          if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
            //$scope.$emit("Logout", tmpMsg);
            $state.go('logOut',{info: response.info,traceback: response.traceback});
          }else
            $scope.$emit("Ctr1ModalShow", tmpMsg);
        });
      },
      upgrade: function(item){
        if (false === confirm('升级成功后设备会重启，是否继续？')){
          return;
        }
        $http.post("http://api.opensight.cn/api/ivc/v1/projects/"+ $scope.project.data_mod.selectItem.name +"/devices/" + item.uuid + '/firmware', {}).success(function (response) {
          $scope.project.device.refresh();
        }).error(function (response,status) {
          var tmpMsg = {};
          tmpMsg.Label = "错误";
          tmpMsg.ErrorContent = "升级device: "+ item.name +" 失败";
          tmpMsg.ErrorContentDetail = response;
          tmpMsg.SingleButtonShown = true;
          tmpMsg.MutiButtonShown = false;
          // tmpMsg.Token =  $scope.project.device.data.delOneToken;
          if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
            //$scope.$emit("Logout", tmpMsg);
            $state.go('logOut',{info: response.info,traceback: response.traceback});
          } else {
            $scope.$emit("Ctr1ModalShow", tmpMsg);
          }
        });
      },
      delMdCallBack:function (event, msg) {

      },

      showDetail: function (item, index) {
        if (true === item.bDetailShown){
          item.bDetailShown = false;
        } else {
          item.bDetailShown = true;
          $scope.project.device.detail[index] = angular.copy(item);
        }
      },
      modify: function (item,index) {
        var data =  {
          flags: $scope.project.device.detail[index].flags,
          login_code: $scope.project.device.detail[index].login_code,
          login_passwd: $scope.project.device.detail[index].login_passwd,
          desc: $scope.project.device.detail[index].desc,
          long_desc: $scope.project.device.detail[index].long_desc,
          firmware_model: $scope.project.device.detail[index].firmware_model,
          hardware_model: $scope.project.device.detail[index].hardware_model,
          vendor: $scope.project.device.detail[index].vendor,
          media_channel_num: $scope.project.device.detail[index].media_channel_num,
          longitude: $scope.project.device.detail[index].longitude,
          login_passwd: $scope.project.device.detail[index].login_passwd,
          latitude: $scope.project.device.detail[index].latitude,
          altitude: $scope.project.device.detail[index].altitude
        };

        //$scope.project.device.data_mod.submitForm = Math.random();
        $scope.aborter = $q.defer();
        $http.put("http://api.opensight.cn/api/ivc/v1/projects/" +$scope.project.data_mod.selectItem.name+ "/devices/"+item.uuid, data, {
          timeout: $scope.aborter.promise
        }).success(function (response) {
          $scope.project.device.data.list[index] = angular.copy($scope.project.device.detail[index], $scope.project.device.data.list[index]);
          $scope.project.device.showDetail(item, index);
        }).error(function (response,status) {
          var tmpMsg = {};
          tmpMsg.Label = "错误";
          tmpMsg.ErrorContent = "device "+ $scope.project.data_mod.selectItem.name+" 更新失败";
          tmpMsg.ErrorContentDetail = response;
          tmpMsg.SingleButtonShown = true;
          tmpMsg.MutiButtonShown = false;
          tmpMsg.Token =  $scope.project.device.data_mod.submitForm;
          //tmpMsg.Callback = "odCallBack";
          if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
            //$scope.$emit("Logout", tmpMsg);
            $state.go('logOut',{info: response.info,traceback: response.traceback});
          }else
            $scope.$emit("Ctr1ModalShow", tmpMsg);
        });
      }
    }
  })();

  $scope.project.camera = (function () {
    return {
      initCameras: function () {
        if ($scope.project.cameralist.data!==undefined && $scope.project.cameralist.data.list!==undefined){
          $scope.project.camera.refresh();
        }else{
          $scope.destroy();
          $scope.project.camera.addShown = false;
          $scope.project.cameralist.searchKeyOptionsData = [
            {
              name: "摄像头名称",
              key: "name"
            },
            {
              name: "描述",
              key: "desc"
            },
            {
              name: "详细描述",
              key: "long_desc"
            },
            {
              name: "摄像头uuid",
              key: "uuid"
            },
            {
              name: "设备uuid",
              key: "device_uuid"
            }
          ];
          $scope.project.cameralist.seachKey = $scope.project.cameralist.searchKeyOptionsData[0].key;
          $scope.project.cameralist.seachValue = "";
          $scope.project.cameralist.get();
        }
      },
      search: function () {//clean input,close add div
        if ($scope.project.data_mod.bDetailShown !== true) return;
        $scope.project.camera.data_add.clean_data();
        //$scope.camera.addShown = false;
        $scope.aborter = $q.defer(),
          $http.get("http://api.opensight.cn/api/ivc/v1/projects/"
            +$scope.project.data_mod.selectItem.name+ "/cameras?filter_key="
            +$scope.project.cameralist.seachKey+"&filter_value="+$scope.project.cameralist.seachValue+
            "&start=0&limit=100", {
            timeout: $scope.aborter.promise
            /*                       headers:  {
             "Authorization" : "Bearer "+$scope.authToken,
             "Content-Type": "application/json"
             }
             */

          }).success(function (response) {
              for (var i = 0; i < response.list.length; i++){
                var flags = parse(response.list[i].flags);
                response.list[i].ability = flags.ability;
                response.list[i].live = flags.live;
              }
              $scope.project.cameralist.data = response;
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取摄像头列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              //tmpMsg.Token =  $scope.camera.data_mod.addHotSpToken;
              tmpMsg.Callback = "camera.show";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

      },
      refresh: function () {
        angular.forEach($scope.project.cameralist.data.list, function (item, index, array) {
          if ($scope.project.camera.data_mod.bDetailShown && $scope.project.camera.data_mod.bDetailShown[index] !== undefined)
            $scope.project.camera.data_mod.bDetailShown[index]  = false;
        });
        $scope.project.cameralist.data = {};
        $scope.project.camera.initCameras();
      },

      add: function () {
        if ($scope.project.camera.addShown === undefined) $scope.project.camera.addShown = false;
        $scope.project.camera.addShown = !$scope.project.camera.addShown;
        if ($scope.project.camera.addShown === true)
          $scope.project.camera.data_add.init();
      },

      data_add: (function () {
        return {
          clean_data: function () {//clean add field
            if ($scope.project.camera.data_add === undefined)
              $scope.project.camera.data_add = {};

            $scope.project.camera.data_add.stearmOptions = [{
              text: 'LD',
              title: '流畅',
              on: false
            }, {
              text: 'SD',
              title: '标清',
              on: false
            }, {
              text: 'HD',
              title: '高清',
              on: false
            }, {
              text: 'FHD',
              title: '超清',
              on: false
            }];
            $scope.project.camera.data_add.pic = false;
            $scope.project.camera.data_add.name = "";
            $scope.project.camera.data_add.channel_index = 0;
            $scope.project.camera.data_add.device_uuid = "";
            $scope.project.camera.data_add.desc = "";
            $scope.project.camera.data_add.long_desc = "";
            $scope.project.camera.data_add.longitude = 0;
            $scope.project.camera.data_add.latitude = 0;
            $scope.project.camera.data_add.altitude = 0;
          },

          submitForm: function () {//add one camera
            var allFlags = 0;
            for (var i = 0; i<$scope.project.camera.data_add.stearmOptions.length; i++)
            {
              if ($scope.project.camera.data_add.stearmOptions[i].on === true)
                allFlags+= (1<<i);
            }
            if ($scope.project.camera.data_add.pic === true)
              allFlags+= (1<<4);
            var postData = {
              name: $scope.project.camera.data_add.name,
              device_uuid: $scope.project.camera.data_add.device_uuid,
              flags: allFlags,
              channel_index: $scope.project.camera.data_add.channel_index,
              desc: $scope.project.camera.data_add.desc,
              long_desc: $scope.project.camera.data_add.long_desc,
              longitude: $scope.project.camera.data_add.longitude,
              latitude: $scope.project.camera.data_add.latitude,
              altitude: $scope.project.camera.data_add.altitude
            };

            $scope.project.camera.data_add.token = Math.random();
            $scope.aborter = $q.defer(),
              $http.post("http://api.opensight.cn/api/ivc/v1/projects/"+$scope.project.data_mod.selectItem.name+"/cameras", postData, {
                timeout: $scope.aborter.promise
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */
              }).success(function (response) {
                  $scope.project.camera.refresh();
                }).error(function (response,status) {
                  //response.ErrorContent = "添加camera失败";
                  //$scope.$emit("errorEmit",response);
                  //bendichuliweimiao

                  var tmpMsg = {};

                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "添加camera失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token =  $scope.project.camera.data_add.token;
                  //tmpMsg.Callback = "addMdCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut',{info: response.info,traceback: response.traceback});
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  // $scope.project.camera.refresh();
                });
          },

          close: function () {//clean input,close add div
            //$scope.project.camera.data_add.clean_data();
            //$scope.project.camera.addShown = false;
            $scope.project.camera.add();
          },

          init: function () {
            $scope.project.camera.data_add.clean_data();
          },

          addMdCallBack:function (event, msg) {

          }
        };
      })(),

      delete_one: function (item) {
        var r=confirm("确认删除camera "+ item.name +"吗？");
        if (r===false) return;
        $scope.project.camera.data.delOneToken = Math.random();
        $scope.aborter = $q.defer(),
          $http.delete("http://api.opensight.cn/api/ivc/v1/projects/"+ $scope.project.data_mod.selectItem.name +"/cameras/"+item.uuid, {
            timeout: $scope.aborter.promise
            /*                       headers:  {
             "Authorization" : "Bearer "+$scope.authToken,
             "Content-Type": "application/json"
             }
             */
          }).success(function (response) {
              $scope.project.camera.refresh();
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "删除camera"+ item.name +"失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Token =  $scope.project.camera.data.delOneToken;
              //tmpMsg.Callback = "delMdCallBack";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
                $scope.$emit("Ctr1ModalShow", tmpMsg);
              //$scope.project.camera.refresh();
            });
      },

      delMdCallBack:function (event, msg) {

      },

      data: (function () {
        return {
          showDetail: function (item, index) {
            if ($scope.project.camera.data_mod.bDetailShown === undefined) $scope.project.camera.data_mod.bDetailShown = [];
            if ($scope.project.camera.data_mod.bDetailShown[index] === undefined) $scope.project.camera.data_mod.bDetailShown[index] = false;
            $scope.project.camera.data_mod.bDetailShown[index] = !(true === $scope.project.camera.data_mod.bDetailShown[index]);

            if ($scope.project.camera.data_mod.bDetailShown[index] === true) {//开
              $scope.project.camera.data_mod.initDetail(item, index);
            } else {

            }
          }
        };
      })(),

      data_mod: (function () {
        return {
          initData: function(item,index) {
            if ($scope.project.camera.data_mod.bDetailShown[index] === true) {
              if ($scope.project.camera.data_mod.data === undefined)
                $scope.project.camera.data_mod.data = [];
              $scope.project.camera.data_mod.data[index] = item;

              if ((item.flags & 0x20) === 0)
                $scope.project.camera.data_mod.data[index].live = true;
              else $scope.project.camera.data_mod.data[index].live = false;

              if ((item.flags & 0x10) === 0)
                $scope.project.camera.data_mod.data[index].pic = false;
              else $scope.project.camera.data_mod.data[index].pic = true;

              $scope.project.camera.data_mod.data[index].stearmOptions = [{
                text: 'LD',
                title: '流畅',
                on: !((item.flags & 0x01) === 0)
              }, {
                text: 'SD',
                title: '标清',
                on: !((item.flags & 0x02) === 0)
              }, {
                text: 'HD',
                title: '高清',
                on: !((item.flags & 0x04) === 0)
              }, {
                text: 'FHD',
                title: '超清',
                on: !((item.flags & 0x08) === 0)
              }];
            }
          },

          initDetail: function (item,index) {
            if ($scope.project.camera.data_mod.bDetailShown[index] === undefined
              || $scope.project.camera.data_mod.bDetailShown[index] === false)
              return;

            $scope.aborter = $q.defer(),
              $http.get("http://api.opensight.cn/api/ivc/v1/projects/" +$scope.project.data_mod.selectItem.name+ "/cameras/"+item.uuid, {
                timeout: $scope.aborter.promise
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */
              }).success(function (response) {
                  $scope.project.camera.data_mod.initData(response,index);
                }).error(function (response,status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "camera"+ item.name +"get失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  //tmpMsg.Token =  $scope.project.camera.data_mod.addHotSpToken;
                  tmpMsg.Callback = "modMdCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut',{info: response.info,traceback: response.traceback});
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  //$scope.project.camera.data_mod.hotRefresh(item, index);
                });
          },

          play_switch: function (item,enable) {
            var tip = enable ? '允许直播后可以远程观看直播，是否继续？' : '禁止直播后无法远程观看，同时会停止正在播放的直播，是否继续？';
            if (false === confirm(tip)){
              return false;
            }
            var postData =  {
              enable: enable
            };

            $scope.aborter = $q.defer(),
              $http.post("http://api.opensight.cn/api/ivc/v1/projects/" +$scope.project.data_mod.selectItem.name+ "/cameras/"+item.uuid+"/stream_toggle", postData,{
                timeout: $scope.aborter.promise
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */
              }).success(function (response) {
                  item.live = enable;
                }).error(function (response,status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "camera"+ item.name +"直播控制失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  //tmpMsg.Token =  $scope.project.camera.data_mod.addHotSpToken;
                  tmpMsg.Callback = "modMdCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut',{info: response.info,traceback: response.traceback});
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  //$scope.project.camera.data_mod.hotRefresh(item, index);
                });
          },

          reboot: function (item, index) {
            $scope.aborter = $q.defer(),
              $http.post("http://api.opensight.cn/api/ivc/v1/projects/" +$scope.project.data_mod.selectItem.name+ "/cameras/"+item.uuid+"/reboot",{
                timeout: $scope.aborter.promise
              }).success(function (response) {

                }).error(function (response,status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "camera  "+ item.name +"  重启失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Callback = "modMdCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){

                    $state.go('logOut',{info: response.info,traceback: response.traceback});
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                });
          },

          submitForm: function (item,index) {
            var allFlags = 0;
            for (var i = 0; i<$scope.project.camera.data_mod.data[index].stearmOptions.length; i++)
            {
              if ($scope.project.camera.data_mod.data[index].stearmOptions[i].on === true)
                allFlags+= (1<<i);
            }
            if ($scope.project.camera.data_mod.data[index].pic === true)
              allFlags+= (1<<4);


            var postData =  {
              flags: allFlags,
              desc: $scope.project.camera.data_mod.data[index].desc,
              long_desc: $scope.project.camera.data_mod.data[index].long_desc,
              longitude: $scope.project.camera.data_mod.data[index].longitude,
              login_passwd: $scope.project.camera.data_mod.data[index].login_passwd,
              latitude: $scope.project.camera.data_mod.data[index].latitude,
              altitude: $scope.project.camera.data_mod.data[index].altitude
            };

            //$scope.project.camera.data_mod.submitForm = Math.random();
            $scope.aborter = $q.defer(),
              $http.put("http://api.opensight.cn/api/ivc/v1/projects/" +$scope.project.data_mod.selectItem.name+ "/cameras/"+item.uuid, postData, {
                timeout: $scope.aborter.promise
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */
              }).success(function (response) {

                }).error(function (response,status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "camera "+ $scope.project.data_mod.selectItem.name+" 更新失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token =  $scope.project.camera.data_mod.submitForm;
                  //tmpMsg.Callback = "odCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut',{info: response.info,traceback: response.traceback});
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                });
          },
          reset: function (item,index) {
            $scope.project.camera.data_mod.initDetail(item,index);
          },

          /*
           modMdCallBack:function (event, msg) {


           },
           */
          destroy: function () {
          }
        };
      })()



    }
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

  var parse = function(flags){
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
    for (var i = 0, l = ab.length; i < l; i++){
      if (1 === m[ab[i].idx]){
        t.push(ab[i]);
      }
    }

    return {
      live: 0 === m[5],
      ability: t
    };
  };

  $scope.project.cameralist = (function () {
    return {
      get: function () {//clean input,close add div
        if ($scope.project.data_mod.bDetailShown !== true) return;
        $scope.project.camera.data_add.clean_data();
        //$scope.camera.addShown = false;
        $scope.aborter = $q.defer(),
          $http.get("http://api.opensight.cn/api/ivc/v1/projects/" +$scope.project.data_mod.selectItem.name+ "/cameras?start=0&limit=100", {
            timeout: $scope.aborter.promise
            /*                       headers:  {
             "Authorization" : "Bearer "+$scope.authToken,
             "Content-Type": "application/json"
             }
             */

          }).success(function (response) {
              for (var i = 0; i < response.list.length; i++){
                var flags = parse(response.list[i].flags);
                response.list[i].ability = flags.ability;
                response.list[i].live = flags.live;
              }
              $scope.project.cameralist.data = response;
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取摄像头列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              //tmpMsg.Token =  $scope.camera.data_mod.addHotSpToken;
              tmpMsg.Callback = "camera.show";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

      }


    };
  })();
  $scope.project.session = (function () {
    return {
      init: function () {
        $scope.project.sessionlist.params = {limit: 50};
        $scope.project.sessionlist.bFirst = true;
        $scope.project.sessionlist.bLast = true;
        $scope.project.session.sumShown = false;
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
      initSum: function () {
        $scope.project.session.sumShown = true;
        $scope.project.session.sumData = {};
        $scope.project.session.sumData.total = 0;
        $scope.project.session.sumData.per_quality = {
          "ld" : 0,
          "sd" : 0,
          "hd" : 0,
          "fhd" : 0
        };
      },
      open: function (opts) {
        opts.opened = true;
      },
      search: function () {
        $scope.project.session.initSession();
      },
      down: function () {
        if ($scope.project.data_mod.bDetailShown !== true) return;
        $scope.aborter = $q.defer(),
          $http.get("http://api.opensight.cn/api/ivc/v1/projects/" +$scope.project.data_mod.selectItem.name+ "/session_logs_csv?start_from=" +$scope.project.sessionlist.format($scope.start.dt, 0)+
            "&end_to=" +$scope.project.sessionlist.format($scope.end.dt, 1), {
            timeout: $scope.aborter.promise,
            headers:  {
              "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }

          }).success(function (response) {
              var blob = new Blob([response], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              });
              FileSaver.saveAs(blob,  $scope.project.sessionlist.format($scope.start.dt, 0)+"--" +$scope.project.sessionlist.format($scope.end.dt, 1)+ '.csv');
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "下载用户观看记录列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Callback = "session.show";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

      },
      sum: function () {
        if ($scope.project.data_mod.bDetailShown !== true) return;
        if ($scope.project.session.sumShown === true)  {
          $scope.project.session.sumShown = false;
          return;
        }
        $scope.aborter = $q.defer(),
          $http.get("http://api.opensight.cn/api/ivc/v1/projects/" +$scope.project.data_mod.selectItem.name+ "/session_logs_sum?start_from=" +$scope.project.sessionlist.format($scope.start.dt, 0)+
            "&end_to=" +$scope.project.sessionlist.format($scope.end.dt, 1), {
            timeout: $scope.aborter.promise
            /*                       headers:  {
             "Authorization" : "Bearer "+$scope.authToken,
             "Content-Type": "application/json"
             }
             */

          }).success(function (response) {
              $scope.project.session.initSum();
              if (response.total!==undefined)
                $scope.project.session.sumData.total = response.total;
              if (response.per_quality !== undefined){
                if (response.per_quality.ld !== undefined)
                  $scope.project.session.sumData.per_quality.ld = response.per_quality.ld;
                if (response.per_quality.sd !== undefined)
                  $scope.project.session.sumData.per_quality.sd = response.per_quality.sd;
                if (response.per_quality.hd !== undefined)
                  $scope.project.session.sumData.per_quality.hd = response.per_quality.hd;
                if (response.per_quality.fhd !== undefined)
                  $scope.project.session.sumData.per_quality.fhd = response.per_quality.fhd;
              }
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "统计用户观看记录列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Callback = "session.show";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

      },
      initSession: function () {
        if ($scope.project.sessionlist.data!==undefined && $scope.project.sessionlist.data.list!==undefined){
          $scope.project.session.refresh();
        }else{
          $scope.destroy();
          $scope.project.session.sumShown = false;
          $scope.project.sessionlist.get();
        }
      },

      refresh: function () {
        angular.forEach($scope.project.sessionlist.data.list, function (item, index, array) {
          if ($scope.project.session.data_mod.bDetailShown && $scope.project.session.data_mod.bDetailShown[index] !== undefined)
            $scope.project.session.data_mod.bDetailShown[index]  = false;
        });
        $scope.project.sessionlist.data = {};
        $scope.project.session.initSession();
      },

      data: (function () {
        return {
          showDetail: function (item, index) {
            if ($scope.project.session.data_mod.bDetailShown === undefined) $scope.project.session.data_mod.bDetailShown = [];
            if ($scope.project.session.data_mod.bDetailShown[index] === undefined) $scope.project.session.data_mod.bDetailShown[index] = false;
            $scope.project.session.data_mod.bDetailShown[index] = !(true === $scope.project.session.data_mod.bDetailShown[index]);

            if ($scope.project.session.data_mod.bDetailShown[index] === true) {//开
              $scope.project.session.data_mod.initDetail(item, index);
            } else {

            }
          }
        };
      })(),

      data_mod: (function () {
        return {
          initData: function(item,index) {
            if ($scope.project.session.data_mod.bDetailShown[index] === true) {
              if ($scope.project.session.data_mod.data === undefined)
                $scope.project.session.data_mod.data = [];
              $scope.project.session.data_mod.data[index] = item;
            }
          },

          initDetail: function (item,index) {
            if ($scope.project.session.data_mod.bDetailShown[index] === undefined
              || $scope.project.session.data_mod.bDetailShown[index] === false)
              return;

            $scope.aborter = $q.defer(),
              $http.get("http://api.opensight.cn/api/ivc/v1/projects/" +$scope.project.data_mod.selectItem.name+ "/session_logs/"+item.uuid, {
                timeout: $scope.aborter.promise
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */
              }).success(function (response) {
                  $scope.project.session.data_mod.initData(response,index);
                }).error(function (response,status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "session"+ item.name +"get失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  //tmpMsg.Token =  $scope.project.session.data_mod.addHotSpToken;
                  tmpMsg.Callback = "modMdCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut',{info: response.info,traceback: response.traceback});
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  //$scope.project.session.data_mod.hotRefresh(item, index);
                });
          },

          reset: function (item,index) {
            $scope.project.session.data_mod.initDetail(item,index);
          },

          destroy: function () {
          }
        };
      })()
    }
  })();

  $scope.project.sessionlist = (function () {
    return {
      format: function (dt, flag) {
        var ymd,hms;
        ymd = [dt.getFullYear(), dt.getMonth()+1, dt.getDate()].join('-');
        if (flag === 0)
          hms = "00:00:00";
        else hms = "23:59:59";
        return ymd+"T"+hms;
      },
      get: function () {
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
            url:"http://api.opensight.cn/api/ivc/v1/projects/" +$scope.project.data_mod.selectItem.name+ "/session_logs",
            method: "GET",
            timeout: $scope.aborter.promise,
            params: $scope.project.sessionlist.params
            /*                       headers:  {
             "Authorization" : "Bearer "+$scope.authToken,
             "Content-Type": "application/json"
             }
             */

          }).success(function (response) {
              $scope.project.sessionlist.data = response;
              if ($scope.project.sessionlist.data.list.length === $scope.project.sessionlist.params.limit)
                $scope.project.sessionlist.bLast = false;
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取用户观看记录列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Callback = "session.show";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });
      },
      next: function(){
        if ($scope.project.sessionlist.bLast === true) return;
        $scope.project.sessionlist.params.reverse = false;
        $scope.project.sessionlist.params.last_end_time = $scope.project.sessionlist.data.list[$scope.project.sessionlist.data.list.length - 1].end;
        $scope.project.sessionlist.params.last_session_id = $scope.project.sessionlist.data.list[$scope.project.sessionlist.data.list.length - 1].uuid;
        $scope.aborter = $q.defer(),
          $http({
            url:"http://api.opensight.cn/api/ivc/v1/projects/" +$scope.project.data_mod.selectItem.name+ "/session_logs",
            method: "GET",
            timeout: $scope.aborter.promise,
            params: $scope.project.sessionlist.params
            /*                       headers:  {
             "Authorization" : "Bearer "+$scope.authToken,
             "Content-Type": "application/json"
             }
             */

          }).success(function (response) {
              $scope.project.sessionlist.data = response;
              if ($scope.project.sessionlist.data.list.length === $scope.project.sessionlist.params.limit)
                $scope.project.sessionlist.bLast = false;
              else $scope.project.sessionlist.bLast = true;
              if ($scope.project.sessionlist.data.list.length > 0)
                $scope.project.sessionlist.bFirst = false;
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取用户观看记录列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Callback = "session.show";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });
      },
      prev: function(){
        if ($scope.project.sessionlist.bFirst === true) return;
        $scope.project.sessionlist.params.reverse = true;
        $scope.project.sessionlist.params.last_end_time = $scope.project.sessionlist.data.list[0].end;
        $scope.project.sessionlist.params.last_session_id = $scope.project.sessionlist.data.list[0].uuid;
        $scope.aborter = $q.defer(),
          $http({
            url:"http://api.opensight.cn/api/ivc/v1/projects/" +$scope.project.data_mod.selectItem.name+ "/session_logs",
            method: "GET",
            timeout: $scope.aborter.promise,
            params: $scope.project.sessionlist.params
            /*                       headers:  {
             "Authorization" : "Bearer "+$scope.authToken,
             "Content-Type": "application/json"
             }
             */

          }).success(function (response) {
              if (response.list.length === $scope.project.sessionlist.params.limit)
                $scope.project.sessionlist.bFirst == false;
              else $scope.project.sessionlist.bFirst = true;
              if (response.list.length > 0){
                $scope.project.sessionlist.bLast = false;
                $scope.project.sessionlist.data.list = [];
              }

              for (var i=0;i<response.list.length;i++){
                $scope.project.sessionlist.data.list[i] = response.list[response.list.length-i-1];
              }

            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取用户观看记录列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Callback = "session.show";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });
      }


    };
  })();

  $scope.project.user = (function () {
    return {
      initUsers: function () {
        if ($scope.project.userlist.data!==undefined && $scope.project.userlist.data.list!==undefined){
          $scope.project.user.refresh();
        }else{
          $scope.destroy();
          $scope.project.user.addShown = false;
          $scope.project.userlist.searchKeyOptionsData = [
            {
              name: "用户名",
              key: "username"
            },
            {
              name: "描述",
              key: "desc"
            },
            {
              name: "详细描述",
              key: "long_desc"
            },
            {
              name: "别名",
              key: "title"
            },
            {
              name: "手机号",
              key: "cellphone"
            },
            {
              name: "电子邮箱",
              key: "email"
            }
          ];
          $scope.project.userlist.seachKey = $scope.project.userlist.searchKeyOptionsData[0].key;
          $scope.project.userlist.seachValue = "";
          $scope.project.userlist.get();
        }
      },
      search: function () {//clean input,close add div
        if ($scope.project.data_mod.bDetailShown !== true) return;
        $scope.project.user.data_add.clean_data();
        //$scope.camera.addShown = false;
        $scope.aborter = $q.defer(),
          $http.get("http://api.opensight.cn/api/ivc/v1/projects/"
            +$scope.project.data_mod.selectItem.name+ "/users?filter_key="
            +$scope.project.userlist.seachKey+"&filter_value="+$scope.project.userlist.seachValue+
            "&start=0&limit=100", {
            timeout: $scope.aborter.promise
            /*                       headers:  {
             "Authorization" : "Bearer "+$scope.authToken,
             "Content-Type": "application/json"
             }
             */

          }).success(function (response) {
              $scope.project.userlist.data = response;
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取用户列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              //tmpMsg.Token =  $scope.camera.data_mod.addHotSpToken;
              tmpMsg.Callback = "user.show";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

      },
      refresh: function () {
        angular.forEach($scope.project.userlist.data.list, function (item, index, array) {
          if ($scope.project.user.data_mod.bDetailShown && $scope.project.user.data_mod.bDetailShown[index] !== undefined)
            $scope.project.user.data_mod.bDetailShown[index]  = false;
        });
        $scope.project.userlist.data = {};
        $scope.project.user.initUsers();
      },

      add: function () {
        if ($scope.project.user.addShown === undefined) $scope.project.user.addShown = false;
        $scope.project.user.addShown = !$scope.project.user.addShown;
        if ($scope.project.user.addShown === true)
          $scope.project.user.data_add.init();
      },

      data_add: (function () {
        return {
          clean_data: function () {//clean add field
            if ($scope.project.user.data_add === undefined)
              $scope.project.user.data_add = {};
            $scope.project.user.data_add.username = "";
          },

          submitForm: function () {//add one user
            var postData = {
              username: $scope.project.user.data_add.username
            };

            $scope.project.user.data_add.token = Math.random();
            $scope.aborter = $q.defer(),
              $http.post("http://api.opensight.cn/api/ivc/v1/projects/"+$scope.project.data_mod.selectItem.name+"/users", postData, {
                timeout: $scope.aborter.promise
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */
              }).success(function (response) {
                  $scope.project.user.refresh();
                }).error(function (response,status) {
                  //response.ErrorContent = "加入user失败";
                  //$scope.$emit("errorEmit",response);
                  //bendichuliweimiao

                  var tmpMsg = {};

                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "加入user失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token =  $scope.project.user.data_add.token;
                  //tmpMsg.Callback = "addMdCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut',{info: response.info,traceback: response.traceback});
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  // $scope.project.user.refresh();
                });
          },

          close: function () {//clean input,close add div
            //$scope.project.user.data_add.clean_data();
            //$scope.project.user.addShown = false;
            $scope.project.user.add();
          },

          init: function () {
            $scope.project.user.data_add.clean_data();
          },

          addMdCallBack:function (event, msg) {

          }
        };
      })(),

      delete_one: function (item) {
        var r=confirm("确认删除user "+ item.username +"吗？");
        if (r===false) return;
        $scope.project.user.data.delOneToken = Math.random();
        $scope.aborter = $q.defer(),
          $http.delete("http://api.opensight.cn/api/ivc/v1/projects/"+ $scope.project.data_mod.selectItem.name +"/users/"+item.username, {
            timeout: $scope.aborter.promise
            /*                       headers:  {
             "Authorization" : "Bearer "+$scope.authToken,
             "Content-Type": "application/json"
             }
             */
          }).success(function (response) {
              $scope.project.user.refresh();
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "移出user"+ item.username +"失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Token =  $scope.project.user.data.delOneToken;
              //tmpMsg.Callback = "delMdCallBack";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
                $scope.$emit("Ctr1ModalShow", tmpMsg);
              //$scope.project.user.refresh();
            });
      },

      delMdCallBack:function (event, msg) {

      },

      data: (function () {
        return {
          showDetail: function (item, index) {
            if ($scope.project.user.data_mod.bDetailShown === undefined) $scope.project.user.data_mod.bDetailShown = [];
            if ($scope.project.user.data_mod.bDetailShown[index] === undefined) $scope.project.user.data_mod.bDetailShown[index] = false;
            $scope.project.user.data_mod.bDetailShown[index] = !(true === $scope.project.user.data_mod.bDetailShown[index]);

            if ($scope.project.user.data_mod.bDetailShown[index] === true) {//开
              $scope.project.user.data_mod.initDetail(item, index);
            } else {

            }
          }
        };
      })(),

      data_mod: (function () {
        return {
          initData: function(item,index) {
            if ($scope.project.user.data_mod.bDetailShown[index] === true) {
              if ($scope.project.user.data_mod.data === undefined)
                $scope.project.user.data_mod.data = [];
              $scope.project.user.data_mod.data[index] = item;
            }
          },

          initDetail: function (item,index) {
            if ($scope.project.user.data_mod.bDetailShown[index] === undefined
              || $scope.project.user.data_mod.bDetailShown[index] === false)
              return;

            $scope.aborter = $q.defer(),
              $http.get("http://api.opensight.cn/api/ivc/v1/users/"+item.username, {
                timeout: $scope.aborter.promise
                /*                       headers:  {
                 "Authorization" : "Bearer "+$scope.authToken,
                 "Content-Type": "application/json"
                 }
                 */
              }).success(function (response) {
                  $scope.project.user.data_mod.initData(response,index);
                }).error(function (response,status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "user"+ item.username +"get失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  //tmpMsg.Token =  $scope.project.user.data_mod.addHotSpToken;
                  tmpMsg.Callback = "modMdCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut',{info: response.info,traceback: response.traceback});
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  //$scope.project.user.data_mod.hotRefresh(item, index);
                });
          },

          rm: function (item,index) {
            $scope.project.user.delete_one(item);
          },

          destroy: function () {
          }
        };
      })()



    }
  })();

  $scope.project.userlist = (function () {
    return {
      get: function () {//clean input,close add div
        if ($scope.project.data_mod.bDetailShown !== true) return;
        $scope.project.user.data_add.clean_data();
        //$scope.user.addShown = false;
        $scope.aborter = $q.defer(),
          $http.get("http://api.opensight.cn/api/ivc/v1/projects/" +$scope.project.data_mod.selectItem.name+ "/users?start=0&limit=100", {
            timeout: $scope.aborter.promise
            /*
            headers:  {
             "Authorization" : "Bearer "+$scope.authToken,
             "Content-Type": "application/json"
             }
             */

          }).success(function (response) {
              $scope.project.userlist.data = response;
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取项目内用户列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              //tmpMsg.Token =  $scope.user.data_mod.addHotSpToken;
              tmpMsg.Callback = "user.show";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
                $scope.$emit("Ctr1ModalShow", tmpMsg);

            });

      }
    };
  })();

  $scope.project.firmware = (function () {
    return {
      initFirmware: function () {
        if ($scope.project.firmwarelist.data!==undefined && $scope.project.firmwarelist.data.list!==undefined){
          $scope.project.firmware.refresh();
        }else{
          $scope.destroy();
          $scope.project.firmware.addShown = false;
          $scope.project.firmwarelist.searchKeyOptionsData = [
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
          $scope.project.firmwarelist.seachKey = $scope.project.firmwarelist.searchKeyOptionsData[0].key;
          $scope.project.firmwarelist.seachValue = "";
          $scope.project.firmwarelist.match = {};
          $scope.project.firmwarelist.match.vendor = "";
          $scope.project.firmwarelist.match.hardware_model = "";
          $scope.project.firmwarelist.get();
        }
      },
      search: function () {//clean input,close add div
        if ($scope.project.data_mod.bDetailShown !== true) return;
        $scope.project.firmware.data_add.clean_data();

        $scope.aborter = $q.defer(),
          $http.get("http://api.opensight.cn/api/ivc/v1/projects/"
            +$scope.project.data_mod.selectItem.name+ "/firmwares?filter_key="
            +$scope.project.firmwarelist.seachKey+"&filter_value="+$scope.project.firmwarelist.seachValue+
            "&start=0&limit=100", {
            timeout: $scope.aborter.promise
          }).success(function (response) {
              $scope.project.firmwarelist.data = response;
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
      match: function () {//clean input,close add div
        if ($scope.project.data_mod.bDetailShown !== true) return;
        $scope.project.firmware.data_add.clean_data();

        $scope.aborter = $q.defer(),
          $http.get("http://api.opensight.cn/api/ivc/v1/projects/"
            +$scope.project.data_mod.selectItem.name+ "/match_firmware?vendor="
            +$scope.project.firmwarelist.match.vendor+"&hardware_model="+$scope.project.firmwarelist.match.hardware_model, {
            timeout: $scope.aborter.promise
          }).success(function (response) {
              $scope.project.firmwarelist.data = {};
              $scope.project.firmwarelist.data.list = [];
              $scope.project.firmwarelist.data.list.push(response);
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "match固件失败";
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
        angular.forEach($scope.project.firmwarelist.data.list, function (item, index, array) {
          if ($scope.project.firmware.data_mod.bDetailShown && $scope.project.firmware.data_mod.bDetailShown[index] !== undefined)
            $scope.project.firmware.data_mod.bDetailShown[index]  = false;
        });
        $scope.project.firmwarelist.data = {};
        $scope.project.firmware.initFirmware();
      },

      add: function () {
        if ($scope.project.firmware.addShown === undefined) $scope.project.firmware.addShown = false;
        $scope.project.firmware.addShown = !$scope.project.firmware.addShown;
        if ($scope.project.firmware.addShown === true)
          $scope.project.firmware.data_add.init();
      },

      data_add: (function () {
        return {
          clean_data: function () {//clean add field
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

          submitForm: function () {//add one firmware
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
              $http.post("http://api.opensight.cn/api/ivc/v1/projects/"+$scope.project.data_mod.selectItem.name+"/firmwares", postData, {
                timeout: $scope.aborter.promise
              }).success(function (response) {
                  $scope.project.firmware.refresh();
                }).error(function (response,status) {
                  var tmpMsg = {};

                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "加入固件失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token =  $scope.project.firmware.data_add.token;
                  //tmpMsg.Callback = "addMdCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut',{info: response.info,traceback: response.traceback});
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                });
          },

          close: function () {//clean input,close add div
            $scope.project.firmware.add();
          },

          init: function () {
            $scope.project.firmware.data_add.clean_data();
          },

          addMdCallBack:function (event, msg) {

          }
        };
      })(),

      delete_one: function (item) {
        var r=confirm("确认删除firmware "+ item.uuid +"吗？");
        if (r===false) return;
        $scope.project.firmware.data.delOneToken = Math.random();
        $scope.aborter = $q.defer(),
          $http.delete("http://api.opensight.cn/api/ivc/v1/projects/"+ $scope.project.data_mod.selectItem.name +"/firmwares/"+item.uuid, {
            timeout: $scope.aborter.promise
          }).success(function (response) {
              $scope.project.firmware.refresh();
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "删除固件"+ item.firmwarename +"失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              tmpMsg.Token =  $scope.project.firmware.data.delOneToken;
              //tmpMsg.Callback = "delMdCallBack";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
                $scope.$emit("Ctr1ModalShow", tmpMsg);
              //$scope.project.firmware.refresh();
            });
      },

      delMdCallBack:function (event, msg) {

      },

      data: (function () {
        return {
          showDetail: function (item, index) {
            if ($scope.project.firmware.data_mod.bDetailShown === undefined) $scope.project.firmware.data_mod.bDetailShown = [];
            if ($scope.project.firmware.data_mod.bDetailShown[index] === undefined) $scope.project.firmware.data_mod.bDetailShown[index] = false;
            $scope.project.firmware.data_mod.bDetailShown[index] = !(true === $scope.project.firmware.data_mod.bDetailShown[index]);

            if ($scope.project.firmware.data_mod.bDetailShown[index] === true) {//开
              $scope.project.firmware.data_mod.initDetail(item, index);
            } else {

            }
          }
        };
      })(),

      data_mod: (function () {
        return {
          initData: function(item,index) {
            if ($scope.project.firmware.data_mod.bDetailShown[index] === true) {
              if ($scope.project.firmware.data_mod.data === undefined)
                $scope.project.firmware.data_mod.data = [];
              $scope.project.firmware.data_mod.data[index] = item;
            }
          },

          initDetail: function (item,index) {
            if ($scope.project.firmware.data_mod.bDetailShown[index] === undefined
              || $scope.project.firmware.data_mod.bDetailShown[index] === false)
              return;

            $scope.aborter = $q.defer(),
              $http.get("http://api.opensight.cn/api/ivc/v1/projects/"+ $scope.project.data_mod.selectItem.name +"/firmwares/"+item.uuid, {
                timeout: $scope.aborter.promise

              }).success(function (response) {
                  $scope.project.firmware.data_mod.initData(response,index);
                }).error(function (response,status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "固件"+ item.uuid +"get失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  //tmpMsg.Token =  $scope.project.firmware.data_mod.addHotSpToken;
                  tmpMsg.Callback = "modMdCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                    //$scope.$emit("Logout", tmpMsg);
                    $state.go('logOut',{info: response.info,traceback: response.traceback});
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  //$scope.project.firmware.data_mod.hotRefresh(item, index);
                });
          },

          submitForm: function (item, index) {
            var postData =  {
              firmware_model: $scope.project.firmware.data_mod.data[index].firmware_model,
              firmware_url: $scope.project.firmware.data_mod.data[index].firmware_url,
              desc: $scope.project.firmware.data_mod.data[index].desc,
              long_desc: $scope.project.firmware.data_mod.data[index].long_desc
            };

            $scope.project.firmware.data_mod.updateCustomers = Math.random();
            $scope.aborter = $q.defer(),
              $http.put("http://api.opensight.cn/api/ivc/v1/firmwares/"+item.uuid, postData, {
                timeout: $scope.aborter.promise
              }).success(function (response) {
                  $scope.project.firmware.refresh();
                }).error(function (response,status) {
                  var tmpMsg = {};
                  tmpMsg.Label = "错误";
                  tmpMsg.ErrorContent = "固件"+ item.uuid  +"更新固件失败";
                  tmpMsg.ErrorContentDetail = response;
                  tmpMsg.SingleButtonShown = true;
                  tmpMsg.MutiButtonShown = false;
                  tmpMsg.Token =  $scope.project.firmware.data_mod.addHotSpToken;
                  tmpMsg.Callback = "modMdCallBack";
                  if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                    $scope.$emit("Logout", tmpMsg);
                  }else
                    $scope.$emit("Ctr1ModalShow", tmpMsg);

                  // $scope.project.firmware.data_mod.refresh(item, index);
                });
          },
          close: function (item, index) {
            $scope.project.firmware.data_mod.initDetail(item, index);
          },

          destroy: function () {
          }
        };
      })()



    }
  })();

  $scope.project.firmwarelist = (function () {
    return {
      get: function () {//clean input,close add div
        if ($scope.project.data_mod.bDetailShown !== true) return;
        $scope.project.firmware.data_add.clean_data();
        //$scope.project.firmware.addShown = false;
        $scope.aborter = $q.defer(),
          $http.get("http://api.opensight.cn/api/ivc/v1/projects/" +$scope.project.data_mod.selectItem.name+ "/firmwares?start=0&limit=100", {
            timeout: $scope.aborter.promise
            /*
             headers:  {
             "Authorization" : "Bearer "+$scope.authToken,
             "Content-Type": "application/json"
             }
             */

          }).success(function (response) {
              $scope.project.firmwarelist.data = response;
            }).error(function (response,status) {
              var tmpMsg = {};
              tmpMsg.Label = "错误";
              tmpMsg.ErrorContent = "获取项目内固件列表失败";
              tmpMsg.ErrorContentDetail = response;
              tmpMsg.SingleButtonShown = true;
              tmpMsg.MutiButtonShown = false;
              //tmpMsg.Token =  $scope.project.firmware.data_mod.addHotSpToken;
              tmpMsg.Callback = "firmware.show";
              if (status === 403 || (response!==undefined && response!==null && response.info!==undefined && response.info.indexOf("Token ")>=0)){
                //$scope.$emit("Logout", tmpMsg);
                $state.go('logOut',{info: response.info,traceback: response.traceback});
              }else
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
    open: function(obj){
    obj.opened = true;
    },
    initAddData: function(){
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
    get: function(params){
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
    query: function(){
    $scope.params = {
      start_from: dateFactory.getStart($scope.project.bill.start.dt),
      end_to: dateFactory.getEnd($scope.project.bill.end.dt),
      start: 0,
      limit: 10
    };
    $scope.project.bill.get($scope.params);
    },
    getAccount: function(){
    $http.get("http://api.opensight.cn/api/ivc/v1/projects/" + $scope.project.data_mod.selectItem.name + '/account', {}).success(function(response) {
      $scope.project.bill.account = response;
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
      } else
      $scope.$emit("Ctr1ModalShow", tmpMsg);
    });
    },
    refresh: function(){
    $scope.project.bill.get($scope.project.bill.lastParams);
    },
    showAdd: function() {
    $scope.project.bill.addShown = !$scope.project.bill.addShown;
    },
    add: function(){
    var bill = {
      bill_type: $scope.project.bill.data_add.bill_type,
      invoiced: $scope.project.bill.data_add.invoiced,
      start_from: dateFactory.getStart($scope.project.bill.data_add.start.dt),
      end_to: dateFactory.getEnd($scope.project.bill.data_add.end.dt),
      comment: $scope.project.bill.data_add.comment
    };
    if (0 === $scope.project.bill.data_add.bill_type){
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
    showDetail: function(item, index){
    if (undefined === $scope.project.bill.detail[index]){
      $scope.project.bill.detail[index] = angular.copy(item);
    }
    $scope.project.bill.detail[index].shown = true !== $scope.project.bill.detail[index].shown;
    },
    modify: function(index){
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
    remove: function(bill, index){
    if (false === confirm('确认删除账单：' + bill + ' 吗？')){
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

  $scope.destroy = function () {
    if (undefined !== $scope.aborter) {
      $scope.aborter.resolve();
      delete $scope.aborter;
    }
  };

  $scope.$on('$destroy', $scope.destroy);
//    $scope.$on("newToken",$scope.projectlist.getKey);
 //   $scope.$on("project.show",$scope.project.show);


//add all callback
//    $scope.$on('modMdCallBack', $scope.project.data_mod.modMdCallBack);
//    $scope.$on('addMdCallBack', $scope.project.data_add.addMdCallBack);
//    $scope.$on('delMdCallBack', $scope.project.delMdCallBack);



//init project list
  $scope.project.show();
  //$scope.$emit("freshToken","project.show");

}]);
