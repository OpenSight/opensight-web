var swfpath = '../../../../';
var getUrlParams = function() {
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
  // window.history.replaceState({}, '', url);
  return parseStr(decodeURI(seach), '&');
};

var parseStr = function(str, sp) {
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
};

var getBitmap = function(f, bits) {
  var t = [];
  var i = 0;
  do {
    t[i] = f % 2;
    f = Math.floor(f / 2);
    i++;
  } while (f > 0);
  while (i < bits) {
    t[i] = 0;
    i++;
  }
  return t;
};

var quality = function(bitmap) {
  var camera_ab = [
    { value: 'ld', text: 'LD', title: '流畅', cls: '', idx: 0 },
    { value: 'sd', text: 'SD', title: '标清', cls: '', idx: 1 },
    { value: 'hd', text: 'HD', title: '高清', cls: '', idx: 2 },
    { value: 'fhd', text: 'FHD', title: '超清', cls: '', idx: 3 }
  ];
  var t = [];
  for (var i = 0, l = camera_ab.length; i < l; i++) {
    if (1 === bitmap[camera_ab[i].idx]) {
      t.push(camera_ab[i]);
    }
  }
  return t;
};

var HlsVideo = function(opts) {
  // alert(document.createElement('video').canPlayType('application/x-mpegURL'));
  if ('' === document.createElement('video').canPlayType('application/x-mpegURL')) {
    this.html5 = false;
  } else {
    this.html5 = true;
  }
  this.api = 'http://api.opensight.cn/api/ivc/v1/projects/';
  this.project = opts.project_name;
  this.uuid = opts.camera_id;
  this.quality = opts.quality.toLowerCase();
  this.jwt = opts.jwt;

  this.share = new Share();
  this.init();
};

HlsVideo.prototype = {
  init: function() {
    this.getCameraInfo();
    this.on();
    this.updateTip();
  },
  on: function() {},
  loadFlash: function(info) {
    var flashvars = {
      // src: 'http://www.opensight.cn/hls/camera1.m3u8',
      src: info.url,
      plugin_hls: swfpath + "flashlsOSMF.swf",
      // scaleMode: 'none',
      autoPlay: true
    };

    var params = {
      allowFullScreen: true,
      allowScriptAccess: "always",
      wmode: 'opaque',
      bgcolor: "#000000"
    };
    var attrs = {
      name: "player"
    };

    swfobject.embedSWF(swfpath + "GrindPlayer.swf", "player", "100%", "100%", "10.2", null, flashvars, params, attrs);
  },
  addVideoTag: function(info) {
    var el = $('#player-container').html('<video id="player" controls autoplay="autoplay" webkit-playsinline="" width="100%" height="100%" src="' + info.url + '" type="application/x-mpegURL"></video>');
    var player = document.getElementById('player');
    player.play();
    player.pause();
    var u = window.navigator.userAgent.toLowerCase();
    if (-1 === u.indexOf('windows') && -1 !== u.indexOf('android')) {
      player.load();
    }
    player.play();
  },
  getCameraInfo: function() {
    var _this = this;
    $.ajax({
      url: this.api + this.project + '/cameras/' + this.uuid,
      type: 'GET',
      async: false,
      crossDomain: true,
      dataType: 'json',
      beforeSend: function(request) {
        request.setRequestHeader('Authorization', "Bearer " + _this.jwt);
        request.setRequestHeader("Content-Type", 'application/json');
      },
      success: function(info) {
        // $('#img').attr('src', info.preview);
        _this.showCameraInfo(info);
        this.share.onShare(info.name, info.desc);
      },
      error: function() {
        _this.error();
      },
      context: this
    });
  },
  getQualityText: function(quality){
    var map = {
      ld: '流畅',
      sd: '标清',
      hd: '高清',
      fhd: '超清'
    };
    return map[quality];
  },
  showCameraInfo: function(info) {
    $('title').html(info.name);
    $('#camera_name').html(info.name);
    $('#quality').html(this.getQualityText(this.quality));
    $('#desc').html(info.desc);
    $('#long_desc').html(info.long_desc);

    var qa = quality(getBitmap(info.flags, 8));
    if (0 === qa.length) {
      this.error();
      return;
    }
    if (0 !== info.flags & 0x100){
      this.error();
      return;
    }
    // var html = '';
    // for (var i = 0, l = qa.length; i < l; i++) {
    //   html += '<div class="weui_navbar_item" id="' + qa[i].value + '">' + qa[i].title + '</div>';
    // }
    // $('#flags').html(html);
    // this.quality = qa[qa.length - 1].value;
    // $('#' + this.quality).addClass('weui_bar_item_on');

    this.createSession();
  },
  createSession: function() {
    var _this = this;
    $.ajax({
      url: this.api + this.project + '/cameras/' + this.uuid + '/sessions',
      // crossDomain: true,
      dataType: 'json',
      data: { format: 'hls', quality: this.quality, create: true, user: 'share' },
      type: 'POST',
      beforeSend: function(request) {
        request.setRequestHeader('Authorization', "Bearer " + _this.jwt);
        // request.setRequestHeader("Content-Type", 'application/json');
      },
      success: function(info) {
        if (true === _this.html5) {
          _this.addVideoTag(info);
        } else {
          _this.addVideoTag(info);
        }
        _this.keepalive(info.session_id);

        if (undefined !== _this.tiptimer) {
          clearInterval(_this.tiptimer);
          _this.tiptimer = undefined;
        }
      },
      error: function() {
        _this.error();
      }
    });
  },
  keepalive: function(sessionid) {
    var _this = this;
    setInterval(function() {
      $.ajax({
        url: _this.api + _this.project + '/cameras/' + _this.uuid + '/sessions/' + sessionid,
        cache: true,
        type: 'POST'
      });
    }, 30000);
  },
  updateTip: function() {
    var _this = this;
    var sec = 10;
    this.tiptimer = setInterval(function() {
      if (1 === sec && undefined !== _this.tiptimer) {
        clearInterval(_this.tiptimer);
        _this.tiptimer = undefined;
        return;
      }
      sec--;
      $('#player-tip-sec').text(sec);
    }, 1000);
  },
  error: function() {
    if (undefined !== this.tiptimer) {
      clearInterval(this.tiptimer);
      this.tiptimer = undefined;
    }
    $('#weui_dialog_alert_info').html('分享已过期。');
    $('#weui_dialog_alert').show();
  }
};
$(function() {
  $('#weui_dialog_alert').on('click', '.weui_btn_dialog', function() {
    $('#weui_dialog_alert').hide();
  });

  var params = getUrlParams();
  if (undefined === params.jwt) {
    $('#weui_dialog_alert_info').html('分享已过期。');
    $('#weui_dialog_alert').show();
    return;
  }
  new HlsVideo(params);
});


var Share = function () {
  this.url = window.location.href;
  this.inited = undefined;
  this.title = undefined;

  this.init();
  // this.on();

  return this;
};
Share.prototype = {
  init: function () {
    var timestamp = Math.round(new Date().getTime() / 1000);
    var noncestr = this.url + new Date().getTime().toString();
    $.ajax({
      url: 'http://api.opensight.cn/api/ivc/v1/wechat/jsapi_signature',
      type: 'POST',
      async: false,
      data: {
        timestamp: timestamp,
        noncestr: noncestr,
        url: this.url
      },
      success: function (info) {
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: info.appid, // 必填，公众号的唯一标识
          timestamp: timestamp, // 必填，生成签名的时间戳
          nonceStr: noncestr, // 必填，生成签名的随机串
          signature: info.signature, // 必填，签名，见附录1
          jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
        var _t = this;
        wx.ready(function () {
          _t.inited = true;
          if (undefined !== _t.title) {
            _t.onMenuShare();
          }
        });
      },
      context: this
    });
    return this;
  },
  on: function () {
    var _t = this;
    $('#share').click(function () {
      _t.showTip();
    });
    $('#overlay').click(function () {
      _t.hideTip();
    });
    return this;
  },
  onMenuShare: function () {
    var _t = this;
    var imgUrl = this.getPath() + '../img/play-logo.png';
    wx.onMenuShareAppMessage({
      title: this.title, // 分享标题
      desc: this.desc, // 分享描述
      link: this.url, // 分享链接
      imgUrl: imgUrl, // 分享图标
      success: function () {
        // 用户确认分享后执行的回调函数
        _t.hideTip();
      },
      cancel: function () {
        // 用户取消分享后执行的回调函数
        _t.hideTip();
      }
    });
    wx.onMenuShareTimeline({
      title: this.title, // 分享标题
      link: this.url, // 分享链接
      imgUrl: imgUrl, // 分享图标
      success: function () {
        // 用户确认分享后执行的回调函数
        _t.hideTip();
      },
      cancel: function () {
        // 用户取消分享后执行的回调函数
        _t.hideTip();
      }
    });
    return this;
  },
  onShare: function (title, desc) {
    this.title = title;
    this.desc = desc;
    if (true === this.inited) {
      this.onMenuShare();
    }
    return this;
  },
  showTip: function () {
    $('#overlay').addClass('modal-overlay-visible');
    $('#video-container').hide();
    return this;
  },
  hideTip: function () {
    $('#overlay').removeClass('modal-overlay-visible');
    $('#video-container').show();
    return this;
  },
  getPath: function () {
    var pathname = window.location.pathname;
    var last = pathname.lastIndexOf('/');
    var path = pathname.substr(0, pathname.lastIndexOf('/') + 1);
    return window.location.origin + path;
  }
};
