var starting = false;

var start = function(uuid, timeout){
  starting = true
  $('#tip').removeClass('hidden').html('正在启动，请等待...');
  $.ajax({
    url: 'http://121.41.72.231:5001/api/ivc/v1/projects/demo/cameras/' + uuid + '/sessions',
    // async: false,
    data: {
      format: 'hls',
      quality: 'ld',
      create: true
    },
    type: 'POST',
    success: function(info) {
      $('#tip').removeClass('hidden').html(timeout/1000 + '秒后跳转');
      setTimeout(function(){
        window.location.href = info.url;
        starting = false;
      }, timeout);
    },
    error: function(){
      $('#tip').removeClass('hidden').html('启动失败，请检查。');
    }
  });
};

var stop = function(uuid){
  if (starting === true){
    $('#tip').removeClass('hidden').html('正在启动，不允许停止。');
    return;
  }
  $('#tip').removeClass('hidden').html('正在停止。。。');
  var flag = true;
  $.ajax({
    url: 'http://121.41.72.231:5001/api/ivc/v1/projects/demo/cameras/' + uuid + '/sessions',
    async: false,
    cache: false,
    data: {
      start: 0,
      limit: 10
    },
    type: 'GET',
    success: function(info) {
      for (var i = info.list.length - 1; i >= 0; i--) {
        $.ajax({
          url: 'http://121.41.72.231:5001/api/ivc/v1/projects/demo/cameras/' + uuid + '/sessions/' + info.list[i].session_id,
          async: false,
          cache: false,
          type: 'DELETE',
          error: function() {
            /* Act on the event */
            flag = false;
          }
        });
      };
    },
    error: function() {
      /* Act on the event */
      flag = false;
    }
  });
  if (true === flag){
    $('#tip').removeClass('hidden').html('停止完成。');
  } else {
    $('#tip').removeClass('hidden').html('停止失败，请检查。');
  }
};

$(function(){
  $('#start').click(function(){
    var uuid = $('#uuid').val();
    var time = $('#time').val();
    time = parseInt(time, 10);
    start(uuid, time);
  });
  $('#stop').click(function(){
    var uuid = $('#uuid').val();
    stop(uuid);
  });

  $('#preview').click(function(){
    var uri = $('#url').val();
    var bufferTime = parseFloat($('#bufferTime').val(), 10);
    // uri = 'http://121.41.72.231/hls/NMen0dvaSCG_oS_m_ver6w.m3u8';
    var flashvars = {
      // src: 'http://www.opensight.cn/hls/camera1.m3u8',
      src: uri,
      plugin_hls: "flashlsOSMF.swf",
      // scaleMode: 'none',
      autoPlay: true,
      bufferTime: bufferTime
    };

    var params = {
      allowFullScreen: true,
      allowScriptAccess: "always",
      wmode: 'opaque',
      bgcolor: "#000000"
    };
    var attrs = {
      name: "videoPlayer"
    };

    swfobject.embedSWF("GrindPlayer.swf", "videoPlayer", "100%", "100%", "10.2", null, flashvars, params, attrs);
  });
});