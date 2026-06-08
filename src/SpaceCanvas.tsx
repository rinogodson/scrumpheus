import { useState, useMemo } from "react";
import { Application, extend } from "@pixi/react";
import { Container } from "pixi.js";
import SpaceStation, { CELL_SIZE } from "./Components/SpaceStation";
import { generateStation } from "./utils/algo";

extend({ Container });

export default function SpaceCanvas({ projects }) {
  const [cameraPos, setCameraPos] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
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

  const shipDimensions = useMemo(
    () =>
      projects.map((project) => {
        const shipSize = project.goalHours || 1;
        const grid = generateStation(shipSize, project.projectName);
        let minX = 0,
          maxX = 0,
          minY = 0,
          maxY = 0;
        for (const key of grid.keys()) {
          const [x, y] = key.split(",").map(Number);
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
        return {
          width: (maxX - minX + 1) * CELL_SIZE,
          height: (maxY - minY + 1) * CELL_SIZE,
        };
      }),
    [projects],
  );

  const padding = 0;

  return (
    <div
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <Application resizeTo={window} backgroundAlpha={0} autoStart sharedTicker>
        <pixiContainer x={cameraPos.x} y={cameraPos.y}>
          {projects.map((project, index) => {
            const { width, height } = shipDimensions[index];
            const spacingX = index * (width + padding);
            const spacingY = index % 2 === 0 ? height : -height;

            return (
              <SpaceStation
                key={project.id}
                project={project}
                offsetX={spacingX}
                offsetY={spacingY}
              />
            );
          })}
        </pixiContainer>
      </Application>
    </div>
  );
}
