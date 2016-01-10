
var flashvars = {
  // src: 'http://hzhls01.ys7.com:7886/hcnp/549693311_1_2_1_0_183.136.184.7_6500.m3u8',
  src: 'http://www.opensight.cn/hls/camera1.m3u8',
  // src: 'rtmp://hzrtmp02.ys7.com:1935/livestream/498570008_1_1_1_0',
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

swfobject.embedSWF("GrindPlayer.swf", "videoPlayer", "100%", "100%", "10.2", null, flashvars, params, attrs);