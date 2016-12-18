var Jwt = function (urlname) {
  this.api = "http://api.opensight.cn/api/ivc/v1/wechat/";
  this.url = urlname;
  this.init();
};

Jwt.prototype = {
  init: function () {
    // 检查cookie中jwt是否存在
    // 如果jwt不存在，检查url参数中是否携带了code，如果携带了code，使用code后期binding id，如果没有携带code，跳转获取code
    // 如果jwt存在，更新jwt，并启动定时器自动更新jwt
    this.jwt = $.cookie('jwt');
    this.binding_id = $.cookie('binding_id');
    if (undefined === this.jwt || undefined === this.binding_id) {
      var code = this.getUrlParam("code");
      if (code === undefined || code === null || code === "") {
        // 跳转到微信认证页面获取code
        this.jump2Authorize();
        return this;
      }
      // 使用code进行登录
      this.loginByCode(code);
    } else {
      // 不管缓存的jwt是否过期都去更新jwt，防止出现load页面的时候jwt正好没有过期，进去之后过期了而keepalive定时器第一次触发未开始
      this.updateJwt(false);
      this.aud = this.parse().aud;
    }

    this.keepalive();
    return this;
  },
  getUrlParam: function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; //返回参数值
  },
  jump2Authorize: function () {
    var href = window.location.origin + window.location.pathname;
    var state = this.getStateByUri(href);
    var url = this.getAuthorizeUrl(href, state);
    window.location.replace(url);
    return this;
  },
  getStateByUri: function(href){
    var m = href.match(/[a-zA-Z\d]+.html/);
    if (0 === m.length){
      return 'myInfo.html';
    }
    return m[0];
  },
  getAuthorizeUrl: function (redirect_uri, state) {
    redirect_uri = encodeURIComponent(redirect_uri);
    state = encodeURIComponent(state);
    return "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd5bc8eb5c47795d6" +
      "&redirect_uri=" + redirect_uri +
      "&response_type=code&scope=snsapi_userinfo" +
      "&state=" + state + "#wechat_redirect";
  },
  getExpired: function (timeeffect) {
    timeeffect = timeeffect || '3600000';
    timeeffect = parseInt(timeeffect, 10);

    var d = new Date();
    var e = Math.ceil((d.getTime() + timeeffect) / 1000);
    return e;
  },
  loginByCode: function (code) {
    var e = this.getExpired();
    $.ajax({
      async: false,
      url: this.api + 'code_login',
      data: {
        code: code,
        expired: e
      },
      type: 'POST',
      cache: false,
      success: function (json) {
        $.cookie('jwt', json.jwt);
        $.cookie('binding_id', json.binding_id);
        this.aud = json.username;
        this.jwt = json.jwt;
        this.binding_id = json.binding_id;
        return true;
      },
      error: function (xhr) {
        // code login 接口http status代表code超时，此时重新获取code，其他情况一律跳转到bind页面
        if (xhr && 452 === xhr.status) {
          this.jump2Bind();
          // this.jump2Authorize();
        } else {
          this.jump2Bind();
        }
        return false;
      },
      context: this
    });
  },
  getBindUrl: function () {
    var path = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/') + 1);
    var href = window.location.origin + path + 'bind.html';
    return href;
  },
  jump2Bind: function () {
    var bind_url = this.getBindUrl();
    var state = this.getStateByUri(window.location.href);

    var url = this.getAuthorizeUrl(bind_url, state);

    $.removeCookie('jwt');
    $.removeCookie('binding_id');

    window.location.replace(url);
    return this;
  },
  check: function () {
    var claim = this.parse();
    if (undefined === claim.exp || undefined === claim.aud) {
      return -1;
    }
    this.aud = claim.aud;
    var t = Math.ceil((new Date().getTime()) / 1000)
    return (claim.exp - t);
  },

  updateJwt: function (async, timeeffect) {
    async = async || false;
    timeeffect = timeeffect || '3600000';
    if (true === this.updateing) {
      return false;
    }
    this.updateing = true;
    var e = this.getExpired(timeeffect);

    $.ajax({
      url: this.api + 'binding_login',
      data: {
        binding_id: this.binding_id,
        expired: e
      },
      type: 'POST',
      cache: false,
      async: async,
      success: function (json) {
        this.jwt = json.jwt;
        $.cookie('jwt', json.jwt);
        //_this.setJqueryHeader();
        this.updateing = false;
      },
      error: function () {
        this.jump2Bind();
        this.updateing = false;
      },
      context: this
    });
    return this.jwt;
  },
  getJwt: function () {
    var timeeffect = $.cookie('timeeffect') || '3600000';
    return this.updateJwt(false, timeeffect);
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
  keepalive: function () {
    var _this = this;
    var interval = 10 * 60 * 1000;
    //_this.setJqueryHeader();
    setInterval(function () {
      if (interval > _this.check()) {
        _this.updateJwt(true);
      }
    }, interval);
  },
  logout: function () {
    this.jump2Bind();
  }
};
