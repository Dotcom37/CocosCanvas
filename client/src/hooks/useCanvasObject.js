import { useState } from "react";

export function useCanvasObjects() {
  const [objects, setObjects] = useState([
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

  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const updateObjects = (updater) => {
    setObjects((prevObjects) => {
      const newObjects =
        typeof updater === "function"
          ? updater(prevObjects)
          : updater;

      setPast((prevPast) => [...prevPast, prevObjects]);
      setFuture([]);

      return newObjects;
    });
  };

  const undo = () => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];

    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [objects, ...prev]);
    setObjects(previous);
  };

  const redo = () => {
    if (future.length === 0) return;

    const next = future[0];

    setFuture((prev) => prev.slice(1));
    setPast((prev) => [...prev, objects]);
    setObjects(next);
  };

  return {
    objects,
    updateObjects,
    undo,
    redo,
  };
}