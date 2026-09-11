import { useState } from "react";

import Toolbar from "./components/toolbar";
import Canvas from "./components/canvas";


function App() {
  console.log("Rendering App component");
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "white",
      }}
    >
      <Toolbar/>

      <Canvas/>
    </div>
  );
}

export default App;