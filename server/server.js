const server = require('http').createServer()
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

let players = [];

io.on('connection', (socket)=> {
    console.log('A player connected');

    if (players.length < 2) {
        socket.playerId = players.length;
        players.push({ id: socket.playerId, socket });
        socket.emit('playerId', socket.playerId == 0 ? 'X' : 'O')
        io.emit("nextTurn", 'X')
    } else {
        socket.emit('game-full');
        socket.disconnect(true);
    }
    
    socket.on("playReq", index => {
        console.log("server received", index)
        socket.broadcast.emit("playRes", index)
        io.emit("nextTurn", socket.playerId == 0 ? 'O' : 'X')
    })
    socket.on("resetBoardReq", () => {
        console.log("server received resetBoardReq")
        socket.broadcast.emit("resetBoardRes")
        io.emit("resetBoardRes")
    })

    socket.on('disconnect', () => {
        console.log(`Player ${socket.playerId} disconnected`);
        players = players.filter(p => p.id !== socket.playerId);
        
    });
})

server.listen(3000)
