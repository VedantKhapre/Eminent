interface Props {
  color?: string;
  corner?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  size?: string;
  gridSize?: string;
  opacity?: number;
}

export default function GridPattern({
  color = "white",
  corner = "bottom-left",
  size = "800px",
  gridSize = "40px",
  opacity = 0.15,
}: Props) {
  const positions = {
    "bottom-left": { bottom: 0, left: 0 },
    "bottom-right": { bottom: 0, right: 0 },
    "top-left": { top: 0, left: 0 },
    "top-right": { top: 0, right: 0 },
  };
  const dirs = {
    "bottom-left": ["to left", "to bottom"],
    "bottom-right": ["to right", "to bottom"],
    "top-left": ["to left", "to top"],
    "top-right": ["to right", "to top"],
  };
  const [dirX, dirY] = dirs[corner];
  const mask = `radial-gradient(ellipse at ${corner.replace("-", " ")}, black 5%, transparent 60%)`;

  return (
    <div
      style={{
        position: "absolute",
        ...positions[corner],
        width: size,
        height: size,
        backgroundImage: `linear-gradient(${dirX}, ${color} 1px, transparent 1px), linear-gradient(${dirY}, ${color} 1px, transparent 1px)`,
        backgroundSize: `${gridSize} ${gridSize}`,
        WebkitMaskImage: mask,
        maskImage: mask,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}
