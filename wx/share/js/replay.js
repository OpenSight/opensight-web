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

var getDuration = function(dur, ms) {
  var a = [{ t: '秒', v: 60 }, { t: '分', v: 60 }, { t: '时', v: 60 }, { t: '天', v: 24 }];
  var s = '';
  if (true === ms) {
    dur = Math.floor(dur / 1000);
  }
  for (var i = 0, l = a.length; i < l; i++) {
    s = dur % a[i].v + a[i].t + s;
    dur = Math.floor(dur / a[i].v);
    if (0 === dur) {
      break;
    }
  }
  return s;
};

var api = 'http://api.opensight.cn/api/ivc/v1/';
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

  $.ajax({
    url: api + 'projects/' + params.project_name + '/record/events/' + params.event_id,
    type: 'GET',
    async: false,
    crossDomain: true,
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader('Authorization', "Bearer " + params.jwt);
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function(json) {
      $('title').html(json.desc);
      $('#desc').html(json.desc);
      $('#camera_name').html(json.camera_name);
      var start = new Date(json.start);
      $('#start').html(padding(start.getMonth() + 1, 2) + '-' + padding(start.getDate(), 2) + ' ' + padding(start.getHours(), 2) + ':' + padding(start.getMinutes(), 2));
      $('#duration').html(getDuration(json.end - json.start, true));
      $('#player-container').html('<video id="player" controls autoplay="autoplay" webkit-playsinline="" width="100%" height="100%" src="' + json.hls + '" type="application/x-mpegURL"></video>');
      setTimeout(function() {
        var player = document.getElementById("player");
        player.load();
        player.play();
      }, 100);
    },
    error: function() {
      /* Act on the event */
      $('#weui_dialog_alert_info').html('分享已过期。');
      $('#weui_dialog_alert').show();
    }
  });
});
