var Auth = function () {
  this.api = "http://api.opensight.cn/api/ivc/v1/wechat/";
};

Auth.prototype = {
  init: function (url) {

    this.selfUrl = this.getUrl(url, true);
    this.bindUrl = this.getUrl(url, false);

    this.jump();
    return true;;

  },
  getUrl: function (url, self) {
    var href = window.location.origin + window.location.pathname;
    if (true !== self) {
      var path = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/') + 1);
      href = window.location.origin + path + 'bind.html';
    }
    href = encodeURIComponent(href);
    return "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd5bc8eb5c47795d6"+ "&redirect_uri=" + href +  "&response_type=code&scope=snsapi_userinfo" +
      "&state=" + url + "#wechat_redirect";
  },
  getUrlParam: function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; //返回参数值
  },

  codeLogin: function (code) {
    var d = new Date();
    d.setHours(d.getHours() + 1);
    var e = Math.ceil(d.getTime() / 1000);
    var data = {
      code: code,
      expired: e
    };
    var _this = this;
    $.ajax({
      async: false,
      url: _this.api + 'code_login',
      data: data,
      type: 'POST',
      cache: false,
      success: function (json) {
        $.cookie('jwt', json.jwt, {
          expires: 30
        });
        $.cookie('binding_id', json.binding_id, {
          expires: 1440 * 90
        });
        return true;
      },
      error: function (err) {
        if (err.responseText.indexOf("Wechat Binding") >= 0) {
          window.location.replace(_this.bindUrl);
          return false;
        } else {
          alert(err.responseText);
          window.location.replace(_this.selfUrl);
          return false;
        }

      }
    });
  },

  jump: function () {
    var code = this.getUrlParam("code");
    if (code !== undefined && code !== null && code !== "")
      return this.codeLogin(code);
    else {
      $.removeCookie('jwt');
      $.removeCookie('binding_id');
      window.location.replace(this.selfUrl);
      return false;
    }

  }
};

var auth = new Auth();
