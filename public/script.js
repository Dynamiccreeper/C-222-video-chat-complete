const socket = io("/");

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3030",
});

const user = prompt("Enter your name");
const myVideo=document.createElement("video")
myVideo.muted=true
var mystream

navigator.mediaDevices.getUserMedia({audio:true,video:true}).then((stream)=>{
    mystream=stream;
    addVideoStream(myVideo,stream)
    socket.on("user-connected",(userId)=>{
        connectToNewUser(userId,stream)
    })
    peer.on("call",(call)=>{
        call.answer(stream)
        const video=document.createElement("video")
        call.on("stream",(uservideostream)=>{
            addVideoStream(video,uservideostream)
        })
    })
})
function connectToNewUser(userId,stream){
    const call=peer.call(userId,stream)
    const video=document.createElement("video")
    call.on("stream",(uservideostream)=>{
        addVideoStream(video,uservideostream)
    })
}
function addVideoStream(video,stream){
    video.srcObject=stream
    video.addEventListener("loadMetaData",()=>{
        video.play()
        $("#video_grid").append(video)
    })
}

$(function () {
    $("#show_chat").click(function () {
        $(".left-window").css("display", "none")
        $(".right-window").css("display", "block")
        $(".header_back").css("display", "block")
    })
    $(".header_back").click(function () {
        $(".left-window").css("display", "block")
        $(".right-window").css("display", "none")
        $(".header_back").css("display", "none")
    })

    $("#send").click(function () {
        if ($("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })

    $("#chat_message").keydown(function (e) {
        if (e.key == "Enter" && $("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })
    $("#mute_button").click(function(){
        const enable=mystream.getAudioTracks()[0].enabled
        if(enable){
            mystream.getAudioTracks()[0].enabled=false
            html=`<i class="fas fa-microphone-slash"></i>`
            $("#mute_button").toggleClass("background_red")
            $("#mute_button").html(html)
        }
        else{
            mystream.getAudioTracks()[0].enabled=true
            html=`<i class="fas fa-microphone"></i>`
            $("#mute_button").toggleClass("background_red")
            $("#mute_button").html(html)
        }
    })
    $("#stop_video").click(function(){
        const enable=mystream.getVideoTracks()[0].enabled
        if(enable){
            mystream.getVideoTracks()[0].enabled=false
            html=`<i class="fas fa-video-slash"></i>`
            $("#stop_video").toggleClass("background_red")
            $("#stop_video").html(html)
        }
        else{
            mystream.getVideoTracks()[0].enabled=true
            html=`<i class="fas fa-video"></i>`
            $("#stop_video").toggleClass("background_red")
            $("#stop_video").html(html)
        }
    })
    $("#inv_button").click(function(){
        const to=prompt("enter the email address")
        var data={
            url:window.location.href,
            to:to
        }
        $.ajax({
            url:"/send-mail",
            type:"post",
            data:JSON.stringify(data),
            contentType:"application /json",
            success:function(result){
                alert("invite has been sent")
            },
            error:function(result){
                console.log(result.responseJson)
            }
        })
    })
})

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

socket.on("createMessage", (message,userName) => {
    $(".messages").append(`
        <div class="message">
        <b><i class="far fa-user-circle"></i><span>${userName=user?"me:":userName}</span></b>
            <span>${message}</span>
        </div>
    `)
});