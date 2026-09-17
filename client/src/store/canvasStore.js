import { create } from "zustand";
import { io } from "socket.io-client";
import * as Y from "yjs";

const socket = io("http://localhost:3000");

// Yjs document for this canvas
const doc = new Y.Doc();

// Shared array containing canvas objects
const yObjects = doc.getArray("objects");
yObjects.push([
  {
    id: 1,
    type: "rectangle",
    x: 100,
    y: 100,
    width: 200,
    height: 100,
  },
  {
    id: 2,
    type: "rectangle",
    x: 400,
    y: 200,
    width: 200,
    height: 100,
  },
]);

// Send only Yjs updates through Socket.IO
doc.on("update", (update, origin) => {
  if (origin === "local") {
    console.log("SENDING YJS UPDATE");
    socket.emit("yjs-update", update);
  }
});

const canvasStore = create((set) => ({
  objects: yObjects.toArray(),
  
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
  canvasStore.getState().setObjectsFromYjs();
});


export default canvasStore;