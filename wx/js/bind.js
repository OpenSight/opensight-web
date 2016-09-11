var Login = function () {
  this.url = 'http://www.opensight.cn/wx/';
  this.api = 'http://api.opensight.cn/api/ivc/v1/wechat/';

  var params = this.getUrlParams();
  if (undefined === params.state || null === params.state || "" === params.state) {
    alert("unknown from url!");
    params.state = "myInfo";
  }
  this.url += params.state;
  this.codeLoginUrl = this.geturl(params.state, params.state);
  this.bindUrl = this.geturl('bind', params.state);

  if (undefined === params.code || null === params.code || "" === params.code) {
    alert("wrong code!");
    window.location.replace(this.bindUrl);
  } else {
    this.code = params.code;
  }
};

Login.prototype = {
  bindLogin: function (bid) {
    $('#loadingTxt').val("正在登录");
    $('#loadingToast').show();
    var d = new Date();
    d.setHours(d.getHours() + 1);
    var e = Math.ceil(d.getTime() / 1000);
    var _this = this;
    var data = {
      binding_id: bid,
      expired: e
    };

    $.ajax({
      url: _this.api + 'binding_login',
      data: data,
      type: 'POST',
      success: function (json) {
        $.cookie('jwt', json.jwt, {
          expires: 30
        });
        $('#loadingTxt').val("登录成功");
        setTimeout(function () {
          $('#loadingToast').hide();
        }, 2000);
        //_this.logining = false;
        window.location.replace(_this.url + ".html");
      },
      error: function (err) {
        $('#loadingTxt').val("登录失败");
        setTimeout(function () {
          $('#loadingToast').hide();
        }, 2000);
        alert("bind login err, err info: " + err.responseText);
        //_this.logining = false;
        $.removeCookie('jwt');
        $.removeCookie('binding_id');
        window.location.replace(_this.codeLoginUrl);
      }
    });
  },
  getUrl: function (file, state) {
    var pathname = window.location.pathname;
    var path = pathname.substr(0, pathname.lastIndexOf('/') + 1);
    var href = window.location.origin + path + file + '.html';
    href = encodeURIComponent(href);
    return "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd5bc8eb5c47795d6&response_type=code&scope=snsapi_userinfo" +
      "&state=" + state + "&redirect_uri=" + href + "#wechat_redirect";
  },
  goBind: function (u, p) {
    //alert("begin sjcl!");
    var d = new Date();
    d.setTime(d.getTime() + 370 * 24 * 3600 * 1000);
    var e = Math.ceil(d.getTime() / 1000);
    var data = {};
    var _this = this;
    data = {
      username: u,
      password: sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(p, "opensight.cn", 10000)),
      expired: e,
      code: _this.code
    };
    $.ajax({
      url: _this.api + 'bindings',
      data: data,
      type: 'POST',
      success: function (json) {
        $.cookie('binding_id', json.binding_id, {
          expires: 90 * 1440
        });
        //_this.logining = false;
        _this.bindLogin(json.binding_id);
      },
      error: function (err) {
        $('#loadingToast').hide();
        if (err.responseText.indexOf("Wechat Binding Already exists") >= 0) {
          alert("bind error!err info: " + err.responseText);
          // _this.logining = false;
          window.location.replace(_this.codeLoginUrl);
        } else {
          alert("bind error!");
          //_this.logining = false;
          window.location.replace(_this.codeLoginUrl);
        }

      }
    });
  },

  login: function (u, p) {
    if (undefined === u || "" === u) {
      return false;
    }
    if (undefined === p || "" === p) {
      return false;
    }
    /*
            if (true === this.logining){
              return false;
            }

            this.logining = true;*/
    $('#loadingTxt').val("正在进行绑定");
    $('#loadingToast').show();

    /*   var d = new Date ();
       d.setTime(d.getTime()+90*24*3600*1000);
       var e = Math.ceil(d.getTime() / 1000);
       var data = {};
       var _this = this;
       */
    //setTimeout(this.goBind(u, p), 3000);
    this.goBind(u, p);
    /*
            var xe = new Date ();
            var xeT = Math.ceil(xe.getTime() / 1000);

            var xp = new Date ();
            var xpT = Math.ceil(xp.getTime() / 1000);
            alert("100000test---->before:"+xeT+" now:"+xpT+ "time="+(xpT-xeT));
    */
    /*   var _this = this;
        $.ajax({
          url: _this.api + 'bindings',
          data: data,
          type: 'POST',
          success: function(json){
              $.cookie('binding_id', json.binding_id, {expires: 90*1440});
              _this.bindLogin(json.binding_id);
          },
          error: function(err) {
              $('#loadingToast').hide();
              if (err.responseText.indexOf("already")>=0){
                  alert("bind error!err info: "+err.responseText);
                  _this.logining = false;
                  window.location.replace(_this.codeLoginUrl);
              }else{
                  alert("bind error!err info: "+err.responseText);
                  _this.logining = false;
                  window.location.replace(_this.bindUrl);
              }

          }
        });
*/
    return false;
  },

  getUrlParams: function () {
    var href = window.location.href;
    var start = href.indexOf('?') + 1;
    if (0 === start) {
      return {};
    }
    var stop = href.indexOf('#');
    if (-1 === stop) {
      stop = href.length;
    }
    var seach = href.substring(start, stop);
    var url = window.location.protocol + '//' + window.location.host + window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', url);
    return this.parseStr(seach, '&');
  },

  parseStr: function (str, sp) {
    var arr = str.split(sp);
    var data = {};
    var idx = 0;
    for (var i = 0, l = arr.length; i < l; i++) {
      var tmp = arr[i].split('=');
      if (2 > tmp.length) {
        continue;
      }
      data[tmp[0]] = tmp[1];
      idx++;
    }
    return data;
  }
};

$(function () {
  var login = new Login();

  $('#form').submit(function (event) {
    /* Act on the event */
    var u = $('#username').val();
    var p = $('#password').val();
    login.login(u, p);
    return false;
  });
});
