const { Server } = require("socket.io");

try {
    const io = new Server(8000, {
        cors: true,
    });

    const nameToSocketIdMap = new Map();
    const socketIdToNameMap = new Map();

    io.on("connection", (socket) => {
        console.log("socket connected", socket.id);

        // Handle "room:join" event
        socket.on("room:join", ({ name, roomId }) => {
            console.log(`User ${name} joined room ${roomId}`);
            const userName = name;
            const userRoomId = roomId;

            // Corrected: Join the socket to the room before emitting events
            socket.join(userRoomId);

            nameToSocketIdMap.set(userName, socket.id);
            socketIdToNameMap.set(socket.id, userName);

            // Emit events after joining the room
            io.to(userRoomId).emit("user:joined", { username: userName, id: socket.id });
            io.to(socket.id).emit("room:join", { name, roomId });
        });

        socket.on('user:call', ({ to, offer }) => {
            io.to(to).emit('incoming:call', { from: socket.id, offer });
        });

        socket.on('call:accepted', ({ to, ans }) => {
            io.to(to).emit('call:accepted', { from: socket.id, ans });
        });
        socket.on('peer:nego:needed', ({ to, offer }) => {
            io.to(to).emit('peer:nego:needed', { from: socket.id, offer});
        });

        socket.on('peer:nego:done', ({ to, ans}) => {
            io.to(to).emit('peer:nego:final', { from: socket.id, ans});
        });


    });
} catch (error) {
    console.error("Error setting up Socket.IO server:", error);
}
