$(function () {
  $.get('README.md', function (response) {
    var str = marked(response);
    $(document.body).append(str);
  });
});