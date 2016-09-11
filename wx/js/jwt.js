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
    this.bindUrl = this.getUrl('bind', this.url);

    if (0 >= this.check()) {
      this.jump();
    }
    /*
            var claim = this.parse();
            if (undefined !== claim.aud){
              this.aud = claim.aud;
            } else {
              this.jump();
            }
            */
  },
  getUrl: function (file, state) {
    var pathname = window.location.pathname;
    var path = pathname.substr(0, pathname.lastIndexOf('/') + 1);
    var href = window.location.origin + window.location.path + file + '.html';
    href = encodeURIComponent(href);
    return "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd5bc8eb5c47795d6&response_type=code&scope=snsapi_userinfo" +
      "&state=" + state + "&redirect_uri=" + href + "#wechat_redirect";
  }
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

  update: function () {
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
      success: function (json) {
        _this.jwt = json.jwt;
        $.cookie('jwt', json.jwt);
        //_this.setJqueryHeader();
        _this.updateing = false;
      },
      error: function () {
        window.location.replace(_this.bindUrl);
        _this.updateing = false;
      }
    });

  },
  getJwt: function (days) {
    if (true === this.updateing) {
      return false;
    }
    this.updateing = true;
    var d = new Date();
    d.setHours(d.getHours() + days * 24 * 60 * 60);
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
      async: false,
      success: function (json) {
        _this.jwt = json.jwt;
        $.cookie('jwt', json.jwt);
        //_this.setJqueryHeader();
        _this.updateing = false;
      },
      error: function () {
        window.location.replace(_this.bindUrl);
        _this.updateing = false;
      }
    });
    return _this.jwt;
  },
  /*
      function _doDecode() {
      var sJWT = document.form1.jwt1.value;

      var a = sJWT.split(".");
      var uHeader = b64utos(a[0]);
      var uClaim = b64utos(a[1]);

      var pHeader = KJUR.jws.JWS.readSafeJSONString(uHeader);
      var pClaim = KJUR.jws.JWS.readSafeJSONString(uClaim);

      var sHeader = JSON.stringify(pHeader, null, "  ");
      var sClaim = JSON.stringify(pClaim, null, "  ");

      document.form1.im_head1.value = sHeader;
      document.form1.im_payload1.value = sClaim;
  }
  */

  /*
  parse: function(){
    var list = Base64.decode(this.jwt).match(/\{[^\{\}]*\}/g);
    for (var i = 0, l = list.length; i < l; i++){
      var obj = JSON.parse(list[i]);
      if (undefined === obj.aud || undefined === obj.exp){
        continue;
      }
      return obj;
    }
    return {};
  },
*/

  parse: function () {
    /*
    var a = this.jwt.split(".");
    var uClaim = b64utos(a[1]);
    var obj = JSON.parse(uClaim);
    return obj;
    */
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
      this.update();
    } else
      window.location.replace(this.bindUrl);
  },

  keepalive: function () {
    var _this = this;
    var interval = 10 * 60 * 1000;
    //_this.setJqueryHeader();
    setInterval(function () {
      if (interval > _this.check()) {
        _this.update();
      }
    }, interval);
  },

  logout: function () {
      $.removeCookie('jwt');
      this.jump();
    }
    /*
      setJqueryHeader: function(){
            $.ajaxSetup( {
                headers: { // 默认添加请求头
                    "Authorization": "Bearer " + this.jwt
                }
            } );
      }
      */
};
