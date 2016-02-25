login.controller('loginCtrl', ['$scope', '$http', '$q','$location','$window','$cookieStore', function($scope, $http, $q ,$location, $window, $cookies){
    $scope.auth = (function () {
        return {
            check: function () {
                if ($scope.admin === "" || $scope.passwd ===""){
                    alert("Account or Password can not be empty!");
                    return;
                }else{
                    //$scope.auth.get();
                    $scope.auth.crypt_get();
                }
            },

            init:function () {
                $scope.admin = "";
                $scope.passwd = "";
            },

            get: function () {
                var postData = {
                    username: $scope.admin,
                    password: $scope.passwd

                };

                $scope.aborter = $q.defer(),
                    $http.post("http://api.opensight.cn/api/ivc/v1/plaintext_login", postData, {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $window.location.href = "index.html?user="+$scope.admin+"&token="+response.jwt;
                        }).error(function (response,state) {
                            var msg = "code: "+ state + "\n" + "message:" + response;
                            $scope.auth.init();
                        });
            },

            crypt_get: function () {
                var d = new Date ();
                d.setHours(d.getHours() + 1);
                var e = Math.ceil(d.getTime() / 1000);
                var postData = {
                    username: $scope.admin,
                    password: sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2($scope.passwd, G_salt, 100000)),
                    expired: e
                };

                $scope.aborter = $q.defer(),
                    $http.post("http://api.opensight.cn/api/ivc/v1/user_login", postData, {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $cookies.put('jwt',response.jwt,{'expires': 30});
                            //$cookies.put('jwt',response.jwt);
                            $cookies.put('username',postData.username,{'expires': 30});
                            $cookies.put('password',postData.password,{'expires': 30});
                            /*     var favoriteCookie = $cookieStore.get('myFavorite');
                            *     // Removing a cookie
                            *     $cookieStore.remove('myFavorite');
                            *     */
                            //$window.location.href = "index.html?user="+$scope.admin+"&token="+response.jwt;
                            $window.location.href = "index.html";
                        }).error(function (response,state) {
                            var msg = "code: "+ state + "\n" + "message:" + response;
                            $scope.auth.init();
                        });
            }


        };
    })();

}]);