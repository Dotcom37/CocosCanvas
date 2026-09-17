
import {
  Rect,
  Circle,
  Ellipse,
  Text,
  Line
} from "react-konva";

import canvasStore from "../store/canvasStore";

function CanvasObject({obj,isSelected,shapeRef}) {
  const selectedIds = canvasStore((state) => state.selectedIds);

  const setSelectedIds = canvasStore((state) => state.setSelectedIds);

  const updateObjects = canvasStore((state) => state.updateObjects);

  const editingText = canvasStore((state) => state.editingText);
  const setEditingText = canvasStore((state) => state.setEditingText);

  const handleClick = (e) => {
    if (e.evt.ctrlKey) {
      setSelectedIds(
        selectedIds.includes(obj.id)
          ? selectedIds.filter((id) => id !== obj.id)
          : [...selectedIds, obj.id]
      );
    } else {
      setSelectedIds([obj.id]);
    }

    console.log("Selected IDs:", obj.id);
  };

  const handleDragEnd = (e) => {
  const node = e.target;

  if (obj.type === "line") {
    const dx = node.x();
    const dy = node.y();

    updateObjects((prevObjects) =>
      prevObjects.map((item) =>
        item.id === obj.id
          ? {
              ...item,
              points: item.points.map((point, i) =>
                i % 2 === 0 ? point + dx : point + dy
              ),
            }
          : item
      )
    );

    node.position({ x: 0, y: 0 });
    return;
   }

  const { x, y } = node.position();

  updateObjects((prevObjects) =>
    prevObjects.map((item) =>
      item.id === obj.id ? { ...item, x, y } : item
    )
  );
};

  const commonProps = {
    ref: isSelected ? shapeRef : null,

    x: obj.x,
    y: obj.y,

    fill:
      obj.type === "rectangle"
        ? "lightblue"
        : obj.type === "circle"
          ? "lightgreen"
          : obj.type === "ellipse"
            ? "lightyellow"
            : "black",

    stroke: isSelected
      ? "#2563eb"
      : undefined,

    strokeWidth: isSelected ? 3 : 0,

    draggable: true,

    onClick: handleClick,

    onDragEnd: handleDragEnd,
  };

  // RECTANGLE
  if (obj.type === "rectangle") {
    return (
      <Rect
        key={obj.id}
        {...commonProps}
        width={obj.width}
        height={obj.height}
      />
    );
  }

  // CIRCLE
  else if (obj.type === "circle") {
    return (
      <Circle
        key={obj.id}
        {...commonProps}
        radius={obj.radius}
      />
    );
  }

  // ELLIPSE
  else if (obj.type === "ellipse") {
    return (
      <Ellipse
        key={obj.id}
        {...commonProps}
        radiusX={obj.radiusX}
        radiusY={obj.radiusY}
      />
    );
  }

  // TEXT
  else if (obj.type === "text") {
    return (
      <Text
        key={obj.id}
        {...commonProps}
        text={obj.text}
        fontSize={obj.fontSize}
        onDblClick={() => {
          setEditingText({
            id: obj.id,
            x: obj.x,
            y: obj.y,
          });
        }}
      />
    );
  }

  else if(obj.type === "line"){
    return (
      <Line
        key={obj.id}
        ref={isSelected ? shapeRef : null}
        points={obj.points}
        stroke={obj.stroke}
        strokeWidth={obj.strokeWidth}
        draggable={true}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        hitStrokeWidth={20}
      />
    );
  }

  return null;
}

export default CanvasObject;

