login.controller('loginCtrl', ['$scope', '$http', '$q','$location','$window','$cookieStore', function($scope, $http, $q ,$location, $window, $cookieStore){
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
                    $http.post("http://121.41.72.231:5001/api/ivc/v1/plaintext_login", postData, {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $window.location.href = "index.html?user="+$scope.admin+"&token="+response.jwt;
                        }).error(function (response,state) {
                            var msg = "code: "+ state + "\n" + "message:" + response;
                            $scope.auth.init();
                        });
            },

            crypt_get: function () {
                var postData = {
                    username: $scope.admin,
                    password: sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2($scope.passwd, G_salt, 100000))

                };

                $scope.aborter = $q.defer(),
                    $http.post("http://121.41.72.231:5001/api/ivc/v1/user_login", postData, {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $cookieStore.put('jwt',response.jwt);
                            /*     var favoriteCookie = $cookieStore.get('myFavorite');
                            *     // Removing a cookie
                            *     $cookieStore.remove('myFavorite');
                            *     */
                            //$window.location.href = "index.html?user="+$scope.admin+"&token="+response.jwt;
                            $window.location.href = "index.html?user="+$scope.admin;
                        }).error(function (response,state) {
                            var msg = "code: "+ state + "\n" + "message:" + response;
                            $scope.auth.init();
                        });
            }


        };
    })();

}]);