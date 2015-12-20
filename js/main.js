
var initContents = function(){
  var tmpl = $('#content-tmpl').text();
  var html = juicer(tmpl, {contents: contents});
  $('#content').html(html);
};

$(function() {
  initContents();
  $('.thumbnail').matchHeight({
    byRow: true,
    property: 'height',
    target: null,
    remove: false
  });
});