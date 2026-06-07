import { useState } from "react";
import { Application, extend } from "@pixi/react";
import { Container } from "pixi.js";
import SpaceStation from "./Components/SpaceStation";

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
            const spacingX = index * 300;
            const spacingY = index % 2 === 0 ? 200 : -200;

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
