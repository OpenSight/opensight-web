$(function() {
  var player = $('#player').on('play', function () {
    $('#status').html('连接成功！');
    $('#resolution').removeClass('hidden');
    var w = $('#width');
    var h = $('#height');
    w.html(this.videoWidth);
    h.html(this.videoHeight);
  });
});