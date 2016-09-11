app.controller('MyInfo', ['$scope', '$http', '$q', '$window', function ($scope, $http, $q, $window) {
  var getUrl = function (file, state) {
    var pathname = window.location.pathname;
    var path = pathname.substr(0, pathname.lastIndexOf('/') + 1);
    var href = window.location.origin + path + file + '.html';
    href = encodeURIComponent(href);
    return "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd5bc8eb5c47795d6&response_type=code&scope=snsapi_userinfo" +
      "&state=" + state + "&redirect_uri=" + href + "#wechat_redirect";
  };
  $scope.ToastTxt = "xxxx";
  $scope.Acc = jwt.aud;
  $scope.wx_api = "http://api.opensight.cn/api/ivc/v1/wechat/";
  $scope.bindUrl = getUrl('bind', 'myInfo');
  $scope.codeLoginUrl = getUrl('myInfo', 'myInfo');

  $scope.unbind = (function () {
    $scope.aborter = $q.defer(),
      $http.delete($scope.wx_api + "bindings/" +
        $.cookie('binding_id'), {
          timeout: $scope.aborter.promise
        }).success(function (response) {
        $.removeCookie('jwt');
        $.removeCookie('binding_id');
        $scope.ToastTxt = "解绑成功";
        $('#loadingToast').show();
        setTimeout(function () {
          $('#loadingToast').hide();
        }, 2000);
        $window.location.replace($scope.bindUrl);
      }).error(function (response) {
        $.removeCookie('jwt');
        $.removeCookie('binding_id');
        $scope.ToastTxt = "解绑失败";
        $('#loadingToast').show();
        setTimeout(function () {
          $('#loadingToast').hide();
        }, 2000);
        $window.location.replace($scope.codeLoginUrl);
      });
  });

  $scope.userinfo = (function () {
    return {
      data: (function () {
        return {
          showDetail: function (item, index) {
            if ($scope.userinfo.data_mod.bDetailShown === undefined) $scope.userinfo.data_mod.bDetailShown = false;
            $scope.userinfo.data_mod.bDetailShown = !(true === $scope.userinfo.data_mod.bDetailShown);
            if ($scope.userinfo.data_mod.bDetailShown === true) { //开
              $scope.userinfo.data_mod.selectItem = item;
              $scope.userinfo.data_mod.tabs[0].active = true;
            } else {

            }
          }
        };
      })(),

      data_mod: (function () {
        return {
          initData: function (item) {
            $scope.userinfo.data_mod.data = item;
            $scope.userinfo.data_mod.initPreShow();
          },
          initPreShow: function () {
            var preShow = $.cookie('preShow');
            if (preShow === "" || preShow === undefined || preShow === "true") {
              $scope.preShow = true;
            } else $scope.preShow = false;
          },
          setPreCookie: function () {
            $.cookie('preShow', $scope.preShow, {
              expires: 1440 * 360
            });
          },
          close: function () {
            $scope.userinfo.data_mod.initDetail();
          },

          initDetail: function () {
            if (flag === true && jwt != undefined && jwt.aud != undefined) {

            } else {
              alert("bad jwt!plz reload your page!");
              return;
            }

            if ($scope.userinfo.data_mod.tabs === undefined) $scope.userinfo.data_mod.tabs = [];
            if ($scope.userinfo.data_mod.tabs[0] === undefined) $scope.userinfo.data_mod.tabs[0] = {};
            $scope.userinfo.data_mod.tabs[0].active = true;
            $scope.aborter = $q.defer(),
              $http.get("http://api.opensight.cn/api/ivc/v1/users/" + $scope.Acc, {
                timeout: $scope.aborter.promise
              }).success(function (response) {
                $scope.userinfo.data_mod.initData(response);
              }).error(function (response, status) {
                $scope.ToastTxt = "获取" + $scope.Acc + "的userinfo失败";
                $('#loadingToast').show();
                setTimeout(function () {
                  $('#loadingToast').hide();
                }, 2000);
                $window.location.replace($scope.codeLoginUrl);
              });
          },

          submitForm: function () {
            var postData = {
              title: $scope.userinfo.data_mod.data.title,
              desc: $scope.userinfo.data_mod.data.desc,
              long_desc: $scope.userinfo.data_mod.data.long_desc,
              email: $scope.userinfo.data_mod.data.email,
              cellphone: $scope.userinfo.data_mod.data.cellphone
            };

            // $scope.userinfo.data_mod.modUserInfoToken = Math.random();
            $scope.aborter = $q.defer(),
              $http.put("http://api.opensight.cn/api/ivc/v1/users/" + $scope.Acc, postData, {
                timeout: $scope.aborter.promise
              }).success(function (response) {
                $scope.ToastTxt = "更新用户" + $scope.Acc + "的userinfo成功";
                $('#loadingToast').show();
                setTimeout(function () {
                  $('#loadingToast').hide();
                }, 2000);
              }).error(function (response, status) {
                $scope.ToastTxt = "更新用户" + $scope.Acc + "的userinfo失败";
                $('#loadingToast').show();
                setTimeout(function () {
                  $('#loadingToast').hide();
                }, 2000);
                $window.location.replace($scope.codeLoginUrl);
              });
          },


          initPasswd: function () {
            $scope.userinfo.data_mod.old_password = "";
            $scope.userinfo.data_mod.new_password = "";
            $scope.userinfo.data_mod.new_password_confirm = "";
          },

          encryptPasswd: function (passwd) {
            return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(passwd, "opensight.cn", 10000));
            //return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2("password", "salt", 1));
          },


          modPasswd: function () {
            if ($scope.userinfo.data_mod.old_password === "" ||
              $scope.userinfo.data_mod.new_password === "" ||
              $scope.userinfo.data_mod.new_password_confirm === "") {
              alert("密码不能为空");
              return;
            } else if ($scope.userinfo.data_mod.new_password !== $scope.userinfo.data_mod.new_password_confirm) {
              alert("新密码填写不一致");
              return;
            }

            var postData = {
              old_password: $scope.userinfo.data_mod.encryptPasswd($scope.userinfo.data_mod.old_password),
              new_password: $scope.userinfo.data_mod.encryptPasswd($scope.userinfo.data_mod.new_password)
            };

            // $scope.userinfo.data_mod.modUserInfoToken = Math.random();
            $scope.aborter = $q.defer(),
              $http.put("http://api.opensight.cn/api/ivc/v1/users/" + $scope.Acc + "/password", postData, {
                timeout: $scope.aborter.promise
              }).success(function (response) {
                $scope.ToastTxt = "修改密码成功";
                $('#loadingToast').show();
                setTimeout(function () {
                  $('#loadingToast').hide();
                }, 2000);
              }).error(function (response, status) {
                $scope.ToastTxt = "修改密码失败";
                $('#loadingToast').show();
                setTimeout(function () {
                  $('#loadingToast').hide();
                }, 2000);
                $window.location.replace($scope.codeLoginUrl);
              });

          },



          destroy: function () {}
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

  $scope.userinfo.data_mod.initDetail();






}]);
