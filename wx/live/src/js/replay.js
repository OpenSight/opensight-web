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
      $('#duration').html(getDuration(json.end - json.start));
      $('.backup').removeClass('hidden');
      $('#player-container').html('<video id="player" controls autoplay="autoplay" webkit-playsinline="" width="100%" height="100%" src="' + json.hls + '" type="application/x-mpegURL"></video>');
      setTimeout(function() {
        var player = document.getElementById("player");
        player.load();
        player.play();
      }, 100);
    },
    error: function() {
      /* Act on the event */
      showErrorMsg();
    }
  });
};

var Replay = function(opts) {
  this.opts = opts;
  this.init();
};

Replay.prototype = {
  init: function() {
    $('#start').html(format(this.opts.start));
    $('#end').html(format(this.opts.end));
    $('.replay').removeClass('hidden');

    this.getCameraInfo();
    this.getRecordInfo();
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
      },
      error: function() {
        /* Act on the event */
        showErrorMsg();
      }
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
        player.currentTime = _t.opts.current_time;
      },
      error: function() {
        /* Act on the event */
        showErrorMsg();
      }
    });
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
  } else if (undefined !== params.current_time) {
    new Replay(params);
  } else {
    showErrorMsg();
  }
});
