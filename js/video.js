var api = new flashlsAPI(getFlashMovieObject("moviename"));

$(function(){

  setTimeout(function(){
    api.load('http://hzhls01.ys7.com:7886/hcnp/549693311_1_2_1_0_183.136.184.7_6500.m3u8');
    // api.load('http://www.opensight.cn/hls/camera1.m3u8');
    api.play();
  }, 1000);
  // 
});