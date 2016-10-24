var Jwt = function (urlname) {
  this.url = urlname;
  this.init();
  this.keepalive();
};

Jwt.prototype = {
  init: function () {
    // if (Base64 === undefined) alert("Base64 not load well!");
    this.jwt = $.cookie('jwt');
    this.binding_id = $.cookie('binding_id');
    this.api = "http://api.opensight.cn/api/ivc/v1/wechat/";

      this.selfUrl = this.getUrl(this.url, true);
      this.bindUrl = this.getUrl(this.url, false);

    if (0 >= this.check()) {//check jwt is valueable
      this.jump();
    }



//      checkJwt
//      checkBindlogin
//      checkCodeLogin
//      goBind
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
                $.cookie('jwt', json.jwt);
                $.cookie('binding_id', json.binding_id);
                _this.aud = json.username;
                _this.jwt = json.jwt;
                _this.binding_id = json.binding_id;
                return true;
            },
            error: function (err) {
                if (err === undefined || err.responseText === undefined || err.responseText.indexOf("Wechat Binding") >= 0) {
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

    code_jump: function () {
        var code = this.getUrlParam("code");
        if (code !== undefined && code !== null && code !== "")
            return this.codeLogin(code);
        else {//no code ,get one
            $.removeCookie('jwt');
            $.removeCookie('binding_id');
            //jamken advice go bind let's check
          //  window.location.replace(this.selfUrl);
            window.location.replace(this.bindUrl);
            return false;
        }

    },

  check: function () {
    if (undefined === this.jwt || this.binding_id === undefined) { //must have two cookies
      return -1;
    }
    var claim = this.parse();
    if (undefined === claim.exp || undefined === claim.aud) {
      return -1;
    }
    this.aud = claim.aud;
    var t = Math.ceil((new Date().getTime()) / 1000)
    return (claim.exp - t);
  },

  update: function (syncOp) {
    if (true === this.updateing) {
      return false;
    }
    this.updateing = true;
    var d = new Date();
    d.setHours(d.getHours() + 1);
    var e = Math.ceil(d.getTime() / 1000);

    var _this = this;
    $.ajax({
      url: _this.api + 'binding_login',
      data: {
        binding_id: this.binding_id,
        expired: e
      },
      type: 'POST',
      cache: false,
      async: syncOp,
      success: function (json) {
        _this.jwt = json.jwt;
        $.cookie('jwt', json.jwt);
        //_this.setJqueryHeader();
        _this.updateing = false;
      },
      error: function () {
//        window.location.replace(_this.bindUrl);
        _this.code_jump();
        _this.updateing = false;
      }
    });
  },

  getJwt: function () {
    if (true === this.updateing) {
      return false;
    }
    this.updateing = true;

    var timeeffect = $.cookie('timeeffect') || '3600000';
    timeeffect = parseInt(timeeffect, 10);
    var d = new Date();
    var e = Math.ceil((d.getTime() + timeeffect) / 1000);

    var _this = this;
    $.ajax({
      url: _this.api + 'binding_login',
      data: {
        binding_id: this.binding_id,
        expired: e
      },
      type: 'POST',
      cache: false,
      async: false,
      success: function (json) {
        _this.jwt = json.jwt;
        $.cookie('jwt', json.jwt);
        _this.updateing = false;
      },
      error: function () {
//        window.location.replace(_this.bindUrl);
        _this.code_jump();
        _this.updateing = false;
      }
    });
    return _this.jwt;
  },

  parse: function () {
    var a = this.jwt.split('.');
    if (a.length < 2) {
      return {};
    }
    var obj = JSON.parse(window.atob(a[1]));
    if (undefined === obj.aud || undefined === obj.exp) {
      alert("jwt解析失败！");
      return {};
    }

    return obj;
  },

  jump: function () {
    if (this.binding_id !== undefined && this.binding_id !== null && this.binding_id !== "") {
      this.update(false);
    } else
//      window.location.replace(this.bindUrl);
          this.code_jump()
  },

  keepalive: function () {
    var _this = this;
    var interval = 10 * 60 * 1000;
    //_this.setJqueryHeader();
    setInterval(function () {
      if (interval > _this.check()) {
        _this.update(true);
      }
    }, interval);
  },

  logout: function () {
      $.removeCookie('jwt');
      this.jump();
    }
};
