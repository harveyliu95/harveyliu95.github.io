var getMedia = navigator.getUserMedia ||
			   navigator.webkitGetUserMedia ||
			   navigator.mozGetUserMedia ||
			   navigator.msGetUserMedia ;
var myStream;
var streamSetting = { video: false, audio: true};
var aTag = document.getElementById('aTag');
var aContext = new AudioContext();
var aDestNode = aContext.createMediaStreamDestination();
var aRecorder = new MediaRecorder( aDestNode.stream );
aRecorder.ondataavailable = function(evt) {
	chunks.push(evt.data);
	var aBlob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'});
	window.URL.revokeObjectURL(aTag.src);
	aTag.src = window.URL.createObjectURL(aBlob);
	chunks.length = 0;
}
var chunks = [];

if (navigator.mediaDevices.getUserMedia) {
	console.log("hehe");
	navigator.mediaDevices.getUserMedia(streamSetting).then(function(stream){mediaSuccess(stream);console.log("here?");}).catch(function(err){mediaFail(err);});
} else if (getMedia) {
	getMedia( streamSetting, mediaSuccess, mediaFail );
} else {
	console.log("getUserMedia not supported");
}

var mediaSuccess = function(stream) {
	console.log("here");
	myStream = stream;
	var aSrcNode = aContext.createMediaStreamSource(stream);
	aSrcNode.connect(aDestNode);
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
