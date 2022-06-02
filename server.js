var express = require("express");
var app = express();
var axios = require("axios");
var http = require("http").createServer(app);
var socketIO = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

var users = [];
setInterval(() => {
  users.forEach((args) => {
    console.log(users);
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    axios
      .post("https://127.0.0.1/public/api/gestor/newsOrders", {
        auth_token: args.auth_token,
        restaurant_id: args.restaurant_id,
      })
      .then((resp) => {
        socketIO.to(args.socket).emit("messageReceived", resp.data);
      })
      .catch((resp) => {
        console.log(resp);
      });
  });
}, 5000);
socketIO.on("connection", (socket) => {
  socket.on("connected", (args) => {
    users[args.id] = {
      socket: socket.id,
      auth_token: args.auth_token,
      restaurant_id: args.restaurant_id
    };
    socketIO.to(socket.id).emit("messageReceived", "New user connected");
  });
  socket.on("renewRestaurant", (args) => {
    users[args.id].restaurant_id = args.restaurant_id;
  });
  socket.on("removeUser", (args) => {
    users[args.id].remove()
  });
});

http.listen(443, () => {
  console.log("Server started "+443);
});
