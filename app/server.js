import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import * as Y from "yjs";
import cors from "cors";

import canvasRouter from "./routes/roomRoutes.js";
import authRouter from "./routes/authRoutes.js";
import prisma from "./lib/prisma.js";

const app = express();

const allowedOrigins = [
      "https://cocos-canvas-hvw2kxwtf-dotcom37s-projects.vercel.app",
]

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
  },
});

app.use("/api/canvas", canvasRouter);
app.use("/api/auth", authRouter);


// One Y.Doc for each room
const rooms = new Map();


io.on("connection", (socket) => {
  console.log("USER CONNECTED:", socket.id);


  // =========================
  // JOIN ROOM
  // =========================

  socket.on("join_room", async ({ email, roomId }) => {
    try {
      socket.email = email;
      socket.roomId = roomId;

      // Find user
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        console.log("USER NOT FOUND:", email);
        return;
      }


      // Add user to room_members
      await prisma.roomMember.upsert({
        where: {
          userId_roomId: {
            userId: user.id,
            roomId: roomId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roomId: roomId,
        },
      });


      // Get Yjs document for this room
      let doc = rooms.get(roomId);


      // If this room doesn't have a Y.Doc yet,
      // create one and load saved canvas state.
      if (!doc) {
        doc = new Y.Doc();

        const canvasState = await prisma.canvasState.findUnique({
          where: {
            roomId: roomId,
          },
        });


        if (canvasState) {
          const objects = canvasState.objects;

          console.log("LOADED OBJECTS:", objects);

          doc.getArray("objects").insert(0, objects);
        }

        rooms.set(roomId, doc);
      }


      // Join Socket.IO room
      socket.join(roomId);


      console.log("USER JOINED ROOM");
      console.log("Email:", email);
      console.log("Room ID:", roomId);


      // Send current Yjs state to newly joined user
      const state = Y.encodeStateAsUpdate(doc);

      console.log(
        "SERVER YJS OBJECTS:",
        doc.getArray("objects").toArray()
      );

      socket.emit(
        "yjs-update",
        Array.from(state)
      );

    } catch (error) {
      console.error("Error joining room:", error);
    }
  });


  // =========================
  // YJS UPDATE
  // =========================

  socket.on("yjs-update", (update) => {
    try {
      const roomId = socket.roomId;

      if (!roomId) return;

      const doc = rooms.get(roomId);

      if (!doc) return;


      // Apply update to server's Y.Doc
      Y.applyUpdate(
        doc,
        new Uint8Array(update)
      );


      console.log(
        "AFTER:",
        doc.getArray("objects").toArray()
      );


      // Send update to everyone else in the room
      socket.to(roomId).emit(
        "yjs-update",
        update
      );

    } catch (error) {
      console.error("Error applying Yjs update:", error);
    }
  });


  // =========================
  // DISCONNECT
  // =========================

  socket.on("disconnect", async () => {
    try {
      const { roomId, email } = socket;

      console.log("Disconnected email:", email);
      console.log("Disconnected room:", roomId);

      if (!roomId || !email) return;


      // Find room creator
      const room = await prisma.room.findUnique({
        where: {
          id: roomId,
        },
        select: {
          createdBy: true,
        },
      });

      if (!room) return;


      // Only creator's disconnect saves the canvas
      if (email === room.createdBy) {
        console.log("ROOM CREATOR DISCONNECTED");

        const doc = rooms.get(roomId);

        if (!doc) return;


        const objects = doc
          .getArray("objects")
          .toArray();

        console.log("Saving objects:", objects);


        // Save/update canvas state
        await prisma.canvasState.upsert({
          where: {
            roomId: roomId,
          },

          update: {
            objects: objects,
            updatedAt: new Date(),
          },

          create: {
            roomId: roomId,
            objects: objects,
            updatedAt: new Date(),
          },
        });


        console.log("CANVAS STATE SAVED");
      }

    } catch (error) {
      console.error(
        "Error during disconnect:",
        error
      );
    }
  });
});


httpServer.listen(3000, () => {
  console.log("Server running on port 3000");
});