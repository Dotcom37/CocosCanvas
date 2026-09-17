import canvasStore from "../store/canvasStore";

const TOOLS = [
  { id: "select", label: "Select", icon: <SelectIcon /> },
  { id: "rectangle", label: "Rectangle", icon: <RectangleIcon /> },
  { id: "circle", label: "Circle", icon: <CircleIcon /> },
  { id: "ellipse", label: "Ellipse", icon: <EllipseIcon /> },
  { id: "text", label: "Text", icon: <TextIcon /> },
  { id: "line", label: "Line", icon: <LineIcon /> },
];

function Toolbar() {
  const tool = canvasStore((state) => state.tool);
  const setTool = canvasStore((state) => state.setTool);

  return (
    <div style={styles.panel}>
      {TOOLS.map(({ id, label, icon }) => {
        const active = tool === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTool(id)}
            aria-pressed={active}
            aria-label={label}
            title={label}
            style={{
              ...styles.button,
              ...(active ? styles.buttonActive : null),
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = "#f1f2f4";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = "transparent";
            }}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  panel: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: 6,
    background: "#ffffff",
    borderRadius: 12,
    boxShadow: "0 1px 2px rgba(16,24,40,0.06), 0 4px 12px rgba(16,24,40,0.10)",
    border: "1px solid #e5e7eb",
  },
  button: {
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: 8,
    background: "transparent",
    color: "#374151",
    cursor: "pointer",
    transition: "background 120ms ease, color 120ms ease",
  },
  buttonActive: {
    background: "#eef2ff",
    color: "#4338ca",
  },
};

// --- Icons (16x16 stroke icons, no external deps) ---

function iconProps() {
  return {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
}

function SelectIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M4 4l6.5 16 2-6.5L19 11 4 4z" />
    </svg>
  );
}

function RectangleIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="4" y="6" width="16" height="12" rx="1.5" />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function EllipseIcon() {
  return (
    <svg {...iconProps()}>
      <ellipse cx="12" cy="12" rx="9" ry="6" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M5 6h14M12 6v12" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M5 19L19 5" />
    </svg>
  );
}

export default Toolbar;