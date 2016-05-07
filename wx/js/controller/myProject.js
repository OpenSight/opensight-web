app.register.controller('MyProject', ['$scope', '$http', '$q','$state', function($scope, $http, $q, $state){
    
    $scope.myproject = (function () {
        return {
            data: (function () {
                return {
                    showDetail: function (item, index) {
                        if ($scope.myproject.data_mod.bDetailShown === undefined) $scope.myproject.data_mod.bDetailShown = false;
                        $scope.myproject.data_mod.bDetailShown = !(true === $scope.myproject.data_mod.bDetailShown);
                        if ($scope.myproject.data_mod.bDetailShown === true) {//开
                            $scope.myproject.data_mod.selectItem = item;
                            $scope.myproject.data_mod.tabs[0].active = true;
                        } else {

                        }
                    }
                };
            })(),

            data_mod: (function () {
                return {
                    initData: function(item) {
                        $scope.myproject.data_mod.data = item;
                    },

                    close: function() {
                        $scope.myproject.data_mod.initDetail();
                    },

                    initDetail: function () {
                        if ($scope.myproject.data_mod.tabs === undefined) $scope.myproject.data_mod.tabs = [];
                        if ($scope.myproject.data_mod.tabs[0] === undefined) $scope.myproject.data_mod.tabs[0] = {};
                        $scope.myproject.data_mod.tabs[0].active = true;
                        $scope.aborter = $q.defer(),
                            $http.get("http://api.opensight.cn/api/ivc/v1/users/"+G_user, {
                                timeout: $scope.aborter.promise
                                /*                       headers:  {
                                 "Authorization" : "Bearer "+$scope.authToken,
                                 "Content-Type": "application/json"
                                 }
                                 */
                            }).success(function (response) {
                                    $scope.myproject.data_mod.initData(response);
                                }).error(function (response,status) {
                                    var tmpMsg = {};
                                    tmpMsg.Label = "错误";
                                    tmpMsg.ErrorContent = "获取"+ G_user +"的myproject失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    //tmpMsg.Token =  $scope.myproject.data_mod.addHotSpToken;
                                    //tmpMsg.Callback = "modMdCallBack";
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined &&  response.info.indexOf("Token ")>=0)){
                                        //$scope.$emit("Logout", tmpMsg);
                                        $state.go('logOut',{info: response.info,traceback: response.traceback});
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                });
                    },

                    submitForm: function () {
                        var postData =  {
                            title: $scope.myproject.data_mod.data.title,
                            desc: $scope.myproject.data_mod.data.desc,
                            long_desc: $scope.myproject.data_mod.data.long_desc,
                            email: $scope.myproject.data_mod.data.email,
                            cellphone: $scope.myproject.data_mod.data.cellphone
                        };

                       // $scope.myproject.data_mod.modMyProjectToken = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.put("http://api.opensight.cn/api/ivc/v1/users/"+G_user, postData, {
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
                                    tmpMsg.ErrorContent = "更新用户 "+ G_user+" 的myproject失败";
                                    tmpMsg.ErrorContentDetail = response;
                                    tmpMsg.SingleButtonShown = true;
                                    tmpMsg.MutiButtonShown = false;
                                    //tmpMsg.Token =  $scope.myproject.data_mod.modMyProjectToken;
                                    //tmpMsg.Callback = "modMdCallBack";
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined &&  response.info.indexOf("Token ")>=0)){
                                        //$scope.$emit("Logout", tmpMsg);
                                        $state.go('logOut',{info: response.info,traceback: response.traceback});
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    // $scope.myproject.data_mod.hotRefresh(item, index);
                                });
                    },


                    initPasswd: function () {
                        $scope.myproject.data_mod.old_password = "";
                        $scope.myproject.data_mod.new_password = "";
                        $scope.myproject.data_mod.new_password_confirm = "";
                    },

                    encryptPasswd: function (passwd) {
                        return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(passwd, G_salt, 100000));
                        //return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2("password", "salt", 1));
                    },


                    modPasswd: function () {
                        var tmpMsg = {};
                        tmpMsg.Label = "错误";
                        tmpMsg.ErrorContent = "修改用户 "+ G_user+" 的密码失败";
                        tmpMsg.SingleButtonShown = true;
                        tmpMsg.MutiButtonShown = false;

                       if ($scope.myproject.data_mod.old_password === "" ||
                           $scope.myproject.data_mod.new_password === "" ||
                           $scope.myproject.data_mod.new_password_confirm === ""){
                           tmpMsg.ErrorContentDetail = "密码不能为空";
                           $scope.$emit("Ctr1ModalShow", tmpMsg);
                           return;
                       }else if ($scope.myproject.data_mod.new_password !== $scope.myproject.data_mod.new_password_confirm){
                           tmpMsg.ErrorContentDetail = "新密码填写不一致";
                           $scope.$emit("Ctr1ModalShow", tmpMsg);
                           return;
                       }

                        var postData =  {
                            old_password: $scope.myproject.data_mod.encryptPasswd($scope.myproject.data_mod.old_password),
                            new_password: $scope.myproject.data_mod.encryptPasswd($scope.myproject.data_mod.new_password)
                        };

                        // $scope.myproject.data_mod.modMyProjectToken = Math.random();
                        $scope.aborter = $q.defer(),
                            $http.put("http://api.opensight.cn/api/ivc/v1/users/"+G_user+"/password", postData, {
                                timeout: $scope.aborter.promise
                                /*                       headers:  {
                                 "Authorization" : "Bearer "+$scope.authToken,
                                 "Content-Type": "application/json"
                                 }
                                 */
                            }).success(function (response) {

                                }).error(function (response,status) {
                                    tmpMsg.ErrorContentDetail = response;
                                    if (status === 403 || (response!==undefined && response!==null && response.info!==undefined &&  response.info.indexOf("Token ")>=0)){
                                        //$scope.$emit("Logout", tmpMsg);
                                        $state.go('logOut',{info: response.info,traceback: response.traceback});
                                    }else
                                        $scope.$emit("Ctr1ModalShow", tmpMsg);

                                    // $scope.myproject.data_mod.hotRefresh(item, index);
                                });

                    },



                    destroy: function () {
                    }
                };
            })()

        }
    })();


    $scope.destroy = function () {
        if (undefined !== $scope.aborter) {
            $scope.aborter.resolve();
            delete $scope.aborter;
        }
    };

    $scope.$on('$destroy', $scope.destroy);


//add all callback
    /*
    $scope.$on('modMdCallBack', $scope.myproject.data_mod.modMdCallBack);
    $scope.$on('addMdCallBack', $scope.myproject.data_add.addMdCallBack);
    $scope.$on('delMdCallBack', $scope.myproject.delMdCallBack);
*/


//init myproject


    $scope.myproject.data_mod.initDetail();



}]);

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}

function checkUrl(){
    var Token = getUrlParam("access_token");
    if (Token == null){
        var jwt = getUrlParam("jwt");
    }else{
/*go /wechat/code_login
if success{
 //store jwt
 //init page
}else{
 wxpage get new authtoken---->bindPage jump--->if success{
                        get bindid
                        /wechat/binding_login    if success{
                                jump project page with jwt
                                }else stay bind page(alert error)
                        }else{
                            stay bind page(alert error)
                        }
}


*/
    }
};



checkUrl();

$(document).ready(function () {
    var mySwiper = new Swiper ('.swiper-container', {
        direction: 'horizontal',
        loop: false,

        // 如果需要分页器
        //pagination: '.swiper-pagination',
//后翻获取当前页并向后台获取
        onSlideNextStart: function(swiper){
            alert(mySwiper.activeIndex);
        },
        // 如果需要前进后退按钮
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        observer:'true'
        // 如果需要滚动条
        //scrollbar: '.swiper-scrollbar'
    })
});
