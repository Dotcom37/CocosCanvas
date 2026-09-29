import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import * as Y from "yjs";
import canvasRouter from "./routes/roomRoutes.js";
import authRouter from "./routes/authRoutes.js";
import pool from "./lib/db.js";

import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});


app.use(express.json());

app.use("/api/canvas", canvasRouter);
app.use("/api/auth", authRouter);

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("USER CONNECTED:", socket.id);

  socket.on("join_room", async({ email, roomId }) => {
    socket.email = email;
    socket.roomId = roomId;
    const userResult = await pool.query(`
        SELECT id from users where email=$1
      `,[email])

    const user_id = userResult.rows[0].id;  

    const membered = await pool.query(
      `INSERT INTO ROOM_MEMBERS
       (room_id, user_id)
       values($1, $2) 
       ON CONFLICT (room_id,user_id) DO NOTHING
       returning id
      `,[roomId, user_id]
    )


    let doc = rooms.get(roomId);

    if (!doc) {
      doc = new Y.Doc();

      const result = await pool.query(
      `SELECT objects
       FROM canvas_state
       WHERE room_id = $1`,
      [roomId]
      );

      if (result.rows.length > 0) {
        const objects = result.rows[0].objects;
        console.log(objects.length)
        doc.getArray("objects").insert(0,objects);
      }
      rooms.set(roomId, doc);
    }

    socket.join(roomId);

    console.log("USER JOINED ROOM");
    console.log("Email:", email);
    console.log("Room ID:", roomId);

    // Send this room's current Yjs state
    const state = Y.encodeStateAsUpdate(doc);

    console.log(
        "SERVER YJS OBJECTS:",
        doc.getArray("objects").toArray()
    );
    socket.emit("yjs-update", Array.from(state));
  });

  socket.on("yjs-update", (update) => {
    const roomId = socket.roomId
    const doc = rooms.get(roomId);

    if (!doc) return;
    
    Y.applyUpdate(doc, new Uint8Array(update));

    console.log("AFTER:", doc.getArray("objects").toArray());
    socket.to(roomId).emit("yjs-update", update);
  });

  socket.on("disconnect", async () => {
    const { roomId, email } = socket;

    console.log("Disconnected email:", email);
    console.log("Disconnected room:", roomId);

    if (!roomId || !email) return;

    const result = await pool.query(
      `SELECT created_by
       FROM rooms
       WHERE id = $1`,
      [roomId],
    );

    if (result.rows.length === 0) return;

    const creatorEmail = result.rows[0].created_by;

    if (email === creatorEmail) {
      console.log("ROOM CREATOR DISCONNECTED");

      const doc = rooms.get(roomId);

      if (!doc) return;

      const objects = doc.getArray("objects").toArray();

      console.log("Saving objects:", objects);

      await pool.query(
        `INSERT INTO canvas_state (room_id, objects, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (room_id)
         DO UPDATE SET
           objects = EXCLUDED.objects,
           updated_at = NOW()`,
        [roomId, JSON.stringify(objects)],
      );

      console.log("CANVAS STATE SAVED");
    }
  });
});

httpServer.listen(3000, () => {
  console.log("Server running on port 3000");
});
