const port = process.env.PORT || 3000
const io = require('socket.io')(port);
const arrUserList = [];
console.log("server run on https://localhost:"+port);

io.on('connection', (socket) => {
    console.log(socket.id);
    //dang ki ten
    socket.on('CLIEN_SUBMIT', user => { 
        socket.peerId = user.peerId;

        // kiem tra ten da ton tai hay chua
        const isExist = arrUserList.some(e => e.name === user.name);
        if(isExist){
            return socket.emit("SUBMIT_FAIL");
        }
        else{
            arrUserList.push(user);
        }

        //tra ve danh sach da dang ki cho nguoi vua dang ki
        socket.emit("LIST_ONLINE", arrUserList);

        //update danh sach cho moi nguoi khi co nguoi moi dang ki
        socket.broadcast.emit("UPDATE_NEW_USER", user);

        io.sockets.emit("NEW_USER_JOIN",{name: user.name});

    });
    socket.on('CLIEN_SEND_MESSAGE', user => {
        io.sockets.emit("NEW_MESSAGE",user);
        console.log(user);
    });

    socket.on('disconnect', () => {
        const index = arrUserList.findIndex(user => user.peerId === socket.peerId);
        arrUserList.splice(index, 1);
        io.emit('SOMEONE_LEAVE', socket.peerId);
    });
  });