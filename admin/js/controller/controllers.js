var G_token,G_user,G_salt;

function G_GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}
//G_token = G_GetQueryString("token");
//G_user = G_GetQueryString("user");
G_user = jwt.get().aud;
G_token = jwt.get().jwt;
G_salt = "opensight.cn";


app.controller('ModalCtrl', ['$scope', '$rootScope', '$timeout', '$http', '$q', '$window', '$cookieStore', function($scope, $rootScope, $timeout, $http, $q, $window, $cookies){
    //$scope.token = G_GetQueryString("token");
    //$scope.user = G_GetQueryString("user");
    // G_token = $cookies.get('jwt');
    // G_user = $cookies.get('username');
    // if (G_token===undefined || G_user===undefined || G_user==="") $window.location.href = "login.html";
    // $scope.token = G_token;
    $scope.user = G_user;
    $scope.$on("Ctr1ModalShow",
        function (event, errMsg) {
            $scope.errModalHandler.show(errMsg);
        }
    );

    $scope.$on("Logout",function (event, errMsg) {
            $scope.Login.show(errMsg);
        }
    );

    $scope.$on("Login",function (event, errMsg) {
            $scope.Login.hide();
        }
    );


    $scope.$on("freshToken",function (event, errMsg) {
            if ($scope.token === ""){
                $scope.Login.show(errMsg);
            }else{
                $scope.$broadcast("newToken",$scope.token);
                $scope.$broadcast(errMsg);
            }
        }
    );

    $scope.$on("errorEmit",function (event, errMsg) {
            if(errMsg){//api error
                $scope.errModalHandler(errMsg);
            }
            else{//auth
                $scope.Login.show(errMsg);
            }
        }
    );



    $scope.errModalHandler = (function () {
        return {
            show: function (errMsg) {
                $scope.gModal = {};

                $scope.gModal.Label = errMsg.Label;
                $scope.gModal.ErrorContent = errMsg.ErrorContent;
                $scope.gModal.ErrorContentDetail = JSON.stringify(errMsg.ErrorContentDetail, null, "\t");
                $scope.gModal.DetailShown = false;

                $scope.gModal.LogoutButtonShown = errMsg.LogoutButtonShown;
                $scope.gModal.SingleButtonShown = errMsg.SingleButtonShown;
                $scope.gModal.MessageShown = errMsg.MessageShown;
                $scope.gModal.MutiButtonShown = errMsg.MutiButtonShown;
                $scope.gModal.ConfirmButtonShown = errMsg.ConfirmButtonShown;
                $scope.gModal.Token = errMsg.Token;
                $scope.gModal.Callback = errMsg.Callback;

                $scope.gModal.goOn = function () {
                    var tmpMsg = {};
                    tmpMsg.Token = $scope.gModal.Token;
                    tmpMsg.Stop = false;
                    $scope.$broadcast($scope.gModal.Callback, tmpMsg);
                    $('#myErrorModal').modal('hide');
                };
                $scope.gModal.stop = function () {
                    var tmpMsg = {};
                    tmpMsg.Token = $scope.gModal.Token;
                    tmpMsg.Stop = true;
                    $scope.$broadcast($scope.gModal.Callback, tmpMsg);
                    $('#myErrorModal').modal('hide');
                };

                $scope.gModal.logout = function () {
                    if ($scope.gModal.Callback = "logOutCallBack" && errMsg.logOutCallBack !== "")
                        jwt.logout();
                };

                $('#myErrorModal').modal();
            }
        };
    })();

  $scope.message = {
    bshow: false,
    list: [],
    timer: undefined,
    remove: function(idx) {
      $scope.message.list.splice(idx, 1);
      if (0 === $scope.message.list.length) {
        $scope.message.hide();
      }
    },
    show: function(msg) {
      $scope.message.clear();
      $scope.message.list = [msg];
      $scope.message.bshow = true;
      $scope.message.autohide();
      // $scope.$apply();
    },
    hide: function() {
      $scope.message.list = [];
      $scope.message.bshow = false;
      $scope.message.clear();
      // $scope.$apply();
    },
    clear: function() {
      if (undefined === $scope.message.timer) {
        return;
      }
      $timeout.cancel($scope.message.timer);
      $scope.message.timer = undefined;
    },
    push: function(msg) {
      $scope.message.clear();
      $scope.message.list.push(msg);
      $scope.message.bshow = true;
      $scope.message.autohide();
      // $scope.$apply();
    },
    autohide: function() {
      $scope.message.timer = $timeout(function() {
        $scope.message.timer = undefined;
        $scope.message.hide();
      }, 5000);
    }
  };
  $rootScope.$on('messageShow', function(event, data) {
    console.log('messageShow');
    $scope.message.show(data);
  });
  $rootScope.$on('messageHide', function(event) {
    console.log('messageHide');
    $scope.message.hide();
  });
  $rootScope.$on('messagePush', function(event, data) {
    $scope.message.push(data);
    console.log('messagePush');
  });

    $scope.Login = (function () {
        return {
            show: function (errMsg) {
                $scope.Login.callback = errMsg.Callback;
                $scope.Login.init();
                $('#LoginModal').modal();
            },
            hide:function () {
                $('#LoginModal').modal('hide');
            },
            init:function () {
                $scope.admin = "";
                $scope.passwd = "";
            },
            get: function () {
                var postData = {
                    username: $scope.admin,
                    password: $scope.passwd,
                    expired: 10000
                };
                $scope.aborter = $q.defer(),
                    $http.post("http://api.opensight.cn/api/ivc/v1/plaintext_login", postData, {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $scope.$broadcast("newToken", response.jwt);
                            if ($scope.Login.callback === "")
                            {}
                            else
                                $scope.$broadcast($scope.Login.callback);
                            $scope.token = response.jwt;
                            $scope.Login.hide();

                        });
            }


        };
    })();



}]);
