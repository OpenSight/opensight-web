$(function() {
  var player = $('#player').on('play', function () {
    $('#status').html('连接成功！');
    $('#resolution').removeClass('hidden');
    var w = $('#width');
    var h = $('#height');
    w.html(this.videoWidth);
    h.html(this.videoHeight);
  });
  // player.get(0).play();
  // var player = videojs('player');
  // player.play();
  // player.enterFullWindow();
  // player.ready(function(){
  //   $('#status').html('连接成功！');
  //   $('#resolution').removeClass('hidden');
  // });
  // setInterval(function() {
  //   $('#resolution').removeClass('hidden');
  //   var w = $('#width');
  //   var h = $('#height');
  //   w.html(player.videoWidth());
  //   h.html(player.videoHeight());
  // }, 1000);
});