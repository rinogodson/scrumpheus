import { extend } from "@pixi/react";
import { Assets, Container, Sprite } from "pixi.js";
import { useEffect, useMemo, useState } from "react";
import { generateStation } from "../utils/algo";
import { doc, updateDoc, db } from "../firebase";

extend({ Container, Sprite });

const PART_MAP: Record<string, string> = {
  U: "/parts/MAIN_HULL.svg",
  V: "/parts/SUB_HULL.svg",
  O: "/parts/BIO.svg",
  D: "/parts/BIO_2.svg",
  R: "/parts/BIO_3.svg",
  M: "/parts/HAB.svg",
  N: "/parts/HAB_2.svg",
  Z: "/parts/HAB_3.svg",
  W: "/parts/HAB_4.svg",
};

export const CELL_SIZE = 64;

const SpaceStation = ({ project, onHover, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const [position, setPosition] = useState({
    x: project.x || 0,
    y: project.y || 0,
  });
  const [rotation, setRotation] = useState(project.rotation || 0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: project.x || 0, y: project.y || 0 });
    }
  }, [project.x, project.y, isDragging]);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      setPosition((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
      setRotation((prev) => prev + e.movementX * 0.005);
    }
  };

  const handlePointerUp = async (e) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);

      const projectRef = doc(db, "spaceships", project.id);
      await updateDoc(projectRef, {
        x: position.x,
        y: position.y,
        rotation: rotation,
      });
    }
  };
  ///rendering logic starts here
  useEffect(() => {
    Assets.addBundle("partImages", {
      ...PART_MAP,
      solar: "/parts/SOLAR.svg",
      connector: "/parts/CONNECTOR.svg",
    });
    const loadAssets = async () => {
      await Assets.loadBundle("partImages");
      setIsLoaded(true);
    };

    loadAssets();
  }, []);

  const shipSize = project.goalHours || 1;

  const shipGrid = useMemo(
    () => generateStation(shipSize, project.projectName),
    [shipSize, project.projectName],
  );

  const sprites = useMemo(() => {
    if (!isLoaded) return [];

    const cellsBasket = [];
    const processedSolars = new Set<string>();
    Array.from(shipGrid.entries()).forEach(([key, char]) => {
      const [x, y] = key.split(",").map(Number);

      const centerX = x * CELL_SIZE + CELL_SIZE / 2;
      const centerY = y * CELL_SIZE + CELL_SIZE / 2;

      //VERTI SOLARs
      if (char === "&") {
        if (processedSolars.has(key)) return;
        const isDown = shipGrid.get(`${x},${y + 1}`) === "&";
        const isUp = shipGrid.get(`${x},${y - 1}`) === "&";
        if (!isDown && !isUp) return;
        const topY = isDown ? y : y - 1;
        processedSolars.add(`${x},${topY}`);
        processedSolars.add(`${x},${topY + 1}`);
        const belowCell = shipGrid.get(`${x},${topY + 2}`);
        const facesUp = belowCell && belowCell !== "&" && belowCell !== "$";
        cellsBasket.push(
          <pixiSprite
            key={key}
            texture={Assets.get("solar")}
            x={x * CELL_SIZE + CELL_SIZE / 2}
            y={topY * CELL_SIZE + CELL_SIZE}
            width={CELL_SIZE}
            height={CELL_SIZE * 2}
            anchor={0.5}
            rotation={facesUp ? Math.PI : 0}
          />,
        );
        return;
      }
      //HORI SOLARs
      if (char === "$") {
        if (processedSolars.has(key)) return;
        const isRight = shipGrid.get(`${x + 1},${y}`) === "$";
        const isLeft = shipGrid.get(`${x - 1},${y}`) === "$";
        if (!isRight && !isLeft) return;
        const leftX = isRight ? x : x - 1;
        processedSolars.add(`${leftX},${y}`);
        processedSolars.add(`${leftX + 1},${y}`);
        const rightCell = shipGrid.get(`${leftX + 2},${y}`);
        const facesLeft = rightCell && rightCell !== "&" && rightCell !== "$";
        cellsBasket.push(
          <pixiSprite
            key={key}
            texture={Assets.get("solar")}
            x={leftX * CELL_SIZE + CELL_SIZE}
            y={y * CELL_SIZE + CELL_SIZE / 2}
            width={CELL_SIZE}
            height={CELL_SIZE * 2}
            anchor={0.5}
            rotation={facesLeft ? Math.PI / 2 : -Math.PI / 2}
          />,
        );
        return;
      }
      //normies
      let textureKey = "";
      let rotation = 0;

      if (PART_MAP[char]) {
        textureKey = char;
      } else if (char === "║") {
        textureKey = "connector";
      } else if (char === "═") {
        textureKey = "connector";
        rotation = Math.PI / 2;
      }

      if (textureKey) {
        cellsBasket.push(
          <pixiSprite
            key={key + char}
            texture={Assets.get(textureKey)}
            x={centerX}
            y={centerY}
            width={CELL_SIZE}
            height={CELL_SIZE}
            anchor={0.5}
            rotation={rotation}
          />,
        );
      }
    });
    return cellsBasket;
  }, [shipGrid, isLoaded]);

  return (
    <pixiContainer
      x={position.x}
      y={position.y}
      rotation={rotation}
      interactive={true}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerUpOutside={handlePointerUp}
      onPointerOver={(e) => onHover(project, e)}
      onPointerOut={() => onHover(null, null)}
      onPointerTap={(e) => {
        e.stopPropagation();
        onClick(project);
      }}
      cursor="pointer"
    >
      {sprites}
    </pixiContainer>
  );
};

export default SpaceStation;
