// var api = new flashlsAPI(getFlashMovieObject("moviename"));

// $(function(){

//   setTimeout(function(){
//     api.load('http://hzhls01.ys7.com:7886/hcnp/549693311_1_2_1_0_183.136.184.7_6500.m3u8');
//     // api.load('http://www.opensight.cn/hls/camera1.m3u8');
//     api.play();
//     // loadStream('http://hzhls01.ys7.com:7886/hcnp/549693311_1_2_1_0_183.136.184.7_6500.m3u8');
//   }, 1000);
//   // 
// });
// var player = null;

// function loadStream(url) {
//   player.setMediaResourceURL(url);
// }

// function jsbridge(playerId, event, data) {
//   if (player == null) {
//     player = document.getElementById(playerId);
//   }
//   switch (event) {
//     case "onJavaScriptBridgeCreated":
//       listStreams(teststreams, "streamlist");
//       break;
//     case "timeChange":
//     case "timeupdate":
//     case "progress":
//       break;
//     default:
//       console.log(event, data);
//   }
// }

// // Collect query parameters in an object that we can
// // forward to SWFObject:

// var pqs = new ParsedQueryString();
// var parameterNames = pqs.params(false);
// var parameters = {
//   src: "http://www.opensight.cn/hls/camera1.m3u8",
//   //src: "http://localhost:8082/playlists/test_001/stream.m3u8",
//   autoPlay: "true",
//   verbose: true,
//   controlBarAutoHide: "true",
//   controlBarPosition: "bottom",
//   poster: "images/poster.png",
//   javascriptCallbackFunction: "jsbridge",
//   plugin_hls: "flashls/bin/debug/flashlsOSMF.swf",
//   hls_minbufferlength: -1,
//   hls_maxbufferlength: 30,
//   hls_lowbufferlength: 3,
//   hls_seekmode: "KEYFRAME",
//   hls_startfromlevel: -1,
//   hls_seekfromlevel: -1,
//   hls_live_flushurlcache: false,
//   hls_info: true,
//   hls_debug: false,
//   hls_debug2: false,
//   hls_warn: true,
//   hls_error: true,
//   hls_fragmentloadmaxretry: -1,
//   hls_manifestloadmaxretry: -1,
//   hls_capleveltostage: false,
//   hls_maxlevelcappingmode: "downscale"
// };

// for (var i = 0; i < parameterNames.length; i++) {
//   var parameterName = parameterNames[i];
//   parameters[parameterName] = pqs.param(parameterName) ||
//     parameters[parameterName];
// }

// var wmodeValue = "direct";
// var wmodeOptions = ["direct", "opaque", "transparent", "window"];
// if (parameters.hasOwnProperty("wmode")) {
//   if (wmodeOptions.indexOf(parameters.wmode) >= 0) {
//     wmodeValue = parameters.wmode;
//   }
//   delete parameters.wmode;
// }

// // Embed the player SWF:
// swfobject.embedSWF(
//   "flashls/examples/osmf/GrindPlayer.swf", "GrindPlayer", 640, 480, "10.1.0", "expressInstall.swf", parameters, {
//     allowFullScreen: "true",
//     wmode: wmodeValue
//   }, {
//     name: "GrindPlayer"
//   }
// );

var flashvars = {
  // src: 'http://hzhls01.ys7.com:7886/hcnp/549693311_1_2_1_0_183.136.184.7_6500.m3u8',
  src: 'http://www.opensight.cn/hls/camera1.m3u8',
  plugin_hls: "flashlsOSMF.swf",
  autoPlay: true
};
var params = {
  allowFullScreen: true,
  allowScriptAccess: "always",
  bgcolor: "#000000"
};
var attrs = {
  name: "videoPlayer"
};

swfobject.embedSWF("GrindPlayer.swf", "videoPlayer", "854", "480", "10.2", null, flashvars, params, attrs);