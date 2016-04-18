function go1(){
    window.location.href = $("#auth_url1").val();
};
function reset1(){
    $("#auth_url1").val(
        "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd5bc8eb5c47795d6" +
            "&redirect_uri=http%3A%2F%2Fwww.opensight.cn%2Fwx%2FmyProject.html" +
            "&response_type=code&scope=snsapi_base&state=123#wechat_redirect");
};

function go2(){
    window.location.href = $("#auth_url2").val();
};
function reset2(){
    $("#auth_url2").val(
        "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd5bc8eb5c47795d6" +
            "&redirect_uri=http%3A%2F%2Fwww.opensight.cn%2Fwx%2FmyProject.html" +
            "&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect");
};

reset1();
reset2();