  app.register.controller('Fs', ['$scope', '$http', '$q', function($scope, $http, $q){

      $scope.staticData = {};
      $scope.staticData.fsTypeOptionsData = [];

      $scope.fs = (function () {
          return {
              show: function () {
                  $scope.fs.listShown = true;
                  $scope.destroy();
                  $scope.fslist.get();
                  $scope.fslist.get_type();
                  return true;
              },
              
              refresh: function () {
                  angular.forEach($scope.fslist.data.servers, function (item, index, array) {
                         if ($scope.fs.data_mod.bDetailShown && $scope.fs.data_mod.bDetailShown[index] !== undefined)
                          $scope.fs.data_mod.bDetailShown[index]  = false;
                  });

                  $scope.fs.show();
              },
              
              add: function () {
                  if ($scope.fs.addShown === undefined) $scope.fs.addShown = false;
                  $scope.fs.addShown = !$scope.fs.addShown;
                  if ($scope.fs.addShown === true)
                      $scope.fs.data_add.init();
              },

              data_add: (function () {
                  return {
                      clean_data: function () {//clean add field
                          if ($scope.fs.data_add === undefined)
                              $scope.fs.data_add = {};
                          $scope.fs.data_add.fsname = "";
                          $scope.fs.data_add.dev = "";
                          $scope.fs.data_add.type = "";
                          $scope.fs.data_add.mountoption = "";
                          $scope.fs.data_add.checkonboot = false;
                          $scope.fs.data_add.comment = "";
                          $scope.fs.data_add.user = "";
                      },

                      submitForm: function () {//add one fs
                          var postData = {
                              fsname: $scope.fs.data_add.fsname,
                              dev: $scope.fs.data_add.dev,
                              type: $scope.fs.data_add.type
                          };

                          $scope.fs.data_add.token = Math.random();
                          $scope.aborter = $q.defer(),
                              $http.post("/storlever/api/v1/fs/mkfs", postData, {
                                  timeout: $scope.aborter.promise
                              }).success(function (response) {
                                      $scope.fs.data_add.mountFs();
                                  }).error(function (response) {
                                      var tmpMsg = {};
                                      tmpMsg.Label = "错误";
                                      tmpMsg.ErrorContent = "mkfs失败";
                                      tmpMsg.ErrorContentDetail = response;
                                      tmpMsg.SingleButtonShown = true;
                                      tmpMsg.MutiButtonShown = false;
                                      tmpMsg.Token =  $scope.fs.data_add.token;
                                      tmpMsg.Callback = "mkfsCallBack";
                                      $scope.$emit("Ctr1ModalShow", tmpMsg);
                                      $scope.fs.refresh();
                                  });
                      },

                      mountFs: function () {//mount one fs
                          var postData = {
                              fsname: $scope.fs.data_add.fsname,
                              dev: $scope.fs.data_add.dev,
                              type: $scope.fs.data_add.type,
                              mountoption: $scope.fs.data_add.mountoption,
                              checkonboot: $scope.fs.data_add.checkonboot,
                              comment: $scope.fs.data_add.comment,
                              user: $scope.fs.data_add.user
                          };

                          $scope.fs.data_add.token = Math.random();
                          $scope.aborter = $q.defer(),
                              $http.post("/storlever/api/v1/fs/list", postData, {
                                  timeout: $scope.aborter.promise
                              }).success(function (response) {
                                      $scope.fs.refresh();
                                  }).error(function (response) {
                                      var tmpMsg = {};
                                      tmpMsg.Label = "错误";
                                      tmpMsg.ErrorContent = "mountFs失败";
                                      tmpMsg.ErrorContentDetail = response;
                                      tmpMsg.SingleButtonShown = true;
                                      tmpMsg.MutiButtonShown = false;
                                      tmpMsg.Token =  $scope.fs.data_add.token;
                                      tmpMsg.Callback = "mountFsCallBack";
                                      $scope.$emit("Ctr1ModalShow", tmpMsg);
                                      $scope.fs.refresh();
                                  });
                      },

                      close: function () {//clean input,close add div
                          //$scope.fs.data_add.clean_data();
                          //$scope.fs.addShown = false;
                          $scope.fs.add();
                      },

                      init: function () {
                          $scope.fs.data_add.clean_data();
                      },

                      mkfsCallBack:function (event, msg) {

                      },

                      mountFsCallBack:function (event, msg) {

                      }
                  };
              })(),

              delete_one: function (item) {
                  $scope.fs.data.delOneToken = Math.random();
                  $scope.aborter = $q.defer(),
                      $http.delete("/storlever/api/v1/fs/list/"+item.name, {
                          timeout: $scope.aborter.promise
                      }).success(function (response) {
                              $scope.fs.refresh();
                          }).error(function (response) {
                              var tmpMsg = {};
                              tmpMsg.Label = "错误";
                              tmpMsg.ErrorContent = "删除fs"+ item.name +"失败";
                              tmpMsg.ErrorContentDetail = response;
                              tmpMsg.SingleButtonShown = true;
                              tmpMsg.MutiButtonShown = false;
                              tmpMsg.Token =  $scope.fs.data.delOneToken;
                              tmpMsg.Callback = "delVgCallBack";
                              $scope.$emit("Ctr1ModalShow", tmpMsg);
                              $scope.fs.refresh();
                          });
              },

              delVgCallBack:function (event, msg) {

              },

              data: (function () {
                  return {
                      showDetail: function (item, index) {
                          if ($scope.fs.data_mod.bDetailShown === undefined) $scope.fs.data_mod.bDetailShown = [];
                          if ($scope.fs.data_mod.bDetailShown[index] === undefined) $scope.fs.data_mod.bDetailShown[index] = false;
                          $scope.fs.data_mod.bDetailShown[index] = !(true === $scope.fs.data_mod.bDetailShown[index]);
                          if ($scope.fs.data_mod.bDetailShown[index] === true) {//开
                              $scope.fs.data_mod.initDetail(item,index);
                          } else {
                              
                          }
                      }
                  };
              })(),

              data_mod: (function () {
                  return {
                      initData: function(item,index) {
                          if ($scope.fs.data_mod.bDetailShown[index] === true) {
                              if ($scope.fs.data_mod.name === undefined) $scope.fs.data_mod.name = [];
                              $scope.fs.data_mod.name[index] = item.name;
                              if ($scope.fs.data_mod.uuid === undefined) $scope.fs.data_mod.uuid = [];
                              $scope.fs.data_mod.uuid[index] = item.uuid;
                              if ($scope.fs.data_mod.size === undefined) $scope.fs.data_mod.size = [];
                              $scope.fs.data_mod.size[index] = item.size;
                              if ($scope.fs.data_mod.free_size === undefined) $scope.fs.data_mod.free_size = [];
                              $scope.fs.data_mod.free_size[index] = item.free_size;
                              if ($scope.fs.data_mod.pv === undefined) $scope.fs.data_mod.pv = [];
                              $scope.fs.data_mod.pv[index] = "";
                          }
                      },

                      initDetail: function (item, index) {
                          if ($scope.fs.data_mod.bDetailShown === undefined
                              || $scope.fs.data_mod.bDetailShown[index] === undefined
                              || $scope.fs.data_mod.bDetailShown[index] === false)
                            return;

                          $scope.fs.data_mod.initData(item,index);
                      },

                      lvm: function (item, index) {
                          $scope.fs.listShown = !$scope.fs.listShown;
                          if ($scope.lv.listShown === undefined) $scope.lv.listShown = false;
                          $scope.lv.listShown = !$scope.lv.listShown;
                          if ($scope.lv.listShown === true){
                              $scope.lv.fsName = item.name;
                              $scope.lv.show();
                          }

                      },

                      grow: function (item, index) {
                          var postData =  {
                              dev: $scope.fs.data_mod.pv[index],
                              opt: "grow"
                              //sum: $scope.fs.data_mod.spare_devices[index],
                          };

                          $scope.fs.data_mod.growToken = Math.random();
                          $scope.aborter = $q.defer(),
                              $http.post("/storlever/api/v1/block/lvm/fs_list/"+item.name+"/op", postData, {
                                  timeout: $scope.aborter.promise
                              }).success(function (response) {
                                      $scope.fs.data_mod.hotRefresh(item, index);
                                  }).error(function (response) {
                                      var tmpMsg = {};
                                      tmpMsg.Label = "错误";
                                      tmpMsg.ErrorContent = "fs"+ item.name +"扩充失败";
                                      tmpMsg.ErrorContentDetail = response;
                                      tmpMsg.SingleButtonShown = true;
                                      tmpMsg.MutiButtonShown = false;
                                      tmpMsg.Token =  $scope.fs.data_mod.growToken;
                                      tmpMsg.Callback = "modVgCallBack";
                                      $scope.$emit("Ctr1ModalShow", tmpMsg);
                                      $scope.fs.refresh(item, index);
                                  });
                      },

                      shrink: function (item, index) {
                          var postData =  {
                              dev: $scope.fs.data_mod.pv[index],
                              opt: "shrink"
                              //sum: $scope.fs.data_mod.spare_devices[index],
                          };

                          $scope.fs.data_mod.growToken = Math.random();
                          $scope.aborter = $q.defer(),
                              $http.post("/storlever/api/v1/block/lvm/fs_list/"+item.name+"/op", postData, {
                                  timeout: $scope.aborter.promise
                              }).success(function (response) {
                                      $scope.fs.data_mod.hotRefresh(item, index);
                                  }).error(function (response) {
                                      var tmpMsg = {};
                                      tmpMsg.Label = "错误";
                                      tmpMsg.ErrorContent = "fs"+ item.name +"缩减失败";
                                      tmpMsg.ErrorContentDetail = response;
                                      tmpMsg.SingleButtonShown = true;
                                      tmpMsg.MutiButtonShown = false;
                                      tmpMsg.Token =  $scope.fs.data_mod.growToken;
                                      tmpMsg.Callback = "modVgCallBack";
                                      $scope.$emit("Ctr1ModalShow", tmpMsg);
                                      $scope.fs.refresh(item, index);
                                  });
                      },

                      modVgCallBack:function (event, msg) {

                      },

                      destroy: function () {
                      }
                  };
              })()

          }
      })();      
      
      $scope.fslist = (function () {
          return {
              get: function () {//clean input,close add div
                  $scope.fs.data_add.clean_data();
                  //$scope.fs.addShown = false;
                  $scope.aborter = $q.defer(),
                      $http.get("/storlever/api/v1/fs/list", {
                          timeout: $scope.aborter.promise
                      }).success(function (response) {
                              $scope.fslist.data = {};
                              $scope.fslist.data.servers = response;
                      });
              },

              get_type: function () {
                  var x;
                  $scope.aborter = $q.defer(),
                      $http.get("/storlever/api/v1/fs/type_list", {
                          timeout: $scope.aborter.promise
                      }).success(function (response) {
                              for (x in response)
                              {
                                  $scope.staticData.fsTypeOptionsData[x] = {
                                      key: response[x],
                                      value:  response[x]
                                  };
                              }
                          });
              }


          };
      })();


      $scope.lv = (function () {
          return {
              show: function () {
                  $scope.lv.listShown = true;
                  $scope.destroy();
                  $scope.lvlist.get();
                  return true;
              },

              returnVg: function () {
                  $scope.lv.listShown = false;
                  $scope.destroy();
                  $scope.fs.show();
                  return true;
              },

              refresh: function () {
                  angular.forEach($scope.lvlist.data.servers, function (item, index, array) {
                      if ($scope.lv.data_mod.bDetailShown && $scope.lv.data_mod.bDetailShown[index] !== undefined)
                          $scope.lv.data_mod.bDetailShown[index]  = false;
                  });

                  $scope.lv.show();
              },

              add: function () {
                  if ($scope.lv.addShown === undefined) $scope.lv.addShown = false;
                  $scope.lv.addShown = !$scope.lv.addShown;
                  if ($scope.lv.addShown === true)
                      $scope.lv.data_add.init();
              },

              data_add: (function () {
                  return {
                      clean_data: function () {//clean add field
                          if ($scope.lv.data_add === undefined)
                              $scope.lv.data_add = {};
                          $scope.lv.data_add.name = "";
                          $scope.lv.data_add.size = "";
                      },

                      submitForm: function () {//add one lv
                          var postData = {
                              lvname: $scope.lv.data_add.name,
                              size: $scope.lv.data_add.size
                          };

                          $scope.lv.data_add.token = Math.random();
                          $scope.aborter = $q.defer(),
                              $http.post("/storlever/api/v1/block/lvm/fs_list/"+$scope.lv.fsName+"", postData, {
                                  timeout: $scope.aborter.promise
                              }).success(function (response) {
                                      $scope.lv.refresh();
                                  }).error(function (response) {
                                      var tmpMsg = {};
                                      tmpMsg.Label = "错误";
                                      tmpMsg.ErrorContent = "添加lv失败";
                                      tmpMsg.ErrorContentDetail = response;
                                      tmpMsg.SingleButtonShown = true;
                                      tmpMsg.MutiButtonShown = false;
                                      tmpMsg.Token =  $scope.lv.data_add.token;
                                      tmpMsg.Callback = "addLvCallBack";
                                      $scope.$emit("Ctr1ModalShow", tmpMsg);
                                      $scope.lv.refresh();
                                  });
                      },

                      close: function () {//clean input,close add div
                          //$scope.lv.data_add.clean_data();
                          //$scope.lv.addShown = false;
                          $scope.lv.add();
                      },

                      init: function () {
                          $scope.lv.data_add.clean_data();
                      },

                      addLvCallBack:function (event, msg) {

                      }
                  };
              })(),

              delete_one: function (item) {
                  $scope.lv.data.delOneToken = Math.random();
                  $scope.aborter = $q.defer(),
                      $http.delete("/storlever/api/v1/block/lvm/fs_list/"+$scope.lv.fsName+"/lv_list/"+item.name, {
                          timeout: $scope.aborter.promise
                      }).success(function (response) {
                              $scope.lv.refresh();
                          }).error(function (response) {
                              var tmpMsg = {};
                              tmpMsg.Label = "错误";
                              tmpMsg.ErrorContent = "删除lv"+ item.name +"失败";
                              tmpMsg.ErrorContentDetail = response;
                              tmpMsg.SingleButtonShown = true;
                              tmpMsg.MutiButtonShown = false;
                              tmpMsg.Token =  $scope.lv.data.delOneToken;
                              tmpMsg.Callback = "delLvCallBack";
                              $scope.$emit("Ctr1ModalShow", tmpMsg);
                              $scope.lv.refresh();
                          });
              },

              delLvCallBack:function (event, msg) {

              },

              data: (function () {
                  return {
                      showDetail: function (item, index) {
                          if ($scope.lv.data_mod.bDetailShown === undefined) $scope.lv.data_mod.bDetailShown = [];
                          if ($scope.lv.data_mod.bDetailShown[index] === undefined) $scope.lv.data_mod.bDetailShown[index] = false;
                          $scope.lv.data_mod.bDetailShown[index] = !(true === $scope.lv.data_mod.bDetailShown[index]);
                          if ($scope.lv.data_mod.bDetailShown[index] === true) {//开
                              $scope.lv.data_mod.initDetail(item,index);
                          } else {

                          }
                      }
                  };
              })(),

              data_mod: (function () {
                  return {
                      initData: function(item,index) {
                          $scope.aborter = $q.defer(),
                              $http.get("/storlever/api/v1/block/lvm/fs_list/"+$scope.lv.fsName+"/lv_list/"+item.name, {
                                  timeout: $scope.aborter.promise
                              }).success(function (response) {
                                      item = response;
                                  });

                          if ($scope.lv.data_mod.bDetailShown[index] === true) {
                              if ($scope.lv.data_mod.name === undefined) $scope.lv.data_mod.name = [];
                              $scope.lv.data_mod.name[index] = item.name;
                              if ($scope.lv.data_mod.uuid === undefined) $scope.lv.data_mod.uuid = [];
                              $scope.lv.data_mod.uuid[index] = item.uuid;
                              if ($scope.lv.data_mod.size === undefined) $scope.lv.data_mod.size = [];
                              $scope.lv.data_mod.size[index] = item.size;
                              if ($scope.lv.data_mod.state === undefined) $scope.lv.data_mod.state = [];
                              $scope.lv.data_mod.state[index] = item.state;
                              if ($scope.lv.data_mod.origin === undefined) $scope.lv.data_mod.origin = [];
                              $scope.lv.data_mod.origin[index] = item.origin;
                              if ($scope.lv.data_mod.attr === undefined) $scope.lv.data_mod.attr = [];
                              $scope.lv.data_mod.attr[index] = item.attr;
                              if ($scope.lv.data_mod.snap_percent === undefined) $scope.lv.data_mod.snap_percent = [];
                              $scope.lv.data_mod.snap_percent[index] = item.snap_percent;
                              if ($scope.lv.data_mod.pvSrc === undefined) $scope.lv.data_mod.pvSrc = [];
                              $scope.lv.data_mod.pvSrc[index] = "";
                              if ($scope.lv.data_mod.pvDst === undefined) $scope.lv.data_mod.pvDst = [];
                              $scope.lv.data_mod.pvDst[index] = "";
                              if ($scope.lv.data_mod.snapshotName === undefined) $scope.lv.data_mod.snapshotName = [];
                              $scope.lv.data_mod.snapshotName[index] = "";
                              if ($scope.lv.data_mod.snapshotSize === undefined) $scope.lv.data_mod.snapshotSize = [];
                              $scope.lv.data_mod.snapshotSize[index] = "";
                          }
                      },

                      initDetail: function (item, index) {
                          if ($scope.lv.data_mod.bDetailShown === undefined
                              || $scope.lv.data_mod.bDetailShown[index] === undefined
                              || $scope.lv.data_mod.bDetailShown[index] === false)
                              return;

                          $scope.lv.data_mod.initData(item,index);
                      },

                      activate: function (item, index) {
                          var postData =  {
                              opt: "activate"
                              //sum: $scope.lv.data_mod.spare_devices[index],
                          };

                          $scope.lv.data_mod.activateToken = Math.random();
                          $scope.aborter = $q.defer(),
                              $http.post("/storlever/api/v1/block/lvm/fs_list/"+$scope.lv.fsName+"/lv_list/"+item.name+"/op", postData,{
                                  timeout: $scope.aborter.promise
                              }).success(function (response) {
                                      $scope.lv.refresh();
                                  }).error(function (response) {
                                      var tmpMsg = {};
                                      tmpMsg.Label = "错误";
                                      tmpMsg.ErrorContent = "lv"+ item.name +"activate失败";
                                      tmpMsg.ErrorContentDetail = response;
                                      tmpMsg.SingleButtonShown = true;
                                      tmpMsg.MutiButtonShown = false;
                                      tmpMsg.Token =  $scope.lv.data_mod.activateToken;
                                      tmpMsg.Callback = "modLvCallBack";
                                      $scope.$emit("Ctr1ModalShow", tmpMsg);
                                      $scope.lv.refresh();
                                  });
                      },

                      disable: function (item, index) {
                          var postData =  {
                              opt: "disable"
                              //sum: $scope.lv.data_mod.spare_devices[index],
                          };

                          $scope.lv.data_mod.disableToken = Math.random();
                          $scope.aborter = $q.defer(),
                              $http.post("/storlever/api/v1/block/lvm/fs_list/"+$scope.lv.fsName+"/lv_list/"+item.name+"/op", postData,{
                                  timeout: $scope.aborter.promise
                              }).success(function (response) {
                                      $scope.lv.refresh();
                                  }).error(function (response) {
                                      var tmpMsg = {};
                                      tmpMsg.Label = "错误";
                                      tmpMsg.ErrorContent = "lv"+ item.name +"disable失败";
                                      tmpMsg.ErrorContentDetail = response;
                                      tmpMsg.SingleButtonShown = true;
                                      tmpMsg.MutiButtonShown = false;
                                      tmpMsg.Token =  $scope.lv.data_mod.disableToken;
                                      tmpMsg.Callback = "modLvCallBack";
                                      $scope.$emit("Ctr1ModalShow", tmpMsg);
                                      $scope.lv.refresh();
                                  });
                      },

                      pvSetInit: function (item, index) {


                      },

                      pvSubmit: function (item, index) {
                          var postData =  {
                              src: $scope.lv.data_mod.pvSrc[index],
                              dst:$scope.lv.data_mod.pvDst[index],
                              lvname: item.name
                              //sum: $scope.lv.data_mod.spare_devices[index],
                          };

                          $scope.lv.data_mod.pvSubmitToken = Math.random();
                          $scope.aborter = $q.defer(),
                              $http.post("/storlever/api/v1/block/lvm/pvmove", postData,{
                                  timeout: $scope.aborter.promise
                              }).success(function (response) {
                                      $scope.lv.refresh();
                                  }).error(function (response) {
                                      var tmpMsg = {};
                                      tmpMsg.Label = "错误";
                                      tmpMsg.ErrorContent = "lv"+ item.name +"pvmove失败";
                                      tmpMsg.ErrorContentDetail = response;
                                      tmpMsg.SingleButtonShown = true;
                                      tmpMsg.MutiButtonShown = false;
                                      tmpMsg.Token =  $scope.lv.data_mod.pvSubmitToken;
                                      tmpMsg.Callback = "modLvCallBack";
                                      $scope.$emit("Ctr1ModalShow", tmpMsg);
                                      $scope.lv.refresh();
                                  });
                      },

                      snapshotInit: function (item, index) {


                      },

                      snapshotSubmit: function (item, index) {
                          var postData =  {
                              name: $scope.lv.data_mod.snapshotName[index],
                              size:$scope.lv.data_mod.snapshotSize[index]
                          };

                          $scope.lv.data_mod.snapshotToken = Math.random();
                          $scope.aborter = $q.defer(),
                              $http.post("/storlever/api/v1/block/lvm/fs_list/"+$scope.lv.fsName+"/lv_list/"+item.name+"/snapshot", postData,{
                                  timeout: $scope.aborter.promise
                              }).success(function (response) {
                                      $scope.lv.refresh();
                                  }).error(function (response) {
                                      var tmpMsg = {};
                                      tmpMsg.Label = "错误";
                                      tmpMsg.ErrorContent = "lv"+ item.name +"snapshot失败";
                                      tmpMsg.ErrorContentDetail = response;
                                      tmpMsg.SingleButtonShown = true;
                                      tmpMsg.MutiButtonShown = false;
                                      tmpMsg.Token =  $scope.lv.data_mod.snapshotToken;
                                      tmpMsg.Callback = "modLvCallBack";
                                      $scope.$emit("Ctr1ModalShow", tmpMsg);
                                      $scope.lv.refresh();
                                  });
                      },

                      modLvCallBack:function (event, msg) {

                      },

                      destroy: function () {
                      }
                  };
              })()

          }
      })();

      $scope.lvlist = (function () {
          return {
              get: function () {//clean input,close add div
                  $scope.lv.data_add.clean_data();
                  //$scope.lv.addShown = false;
                  $scope.aborter = $q.defer(),
                      $http.get("/storlever/api/v1/block/lvm/fs_list/"+$scope.lv.fsName+"/lv_list", {
                          timeout: $scope.aborter.promise
                      }).success(function (response) {
                              $scope.lvlist.data = {};
                              $scope.lvlist.data.servers = response;
                          }).error(function (response) {
                              $scope.lvlist.data = {};
                              $scope.lvlist.data.servers = {};
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
      $scope.$on('modVgCallBack', $scope.fs.data_mod.modVgCallBack);
      $scope.$on('addVgCallBack', $scope.fs.data_add.addVgCallBack);
      $scope.$on('delVgCallBack', $scope.fs.delVgCallBack);
      $scope.$on('modLvCallBack', $scope.lv.data_mod.modLvCallBack);
      $scope.$on('addLvCallBack', $scope.lv.data_add.addLvCallBack);
      $scope.$on('delLvCallBack', $scope.lv.delLvCallBack);

//init fs list
      $scope.fs.show();


  }]);
