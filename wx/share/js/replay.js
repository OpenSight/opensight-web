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

var padding = function(n) {
  if (10 > n) {
    return '0' + n;
  }
  return n.toString();
};

var getDuration = function(dur) {
  var a = [{ t: '分', v: 60 }, { t: '时', v: 60 }, { t: '天', v: 24 }];
  var s = '';
  dur = Math.floor(dur / (1000 * 60));
  for (var i = 0, l = a.length; i < l; i++) {
    s = dur % a[i].v + a[i].t + s;
    dur = Math.floor(dur / a[i].v);
    if (0 === dur) {
      break;
    }
  }
  return s;
};

var format = function(t) {
  t = new Date(parseInt(t, 10));
  return padding(t.getMonth() + 1, 2) + '-' +
    padding(t.getDate(), 2) + ' ' +
    padding(t.getHours(), 2) + ':' +
    padding(t.getMinutes(), 2);
};

var play = function(hls) {
  var id = 'player';
  $('#player-container').html('<video id="'+id+'" controls autoplay="autoplay" webkit-playsinline="" width="100%" height="100%" src="' + hls + '" type="application/x-mpegURL"></video>');
  var player = document.getElementById(id);
  player.play();
  player.pause();
  var u = window.navigator.userAgent.toLowerCase();
  if (-1 === u.indexOf('windows') && -1 !== u.indexOf('android')) {
    player.load();
  }
  player.play();
  return player;
};

var showErrorMsg = function(){
  $('#weui_dialog_alert_info').html('分享已过期。');
  $('#weui_dialog_alert').show();
};

var api = 'http://api.opensight.cn/api/ivc/v1/';

var Backup = function(opts) {
  var share = new Share();

  $.ajax({
    url: api + 'projects/' + opts.project_name + '/record/events/' + opts.event_id,
    type: 'GET',
    async: false,
    crossDomain: true,
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader('Authorization', "Bearer " + opts.jwt);
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function(json) {
      $('title').html(json.desc);
      $('#desc').html(json.desc);
      $('#camera_name').html(json.camera_name);
      $('#start').html(format(json.start));
      $('#duration').html(getDuration(json.duration));
      $('.backup').removeClass('hidden');
      $('#player-container').html('<video id="player" controls autoplay="autoplay" webkit-playsinline="" width="100%" height="100%" src="' + json.hls + '" type="application/x-mpegURL"></video>');
      setTimeout(function() {
        var player = document.getElementById("player");
        player.load();
        player.play();
      }, 100);

      var desc = '摄像机: ' + json.camera_name + ' 开始时间: ' + format(json.start) + ' 时长: ' + getDuration(json.duration);
      share.onShare(json.desc, desc);
    },
    error: function() {
      /* Act on the event */
      showErrorMsg();
    }
  });
};


var Replay = function(opts) {
  this.opts = opts;

  this.share = new Share();
  this.init();
};

Replay.prototype = {
  init: function() {
    $('#start').html(format(this.opts.start));
    $('#end').html(format(this.opts.end));
    $('.replay').removeClass('hidden');

    this.getCameraInfo();
  },
  getCameraInfo: function() {
    var _t = this;
    $.ajax({
      url: api + 'projects/' + _t.opts.project_name + '/cameras/' + _t.opts.camera_id,
      type: 'GET',
      async: false,
      crossDomain: true,
      dataType: 'json',
      beforeSend: function(request) {
        request.setRequestHeader('Authorization', "Bearer " + _t.opts.jwt);
        request.setRequestHeader("Content-Type", 'application/json');
      },
      success: function(json) {
        $('title').html(json.name);
        $('#desc').html(json.name);
        this.name = json.name;
        if (0 !== json.flags & 0x100){
          showErrorMsg();
          return;
        }
        this.getRecordInfo();
      },
      error: function() {
        /* Act on the event */
        showErrorMsg();
      },
      context: this
    });
  },
  getRecordInfo: function() {
    var _t = this;
    $.ajax({
      url: api + 'projects/' + _t.opts.project_name + '/cameras/' + _t.opts.camera_id + '/record/search',
      type: 'GET',
      async: false,
      crossDomain: true,
      dataType: 'json',
      data: {
        start: _t.opts.start,
        end: _t.opts.end,
        seglength: 60
      },
      beforeSend: function(request) {
        request.setRequestHeader('Authorization', "Bearer " + _t.opts.jwt);
        request.setRequestHeader("Content-Type", 'application/json');
      },
      success: function(json) {
        if (0 === json.segments){
          showErrorMsg();
          return;
        }
        var player = play(json.segments[0].hls);
        // $(player).one('playing', function(){
        //   $(player).one('playing', function(){
        //     setTimeout(function(){
        //       player.currentTime = parseInt(_t.opts.current_time, 10);
        //     }, 2000);
        //   });
        // });

        var desc = '开始时间: ' + format(json.segments[0].start) + '  ' +
          '时长: ' + getDuration(json.segments[0].duration);
        this.share.onShare(this.name, desc);
      },
      error: function() {
        /* Act on the event */
        showErrorMsg();
      },
      context: this
    });
  }
};

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

$(function() {
  $('#weui_dialog_alert').on('click', '.weui_btn_dialog', function() {
    $('#weui_dialog_alert').hide();
  });

  var params = getUrlParams();
  if (undefined === params.jwt) {
    showErrorMsg();
    return;
  }

  if (undefined !== params.event_id) {
    new Backup(params);
  } else if (undefined !== params.start) {
    new Replay(params);
  } else {
    showErrorMsg();
  }
});
