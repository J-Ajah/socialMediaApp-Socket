const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const addUniqueUsers = (userId, socketId) => {
  // If the new user is not in the list of users that we have then we can add the current user.
  !users.some((user) => user.userId === userId) &&
    users.push({
      userId,
      socketId,
    });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (Id) => {
  return users.find((user) => user.userId === Id);
};

io.on("connection", (socket) => {
  io.emit("welcome", "Welcome to socket server");

  //  Listens to the addUser event emitted from the client adds the new user to our list of users.
  socket.on("addUser", (userId) => {
    console.log("A user is connected");
    addUniqueUsers(userId, socket.id);
    io.emit("getUsers", users);
  });

  // Send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  // Disconnect a user that logs out of the application
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
