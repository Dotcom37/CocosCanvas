import { useEffect } from "react";
import { Transformer } from "react-konva";

function SelectionTransformer({
  selectedObject,
  selectedIds,
  transformerRef,
  shapeRef,
  updateObjects,
}) {
  useEffect(() => {
    if (
      selectedObject &&
      transformerRef.current &&
      shapeRef.current
    ) {
      transformerRef.current.nodes([shapeRef.current]);

      transformerRef.current
        .getLayer()
        .batchDraw();
    }
  }, [selectedIds, selectedObject]);

  if (!selectedObject) {
    return null;
  }

  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled={false}
      boundBoxFunc={(oldBox, newBox) => {
        if (
          newBox.width < 50 ||
          newBox.height < 30
        ) {
          return oldBox;
        }

        return newBox;
      }}
      onTransformEnd={() => {
        const node = shapeRef.current;

        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        if (selectedObject.type === "rectangle") {
          const newWidth =
            node.width() * scaleX;

          const newHeight =
            node.height() * scaleY;

          node.scaleX(1);
          node.scaleY(1);

          updateObjects((prevObjects) =>
            prevObjects.map((item) =>
              item.id === selectedIds[0]
                ? {
                    ...item,
                    width: newWidth,
                    height: newHeight,
                  }
                : item,
            ),
          );
        }

        else if (selectedObject.type === "circle") {
          const newRadius =
            node.radius() *
            Math.max(scaleX, scaleY);

          node.scaleX(1);
          node.scaleY(1);

          updateObjects((prevObjects) =>
            prevObjects.map((item) =>
              item.id === selectedIds[0]
                ? {
                    ...item,
                    radius: newRadius,
                  }
                : item,
            ),
          );
        }

        else if (selectedObject.type === "ellipse") {
          const newRadiusX =
            node.radiusX() * scaleX;

          const newRadiusY =
            node.radiusY() * scaleY;

          node.scaleX(1);
          node.scaleY(1);

          updateObjects((prevObjects) =>
            prevObjects.map((item) =>
              item.id === selectedIds[0]
                ? {
                    ...item,
                    radiusX: newRadiusX,
                    radiusY: newRadiusY,
                  }
                : item,
            ),
          );
        }
      }}
    />
  );
}

export default SelectionTransformer;