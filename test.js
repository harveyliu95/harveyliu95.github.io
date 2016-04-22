var getMedia = navigator.getUserMedia ||
			   navigator.webkitGetUserMedia ||
			   navigator.mozGetUserMedia ||
			   navigator.msGetUserMedia ;
var myStream;
var streamSetting = { video: false, audio: true};
var aTag = document.getElementById('aTag');
var aContext = new AudioContext();
var aSrc = window.URL.createObjectURL(aContext.destination);
aTag.src = aSrc;

var aRecorder;
var tempBuffer = aContext.createBufferSource();
aRecorder.ondataavailable = function(evt) {
	chunks.push(evt.data);
	var aBlob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'});
	tempBuffer.buffer = aBlob;
	chunks.length = 0;
}
var chunks = [];

if (navigator.mediaDevices.getUserMedia) {
	navigator.mediaDevices.getUserMedia(streamSetting).then(function(stream){mediaSuccess(stream);}).catch(function(err){mediaFail(err);});
} else if (getMedia) {
	getMedia( streamSetting, mediaSuccess, mediaFail );
} else {
	console.log("getUserMedia not supported");
}

var mediaSuccess = function(stream) {
	console.log("here");
	aRecorder = new MediaRecorder( stream );
	beginGetSound();
};

var mediaFail = function(err) {console.log(err);};

function beginGetSound () {
	aRecorder.start();
	setTimeout(function() {
		aRecorder.stop();
		beginGetSound();
	}, 200);
}
