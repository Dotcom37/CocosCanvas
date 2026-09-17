
import { useEffect } from "react";
import canvasStore from "../store/canvasStore";

export function useKeyboardShortcuts() {
  const selectedIds = canvasStore(
    (state) => state.selectedIds
  );

  const setSelectedIds = canvasStore(
    (state) => state.setSelectedIds
  );

  const objects = canvasStore(
    (state) => state.objects
  );

  const clipboard = canvasStore(
    (state) => state.clipboard
  );

  const setClipboard = canvasStore(
    (state) => state.setClipboard
  );

  const updateObjects = canvasStore(
    (state) => state.updateObjects
  );

  const undo = canvasStore(
    (state) => state.undo
  );

  const redo = canvasStore(
    (state) => state.redo
  );

  useEffect(() => {
    const handleKeyDown = (e) => {

      // UNDO
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }

      // REDO
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        redo();
        return;
      }

      // DELETE
      if(e.key === "Delete") console.log("Delete key pressed");
      if (
        (e.key === "Delete") &&
        selectedIds.length > 0
      ) {
        e.preventDefault();

        updateObjects((prevObjects) =>
          prevObjects.filter(
            (obj) => !selectedIds.includes(obj.id)
          )
        );

        setSelectedIds([]);
        return;
      }

      // COPY
      if (
        e.ctrlKey &&
        e.key === "c" &&
        selectedIds.length > 0
      ) {
        e.preventDefault();

        const selectedObject = objects.find(
          (obj) => obj.id === selectedIds[0]
        );

        if (selectedObject) {
          setClipboard(selectedObject);
        }

        return;
      }

      // PASTE
      if (
        e.ctrlKey &&
        e.key === "v" &&
        clipboard !== null
      ) {
        e.preventDefault();

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
        return;
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
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

