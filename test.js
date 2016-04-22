var getMedia = navigator.getUserMedia ||
			   navigator.webkitGetUserMedia ||
			   navigator.mozGetUserMedia ||
			   navigator.msGetUserMedia ;
var myStream;
var streamSetting = { video: false, audio: true};
var aTag = document.getElementById('aTag');
var aContext = new AudioContext();

var aRecorder;
var chunks = [];

if (navigator.mediaDevices.getUserMedia) {
	navigator.mediaDevices.getUserMedia( streamSetting ).then( mediaSuccess ).catch(function(err){mediaFail(err);});
} else if (getMedia) {
	getMedia( streamSetting, mediaSuccess, mediaFail );
} else {
	console.log("getUserMedia not supported");
}

function mediaSuccess (stream) {
	console.log("here");
	aRecorder = new MediaRecorder( stream );
	aRecorder.ondataavailable = function(evt) {
		chunks.push(evt.data);
		var aBlob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'});
		var temp = window.URL.createObjectURL(aBlob);
		window.URL.revokeObjectURL(aTag.src);
		aTag.src = temp;
		chunks.length = 0;
}

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
