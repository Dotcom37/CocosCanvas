import { useEffect } from "react";
import canvasStore from "../store/canvasStore";
export function useKeyboardShortcuts() {
   
  const selectedIds = canvasStore((state) => state.selectedIds);
  const setSelectedIds = canvasStore((state) => state.setSelectedIds);
  const objects = canvasStore((state) => state.objects);
  const clipboard = canvasStore((state) => state.clipboard);
  const setClipboard = canvasStore((state) => state.setClipboard);
  const updateObjects = canvasStore((state) => state.updateObjects);
  const undo = canvasStore((state) => state.undo);
  const redo = canvasStore((state) => state.redo);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // UNDO
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
      }

      // REDO
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        redo();
      }

      // DELETE
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedIds.length > 0
      ) {
        updateObjects((prevObjects) =>
          prevObjects.filter(
            (obj) => !selectedIds.includes(obj.id),
          ),
        );

        setSelectedIds([]);
      }

      // COPY
      if (
        e.ctrlKey &&
        e.key === "c" &&
        selectedIds.length > 0
      ) {
        const selectedObject = objects.find(
          (obj) => obj.id === selectedIds[0],
        );

        if (selectedObject) {
          setClipboard(selectedObject);
        }
      }

      // PASTE
      if (
        e.ctrlKey &&
        e.key === "v" &&
        clipboard !== null
      ) {
        const duplicate = {
          ...clipboard,
          id: Date.now(),
          x: clipboard.x + 20,
          y: clipboard.y + 20,
        };

        updateObjects((prevObjects) => [
          ...prevObjects,
          duplicate,
        ]);

        setSelectedIds([duplicate.id]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedIds,
    objects,
    clipboard,
    updateObjects,
    undo,
    redo,
    setSelectedIds,
    setClipboard,
  ]);
}