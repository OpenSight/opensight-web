/*
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
https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd5bc8eb5c47795d6&redirect_uri=http%3A%2F%2Fwww.opensight.cn%2Fwx%2FmyInfo.html&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect
reset1();
reset2();
    */
var defaultUrl = "www.opensight.cn/wx/";
var api = "http://api.opensight.cn/api/ivc/v1/wechat/";

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}

function getJwt(token, page){
    var e = Math.ceil(d.getTime() / 1000);
    var data = {code: token, expired: e};

    $.ajax({
        url: api + 'code_login',
        data: data,
        type: 'POST',
        success: function(json){
            $.cookie('jwt', json.jwt, {expires: 30});
            $.cookie('binding_id', json.binding_id, {expires: 30});
            window.location.href = defaultUrl+page+".html";
            //var ui = Base64.encodeURI(JSON.stringify(data));
            //window.location.replace(_this.url + '?jwt=' + json.jwt + '&ui=' + ui);
        },
        error: function() {
            window.location.replace = defaultUrl+"bind.html?page="+page;
        }
    });
}

function checkUrl(){
    var Token = getUrlParam("access_token");
    var goTo = getUrlParam("state");
    var page;
    if (Token == null || Token == ""){
        alert("Token is null!");
        return;
    }else{
        if (goTo == null || goTo == ""){
            alert("goTo is null!");
            return;
        }
        switch (goTo){
            case "1":
                page = "myProject";
                break;
            case "2":
                page = "myCamera";
                break;
            case "3":
                page = "myInfo";
                break;
            default:
                alert("unkown state:"+goTo);
                return;
        }

        getJwt(Token, page);
    }
};



checkUrl();