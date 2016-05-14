var Login = function(){
  this.url = 'http://www.opensight.cn/wx/';
  this.api = 'http://api.opensight.cn/api/ivc/v1/wechat/';

  var params = this.getUrlParams();
  if (undefined === params.state || null === params.state || "" === params.state){
      alert("unknown from url!");
      params.state = "myInfo";
  }
  this.url += params.state;
  this.codeLoginUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?" +
      "appid=wxd5bc8eb5c47795d6&redirect_uri=http%3A%2F%2Fwww.opensight.cn%2Fwx%2F" + params.state +
      ".html&response_type=code&scope=snsapi_userinfo&state=" + params.state +
      "#wechat_redirect";
  this.bindUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?" +
      "appid=wxd5bc8eb5c47795d6&redirect_uri=http%3A%2F%2Fwww.opensight.cn%2Fwx%2F" +
      "bind.html&response_type=code&scope=snsapi_userinfo&state=" + params.state +
      "#wechat_redirect";

  if (undefined === params.code || null === params.code || "" === params.code){
      alert("wrong code!");
      window.location.replace(this.bindUrl);
  }else{
      this.code = params.code;
  }
};

Login.prototype = {
    bindLogin:  function(bid){
        $('#loadingTxt').val("正在登录");
        $('#loadingToast').show();
        var d = new Date ();
        d.setHours(d.getHours() + 1);
        var e = Math.ceil(d.getTime() / 1000);
        var _this = this;
        var data = {binding_id: bid, expired: e};

        $.ajax({
            url: _this.api + 'binding_login',
            data: data,
            type: 'POST',
            success: function(json){
                $.cookie('jwt', json.jwt, {expires: 30});
                $('#loadingTxt').val("登录成功");
                setTimeout(function () {
                    $('#loadingToast').hide();
                }, 2000);
                _this.logining = false;
                window.location.replace(_this.url+".html");
            },
            error: function(err) {
                $('#loadingTxt').val("登录失败");
                setTimeout(function () {
                    $('#loadingToast').hide();
                }, 2000);
                alert("bind login err, err info: "+ err.responseText);
                _this.logining = false;
                $.removeCookie('jwt');
                $.removeCookie('binding_id');
                window.location.replace(_this.codeLoginUrl);
            }
        });
    },

    login: function(u, p){
        if (undefined === u || "" === u){
          return false;
        }
        if (undefined === p || "" === p){
          return false;
        }

        if (true === this.logining){
          return false;
        }

        this.logining = true;
        $('#loadingTxt').val("正在进行绑定");
        $('#loadingToast').show();
        var d = new Date ();
        d.setTime(d.getTime()+90*24*3600*1000);
        var e = Math.ceil(d.getTime() / 1000);
        var data = {username: u, password: sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(p, "opensight.cn", 100000)), expired: e, code: this.code};
        var _this = this;
        $.ajax({
          url: this.api + 'bindings',
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
        return false;
    },

    get: function(){
        var u = $.cookie('username');
        var p = $.cookie('password');
        if (undefined === u || undefined === p){
          return null;
        }
        return {username: u, password: p};
    },

    getUrlParams: function(){
        var href = window.location.href;
        var start = href.indexOf('?') + 1;
        if (0 === start){
          return {};
        }
        var stop = href.indexOf('#');
        if (-1 === stop){
          stop = href.length;
        }
        var seach = href.substring(start, stop);
        var url = window.location.protocol + '//' + window.location.host + window.location.pathname + window.location.hash;
        window.history.replaceState({} , '', url);
        return this.parseStr(seach, '&');
    },

    parseStr: function(str, sp){
        var arr = str.split(sp);
        var data = {};
        var idx = 0;
        for (var i = 0, l = arr.length; i < l; i++){
          var tmp = arr[i].split('=');
          if (2 > tmp.length){
            continue;
          }
          data[tmp[0]] = tmp[1];
          idx++;
        }
        return data;
    }
};

$(function(){
  var login = new Login();
  var userinfo = login.get();
  if (null !== userinfo){
    $('#username').val(userinfo.username);
    $('#password').val(userinfo.password);
  }

  $('#form').submit(function(event) {
    /* Act on the event */
    var u = $('#username').val();
    var p = $('#password').val();
    login.login(u, p);
    return false;
  });
});