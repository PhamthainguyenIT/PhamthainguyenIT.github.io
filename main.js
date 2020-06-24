//init socket connect
const socket = io("https://simplevd-devnguyen.herokuapp.com");
var localId;
let customConfig;

$.ajax({
    url: "https://service.xirsys.com/ice",
    data: {
      ident: "thainguyen",
      secret: "2ab04b80-b5c1-11ea-b5ca-0242ac150003",
      domain: "phamthainguyenit.github.io",
      application: "default",
      room: "default",
      secure: 1
    },
    success: function (data, status) {
      // data.d is where the iceServers object lives
      customConfig = data.d;
      console.log(customConfig);
    },
    async: false
  });

$("#divChat").hide();
$("#divVideo").hide();

// ******************************* socket START ******************************* //
// when server reponse update new user , handle here
socket.on("LIST_ONLINE", arrUserList => {
    $("#divChat").show();
    $("#divSubmit").hide();
    // update all list.
    arrUserList.forEach(user => {
        const { name, peerId } = user;
        $("#ulUser").append(`<li id="${peerId}" class="li-style">${name}</li>`);
    });
    // update new user.
    socket.on("UPDATE_NEW_USER", user => {
        const { name, peerId } = user;
            $("#ulUser").append(`<li id="${peerId}" class="li-style">${name}</li>`);
    });
});



// check name duplicate
socket.on("SUBMIT_FAIL",() => {
    alert("Error : duplicate name");
});

// remove offline user
socket.on("SOMEONE_LEAVE", peerId => {
    $(`#${peerId}`).remove();
});

// ******************************* socket END******************************* //

// ******************************* peerjs START ******************************* //

//init peer connect
const peer = new Peer({
    key: "peerjs", 
    host: "mypeer2206.herokuapp.com", 
    secure: true, 
    port: 443, 
    config: customConfig});
console.log("using sturn server");

// //init peer connect
// const peer = new Peer({key: "peerjs", host: "mypeer2206.herokuapp.com", secure: true, port: 443});
//console.log("using normal server");

peer.on("open", id => {
    $("#peerid").append(id)
    localId = id;
    //Submit Name
    $("#btnSubmit").click(()=> {
        const userName = $("#txtUserName").val();
        if(userName == null || userName == ""){
            alert("Please input your name");
            return false;
        }
        socket.emit("CLIEN_SUBMIT",{name: userName, peerId: id });
    });


});

//caller
$("#btncall").click(()=> {
    const id = $("#remoteId").val();
    openStream()
    .then(stream => {
        playStream("localStream",stream);
        const call = peer.call(id,stream);
        call.on("stream", remoteStream => playStream("remoteStream",remoteStream));
    });
});

//listener
peer.on("call", call => {
    $("#divVideo").show();
    openStream()
    .then(stream =>{
        call.answer(stream);
        playStream("localStream",stream);
        call.on("stream", remoteStream => playStream("remoteStream",remoteStream));
    })
})

// ******************************* peerjs END ******************************* //

function openStream() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream){
    const video =  document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

$("#ulUser").on("click", `li`, function (){
    const id =  $(this).attr('id');
    if(localId===id){
        return false;
    }
    $("#divVideo").show();
    const name =  this.innerHTML;
    document.getElementById("CallingTo").innerHTML = "you calling: " + name
    openStream()
    .then(stream => {
        playStream("localStream",stream);
        const call = peer.call(id,stream);
        call.on("stream", remoteStream => playStream("remoteStream",remoteStream));
    });
    
})

//add event press key enter for btn submit name
var input = document.getElementById("txtUserName");
input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
   event.preventDefault();
   document.getElementById("btnSubmit").click();
  }
});


