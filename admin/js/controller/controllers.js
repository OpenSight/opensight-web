var G_token,G_user,G_salt;

function G_GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}
G_token = G_GetQueryString("token");
G_user = G_GetQueryString("user");
G_salt = "opensight.cn";

app.controller('ModalCtrl', ['$scope', '$http', '$q', '$window', '$cookieStore', function($scope, $http, $q, $window, $cookies){
    //$scope.token = G_GetQueryString("token");
    //$scope.user = G_GetQueryString("user");
    G_token = $cookies.get('jwt');
    $scope.token = G_token;
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
                        $window.location.href = errMsg.logOutCallBack;
                };

                $('#myErrorModal').modal();
            }
        };
    })();


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
                    $http.post("http://121.41.72.231:5001/api/ivc/v1/plaintext_login", postData, {
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

    $scope.keepalive = (function () {
        return {
            check: function (errMsg) {
                if (undefined === $cookies.get('jwt')){
                    return -1;
                }
                var claim = $scope.keepalive.parse();
                if (undefined === claim.exp){
                    return -1;
                }
                var t = Math.ceil((new Date().getTime()) / 1000)
                return (claim.exp - t);
            },
            update:function () {
                if (true === $scope.keepalive.updateing){
                    return false;
                }
                $scope.keepalive.updateing = true;
                var d = new Date ();
                d.setHours(d.getHours() + 1);
                var e = Math.ceil(d.getTime() / 1000);

                var postData = {username: $cookies.get('username'), password: $cookies.get('password'), expired: e};
                $scope.aborter = $q.defer(),
                    $http.post("http://121.41.72.231:5001/api/ivc/v1/user_login", postData, {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $cookies.put('jwt',response.jwt,{'expires': 30});
                            $cookies.put('username',postData.username,{'expires': 30});
                            $cookies.put('password',postData.password,{'expires': 30});
                            $scope.keepalive.updateing = false;
                            G_token = $cookies.get('jwt');
                        }).error(function (response,state) {
                            $scope.keepalive.updateing = false;
                        });


            },
            parse:function () {
                var list = Base64.decode($cookies.get('jwt')).match(/\{[^\{\}]*\}/g);
                for (var i = 0, l = list.length; i < l; i++){
                    var obj = JSON.parse(list[i]);
                    if (undefined === obj.aud || undefined === obj.exp){
                        continue;
                    }
                    return obj;
                }
                return {};
            }
        };
    })();

    var interval = 10 * 60 * 1000;
    setInterval(function(){
        if (interval > $scope.keepalive.check()){
            $scope.keepalive.update();
        }
    }, interval);

}]);
