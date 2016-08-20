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
  this.jwt = opts.jwt;

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
      },
      error: function() {
        _this.error();
      }
    });
  },
  showCameraInfo: function(info) {
    $('title').html(info.name);
    $('#camera_name').html(info.name);
    $('#desc').html(info.desc);
    $('#long_desc').html(info.long_desc);

    var qa = quality(getBitmap(info.flags, 8));
    if (0 === qa.length) {
      this.error();
      return;
    }
    var html = '';
    for (var i = 0, l = qa.length; i < l; i++) {
      html += '<div class="weui_navbar_item" id="' + qa[i].value + '">' + qa[i].title + '</div>';
    }
    $('#flags').html(html);
    this.quality = qa[qa.length - 1].value;
    $('#' + this.quality).addClass('weui_bar_item_on');

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
