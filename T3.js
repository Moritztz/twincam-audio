'use strict';


//webRTC取得準備
let localStream = null;
let peer = null;
let existingCall = null;
//let peerConnection = null;

//audio処理用
window.AudioContext = window.AudioContext || window.webkitAudioContext; 
navigator.mediaDevices.getUserMedia(
    { video : false , audio : true })

.then(function (stream){

    //AudioContextを作成
    var context  = new AudioContext();

    //sourceの作成
    var source = context.createMediaStreamSource(stream);

    //panner の作成
    var panner = context.createStereoPanner();
    source.connect(panner);
    panner.pan.value = 0;

    //peer1の作成
    var peer1 = context.createMediaStreamDestination();

    panner.connect(peer1); //ココの先頭変えるよ
    localStream = peer1.stream;

}).catch(function (error) {
    // Error
    console.error('mediaDevice.getUserMedia() error:', error);
    return;
 });

///////////Peerオブジェクトの作成
peer = new Peer({
    key: '9373b614-604f-4fd5-b96a-919b20a7c24e',
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