import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import * as Y from "yjs";

const app = express();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const doc = new Y.Doc();

io.on("connection", (socket) => {
  console.log("USER CONNECTED:", socket.id);

  // Send current server Yjs state to new client
  const state = Y.encodeStateAsUpdate(doc);
  socket.emit("yjs-update", Array.from(state));

  socket.on("yjs-update", (update) => {
    console.log("YJS UPDATE RECEIVED");

    Y.applyUpdate(doc, new Uint8Array(update));

    socket.broadcast.emit("yjs-update", update);
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED:", socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log("Server running on port 3000");
});