import canvasStore from "../store/canvasStore";

function Toolbar() {
  console.log("Rendering Toolbar component");
  const setTool = canvasStore((state) => state.setTool);

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button onClick={() => setTool("select")}>
        Select
      </button>

      <button onClick={() => setTool("rectangle")}>
        Rectangle
      </button>

      <button onClick={() => setTool("circle")}>
        Circle
      </button>

      <button onClick={() => setTool("ellipse")}>
        Ellipse
      </button>

      <button onClick={() => setTool("text")}>
        Text
      </button>

      
    </div>
  );
}

export default Toolbar;