import { useState } from "react";
import { Application, extend } from "@pixi/react";
import { Container } from "pixi.js";
import SpaceStation from "./Components/SpaceStation";
// import { generateStation } from "./utils/algo";

extend({ Container });

export default function SpaceCanvas({ projects }) {
  const [cameraPos, setCameraPos] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);
  const handlePointerMove = (e) => {
    if (isDragging) {
      setCameraPos((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    }
  };
  const handleWheel = (e) => {
    const zoomSpeed = 0.05;
    const direction = e.deltaY < 0 ? 1 : -1;
    setScale((prev) =>
      Math.max(0.2, Math.min(prev + direction * zoomSpeed, 3)),
    );
  };
  // const shipDimensions = useMemo(
  //   () =>
  //     projects.map((project) => {
  //       const shipSize = project.goalHours || 1;
  //       const grid = generateStation(shipSize, project.projectName);
  //       let minX = 0,
  //         maxX = 0,
  //         minY = 0,
  //         maxY = 0;
  //       for (const key of grid.keys()) {
  //         const [x, y] = key.split(",").map(Number);
  //         if (x < minX) minX = x;
  //         if (x > maxX) maxX = x;
  //         if (y < minY) minY = y;
  //         if (y > maxY) maxY = y;
  //       }
  //       return {
  //         width: (maxX - minX + 1) * CELL_SIZE,
  //         height: (maxY - minY + 1) * CELL_SIZE,
  //       };
  //     }),
  //   [projects],
  // );

  return (
    <div
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
      onWheel={handleWheel}
    >
      <Application resizeTo={window} backgroundAlpha={0} autoStart sharedTicker>
        <pixiContainer x={cameraPos.x} y={cameraPos.y} scale={scale}>
          {projects.map((project) => {
            return (
              <SpaceStation
                key={project.id}
                project={project}
                onClick={() => {}}
                onHover={() => {}}
              />
            );
          })}
        </pixiContainer>
      </Application>
    </div>
  );
}
