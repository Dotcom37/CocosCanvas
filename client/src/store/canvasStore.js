import { create } from "zustand";
import { io } from "socket.io-client";
import * as Y from "yjs";

const socket = io(import.meta.env.VITE_API_URL);

const docs = new Map();

let doc = null
let yObjects = null

const canvasStore = create((set) => ({
  objects: [],
  
  selectedIds: [],
  setSelectedIds: (ids) => set({ selectedIds: ids }),

  tool: "select",
  setTool: (tool) => set({ tool }),

  clipboard: null,
  setClipboard: (obj) => set({ clipboard: obj }),

  past: [],
  future: [],

  editingText: null,
  setEditingText: (newText) => set({ editingText: newText }),

  updateObjects: (updater) => {
    set((state) => {
      const newObjects =
        typeof updater === "function"
          ? updater(state.objects)
          : updater;

      // Update Yjs
      doc.transact(() => {
        yObjects.delete(0, yObjects.length);
        console.log(
          "OBJECT IDS:",
          newObjects.map(obj => obj.id)
        );
        console.log(
          "DUPLICATES:",
          newObjects
            .map(obj => obj.id)
            .filter((id, index, arr) => arr.indexOf(id) !== index)
        );
        yObjects.push(newObjects);
        
      }, "local");

      return {
        objects: newObjects,
        past: [...state.past, state.objects],
        future: [],
      };
    });
  },

  // Called when Yjs data arrives from server
  setObjectsFromYjs: () => {
    set({
      objects: yObjects.toArray(),
    });
  },
  joinRoom: (roomId) =>{
      
      doc = docs.get(roomId);

      if (!doc) {
        doc = new Y.Doc();
        docs.set(roomId, doc);

        doc.on("update", (update, origin) => {
          if (origin === "local") {
            console.log("SENDING YJS UPDATE");
            socket.emit("yjs-update", update);
          }
        });
      }
      yObjects = doc.getArray("objects");

      set({
        objects: yObjects.toArray(),
        past: [],
        future: [],
        selectedIds: [],
      });

      const email = localStorage.getItem("email")
  
      socket.emit("join_room", {
        email,
        roomId
      })
  },

  undo: () => {
    set((state) => {
      if (state.past.length === 0) return state;

      const previous = state.past[state.past.length - 1];

      return {
        objects: previous,
        past: state.past.slice(0, -1),
        future: [state.objects, ...state.future],
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state;

      const next = state.future[0];

      return {
        objects: next,
        past: [...state.past, state.objects],
        future: state.future.slice(1),
      };
    });
  },
}));

// Receive Yjs update from server
socket.on("connect", () => {

  console.log("CONNECTED TO SERVER:", socket.id);

});

socket.on("yjs-update", (update) => {
  console.log("RECEIVED YJS UPDATE");

  Y.applyUpdate(doc, new Uint8Array(update),"remote");
  console.log("YJS OBJECTS:", yObjects.toArray());
  console.log("UPDATING ZUSTAND FROM YJS");
  canvasStore.getState().setObjectsFromYjs();
});


export default canvasStore;