import { Stage, Layer } from "react-konva";
import CanvasObject from "./canvasObject";
import SelectionTransformer from "./SelectionTransformer";
import { useState, useRef } from "react";
import canvasStore from "../store/canvasStore";

function Canvas() {
  const objects = canvasStore((state) => state.objects);
  const selectedIds = canvasStore((state) => state.selectedIds);
  const setSelectedIds = canvasStore((state) => state.setSelectedIds);
  
  const editingText = canvasStore((state) => state.editingText);
  const setEditingText = canvasStore((state) => state.setEditingText);

  const tool = canvasStore((state) => state.tool);
  const setTool = canvasStore((state) => state.setTool);

  const updateObjects = canvasStore((state) => state.updateObjects);

  const transformerRef = useRef(null);
  const shapeRef = useRef(null);
  // Temporary state for the HTML input

  const selectedObject = objects.find(
    (obj) => obj.id === selectedIds[0]
  );

  const handleCanvasClick = (e) => {
    const stage = e.target.getStage();

    // Only handle clicks directly on the canvas
    if (e.target !== stage) {
      return;
    }

    const position = stage.getPointerPosition();
     
    if(tool === "line"){
      const newLine = {
        id : Date.now(),
        type : "line",
        points : [position.x, position.y, position.x + 100, position.y + 100],
        stroke : "black",
        strokeWidth : 2,
      } 
      updateObjects((prevObjects) => [
         ...prevObjects,
         newLine
      ])
      setSelectedIds([newLine.id]);
      setTool("select");
    }
    // TEXT
    else if (tool === "text") {
    
      const newText = {
        id: Date.now(),
        type: "text",
        x: position.x,
        y: position.y,
        text: "Text",
        fontSize: 20,
      };

      updateObjects((prevObjects) => [
        ...prevObjects,
        newText,
      ]);

      setSelectedIds([newText.id]);

      // Open input immediately
      setEditingText({
        id: newText.id,
        x: position.x,
        y: position.y,
      });

      setTool("select");
    }

    // RECTANGLE
    else if (tool === "rectangle") {
      const newRectangle = {
        id: Date.now(),
        type: "rectangle",
        x: position.x,
        y: position.y,
        width: 150,
        height: 80,
      };

      updateObjects((prevObjects) => [
        ...prevObjects,
        newRectangle,
      ]);

      setSelectedIds([newRectangle.id]);
      setTool("select");
    }

    // CIRCLE
    else if (tool === "circle") {
      const newCircle = {
        id: Date.now(),
        type: "circle",
        x: position.x,
        y: position.y,
        radius: 50,
      };

      updateObjects((prevObjects) => [
        ...prevObjects,
        newCircle,
      ]);

      setSelectedIds([newCircle.id]);
      setTool("select");
    }

    // ELLIPSE
    else if (tool === "ellipse") {
      const newEllipse = {
        id: Date.now(),
        type: "ellipse",
        x: position.x,
        y: position.y,
        radiusX: 80,
        radiusY: 50,
      };

      updateObjects((prevObjects) => [
        ...prevObjects,
        newEllipse,
      ]);

      setSelectedIds([newEllipse.id]);
      setTool("select");
    }

    // SELECT
    else {
      setSelectedIds([]);
    }
  };

  return (
    <>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleCanvasClick}
      >
        <Layer>
          {objects.map((obj) => (
            <CanvasObject
              key={obj.id}
              obj={obj}
              isSelected={selectedIds.includes(obj.id)}
              shapeRef={
                selectedIds[0] === obj.id
                  ? shapeRef
                  : null
              }
              
            />
          ))}

          <SelectionTransformer
            selectedObject={selectedObject}
            selectedIds={selectedIds}
            transformerRef={transformerRef}
            shapeRef={shapeRef}
            updateObjects={updateObjects}
          />
        </Layer>
      </Stage>

      {/* HTML input used while typing text */}
      {/*  */}
      {editingText && (
        <input
          autoFocus
          value={
            objects.find(
              (obj) => obj.id === editingText.id
            )?.text || ""
          }
          style={{
            position: "absolute",
            left: editingText.x,
            top: editingText.y,
            fontSize: "40px",
            border: "1px solid black",
            outline: "none",
          }}
          onChange={(e) => {
            updateObjects((prevObjects) =>
              prevObjects.map((obj) =>
                obj.id === editingText.id
                  ? {
                      ...obj,
                      text: e.target.value,
                    }
                  : obj
              )
            );
          }}
          onBlur={() => {
            setEditingText(null);
          }}
        />
      )} 
    </>
  );
}

export default Canvas;

