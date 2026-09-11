import { create } from "zustand";

const canvasStore = create((set) => ({
  objects: [
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
  ],
  selectedIds: [],
  setSelectedIds : (ids) => set({ selectedIds: ids }),
  tool : "select",
  setTool : (tool) => set({ tool: tool }),
  clipboard: null,
  setClipboard: (obj) => set({ clipboard: obj }),
  past: [],
  future: [],

  updateObjects: (updater) => {
    set((state) => {
      const newObjects =
        typeof updater === "function"
          ? updater(state.objects)
          : updater;

      return {
        objects: newObjects,
        past: [...state.past, state.objects],
        future: [],
      };
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

export default canvasStore;