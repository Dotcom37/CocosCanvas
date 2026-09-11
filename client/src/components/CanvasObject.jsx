
import {
  Rect,
  Circle,
  Ellipse,
  Text,
} from "react-konva";

import canvasStore from "../store/canvasStore";

function CanvasObject({obj,isSelected,shapeRef,setEditingText}) {
  const selectedIds = canvasStore((state) => state.selectedIds);

  const setSelectedIds = canvasStore((state) => state.setSelectedIds);

  const updateObjects = canvasStore((state) => state.updateObjects);

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
    const { x, y } = e.target.position();

    updateObjects((prevObjects) =>
      prevObjects.map((item) =>
        item.id === obj.id
          ? { ...item, x, y }
          : item
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
  if (obj.type === "circle") {
    return (
      <Circle
        key={obj.id}
        {...commonProps}
        radius={obj.radius}
      />
    );
  }

  // ELLIPSE
  if (obj.type === "ellipse") {
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
  if (obj.type === "text") {
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

  return null;
}

export default CanvasObject;

