function createPRNG(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
  }

  return function () {
    hash = Math.imul(hash ^ (hash >>> 15), 1597334677);
    hash = Math.imul(hash ^ (hash >>> 15), 3812015801);
    return ((hash ^ (hash >>> 15)) >>> 0) / 4294967296;
  };
}

type Coordinate = { x: number; y: number };
//the x and y here is the x and y position of the component where the socket is
type Socket = Coordinate & { dx: number; dy: number; connChar: string };

const DIRECTIONS = [
  { dx: 0, dy: -1, connChar: "║" }, // Up
  { dx: 0, dy: 1, connChar: "║" }, // Down
  { dx: -1, dy: 0, connChar: "═" }, // Left
  { dx: 1, dy: 0, connChar: "═" }, // Right
];

const setCell = (
  x: number,
  y: number,
  char: string,
  grid: Map<string, string>,
) => grid.set(`${x},${y}`, char);
const getCell = (x: number, y: number, grid: Map<string, string>) =>
  grid.get(`${x},${y}`);

function generateStation(size: number, seed: string) {
  const STANDARD_PARTS = ["V", "O", "D", "M", "N"];
  const grid = new Map<string, string>();

  const random = createPRNG(seed);

  setCell(0, 0, "U", grid);

  //the x and y here is the x and y position of the component where the socket is
  const openSockets: Socket[] = DIRECTIONS.map((dir) => ({
    x: 0,
    y: 0,
    dx: dir.dx,
    dy: dir.dy,
    connChar: dir.connChar,
  }));

  const totalExtraParts = Math.floor(size / 2);
  let partsAdded = 0;

  while (partsAdded < totalExtraParts && openSockets.length > 0) {
    //for anyone reading this code, taking the power of random() is to avoid making the spaceship very longyy... this method will respect the central hull
    const socketIndex = Math.floor(random() * random() * openSockets.length);
    const socket = openSockets.splice(socketIndex, 1)[0];

    const connX = socket.x + socket.dx;
    const connY = socket.y + socket.dy;
    const compX = socket.x + socket.dx * 2;
    const compY = socket.y + socket.dy * 2;

    if (getCell(compX, compY, grid)) continue;
    //solar panel logic here, the solar panel is the impostor here, it takes two space
    const isSolarPanel = partsAdded >= 1 && random() > 0.7;

    if (isSolarPanel) {
      if (getCell(connX, connY, grid) || getCell(compX, compY, grid)) continue;

      if (socket.dx !== 0) {
        //horiz
        setCell(connX, connY, "$", grid);
        setCell(compX, compY, "$", grid);
      } else {
        //vertical
        setCell(connX, connY, "&", grid);
        setCell(compX, compY, "&", grid);
      }
      partsAdded++;
    } else {
      //if not an impostor
      setCell(connX, connY, socket.connChar, grid);
      const randomPart =
        STANDARD_PARTS[Math.floor(random() * STANDARD_PARTS.length)];
      setCell(compX, compY, randomPart, grid);

      DIRECTIONS.forEach((dir) => {
        if (dir.dx !== -socket.dx || dir.dy !== -socket.dy) {
          openSockets.push({
            x: compX,
            y: compY,
            dx: dir.dx,
            dy: dir.dy,
            connChar: dir.connChar,
          });
        }
      });
      partsAdded++;
    }
  }
  return grid;
}

//DEBUG
function printStation(size: number, seed: string, grid: Map<string, string>) {
  let minX = 0,
    maxX = 0,
    minY = 0,
    maxY = 0;

  for (const key of grid.keys()) {
    const [xStr, yStr] = key.split(",");
    const x = parseInt(xStr);
    const y = parseInt(yStr);

    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  console.log("\n=== OUR BEAUTIFUL SPACE STATION ===\n");
  console.log(`\n=== size: ${size} | seed: ${seed} ===\n`);
  for (let y = minY; y <= maxY; y++) {
    let rowStr = "";
    for (let x = minX; x <= maxX; x++) {
      rowStr += getCell(x, y, grid) || " ";
    }
    console.log(rowStr);
  }
  console.log("\n=== FINISH ===\n");
}

const size = 20;
const seed = "stardance";
const grid = generateStation(size, seed);
printStation(size, seed, grid);
