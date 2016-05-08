var Login = function(){
  this.url = 'http://www.opensight.cn/wx/';
  this.api = 'http://api.opensight.cn/api/ivc/v1/wechat/';
  this.timeInterval = 0;
  this.code = "";
  this.state = "";

  var params = this.getUrlParams();
  if (undefined !== params.code){
      this.code = params.code;
      if (undefined === params.state)
          params.state = "1";
      this.state = params.state;
      switch (params.state){
          case "1":
              this.url += "myProject";
              break;
          case "2":
              this.url += "myCamera";
              break;
          case "3":
              this.url += "myInfo";
              break;
          default:
              alert("unkown state:"+params.state);
              this.url += "myProject";
              break;
      }
  }else{
      alert("wrong code!");
  }
};

Login.prototype = {
    bindLogin:  function(bid){
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
                window.location.href = _this.url+".html";
                //var ui = Base64.encodeURI(JSON.stringify(data));
                //window.location.href(_this.url + '?jwt=' + json.jwt + '&ui=' + ui);
            },
            error: function() {
                alert("binding_login error!");
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
    //this.logining = true;
    var d = new Date ();
    d.setHours(d.getHours() + 1);
    var e = Math.ceil(d.getTime() / 1000);
    var data = {username: u, password: sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(p, "opensight.cn", 100000)), expired: e, code: this.code};
    var _this = this;
    $.ajax({
      url: this.api + 'bindings',
      data: data,
      type: 'POST',
      success: function(json){
          $.cookie('binding_id', json.binding_id, {expires: 30});
          _this.bindLogin(json.binding_id);
          /*
          $.ajax({
              url: this.api + 'binding_login',
              data: {binding_id: json.binding_id, expired: e},
              type: 'POST',
              success: function(json2){
                  $.cookie('jwt', json2.jwt, {expires: 30});
                  window.location.href = this.url+".html";
                  //var ui = Base64.encodeURI(JSON.stringify(data));
                  //window.location.href(_this.url + '?jwt=' + json.jwt + '&ui=' + ui);
              },
              error: function() {
                  alert("binding_login error!");
              }
          });
          */
          //Login.bindLogin();
        //window.location.replace(_this.url + '?jwt=' + json.jwt + '&ui=' + ui);
      }, 
      error: function() {
          alert("bind error!");
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