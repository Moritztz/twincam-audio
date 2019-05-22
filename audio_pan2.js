'use strict';


//webRTC取得準備
let localStream = null;
let peer = null;
let existingCall = null;
let deviceIDglobal = null;
//let peerConnection = null;


//audio処理用
window.AudioContext = window.AudioContext || window.webkitAudioContext; 


 // device ID知るとき用
function getDeviceList(){
navigator.mediaDevices.enumerateDevices()
.then(function(devices) {
  devices.forEach(function(device) {
    console.log("deviceID : " + devices[1].deviceId);
	deviceIDglobal = devices[1].deviceId;
  });
})
.catch(function(err) {
  console.log(err.name + ": " + err.message);
});
};

function getMedia(){
//var deviceID = devices[0].deviceId;
navigator.mediaDevices.getUserMedia(
     {
        video : false,
        audio :{
        deviceId:deviceIDglobal,
        echoCancellation:false
                 }
    }
)

.then(function (stream){

    console.log("getusermediaID : " + deviceIDglobal);

    //AudioContextを作成
    var context  = new AudioContext();

    //sourceの作成
    var source = context.createMediaStreamSource(stream);
    var splitter = context.createChannelSplitter(2);
    source.connect(splitter);
    var merger = context.createChannelMerger(2); 
    splitter.connect(merger,0,0);
    splitter.connect(merger,1,1);

       //peer1の作成
    var peer1 = context.createMediaStreamDestination();

    merger.connect(peer1); //ココの先頭変えるよ
    localStream = peer1.stream;

}).catch(function (error) {
    // Error
    console.error('mediaDevice.getUserMedia() error:', error);
    return;
});
};

getDeviceList();
getMedia();



///////////Peerオブジェクトの作成
peer = new Peer({
    key: '6cee6718-08d3-4ce7-93a9-237ecd4601bb',
    debug: 3
});
///////////////////////


///////////////open,error,close,disconnectedイベント
peer.on('open', function(){         //発火する
    $('#my-id').text(peer.id);      //Peer IDの自動作成タイム
});

peer.on('error', function(err){
    alert(err.message);
});

peer.on('close', function(){
});

peer.on('disconnected', function(){
});
//////////////////////////


///////////////発信処理・切断処理・着信処理
$('#make-call').submit(function(e){
    e.preventDefault();
    const call = peer.call($('#callto-id').val(), localStream); 
    setupCallEventHandlers(call);
    });

$('#end-call').click(function(){
    existingCall.close();
});

peer.on('call', function(call){
    call.answer(localStream);
    setupCallEventHandlers(call);
});
/////////////////////


//////////Callオブジェクトに必要なイベント
function setupCallEventHandlers(call){
    if (existingCall) {
        existingCall.close();
    };

    existingCall = call;

    call.on('stream', function(stream){
        addVideo(call,stream);
        setupEndCallUI();
        $('#their-id').text(call.remoteId);
    });
    call.on('close', function(){
        removeVideo(call.remoteId);
        setupMakeCallUI();
    });
}
//////////////////////////////////


///////////video要素の再生・削除・ボタン表示
function addVideo(call,stream){
    $('#their-video').get(0).srcObject = stream;
}

function removeVideo(peerId){
    $('#'+peerId).remove();
    alert("つながったようです。");
}

function setupMakeCallUI(){
    $('#make-call').show();
    $('#end-call').hide();
}

function setupEndCallUI() {
    $('#make-call').hide();
    $('#end-call').show();
}
//////////////////////////////////////