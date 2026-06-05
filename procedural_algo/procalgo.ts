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

const setCell = (x: number, y: number, char: string) =>
  grid.set(`${x},${y}`, char);
const getCell = (x: number, y: number) => grid.get(`${x},${y}`);

const STANDARD_PARTS = ["V", "O", "D", "M", "N"];

const grid = new Map<string, string>();

function generateStation(size: number, seed: string) {
  grid.clear();
  const random = createPRNG(seed);

  setCell(0, 0, "U");

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
    const socketIndex = Math.floor(random() * openSockets.length);
    const socket = openSockets.splice(socketIndex, 1)[0];

    const connX = socket.x + socket.dx;
    const connY = socket.y + socket.dy;
    const compX = socket.x + socket.dx * 2;
    const compY = socket.y + socket.dy * 2;

    if (getCell(compX, compY)) continue;
    //solar panel logic here, the solar panel is the impostor here, it takes two space
    const isSolarPanel = partsAdded >= 1 && random() > 0.7;

    if (isSolarPanel) {
      const extraX = compX + socket.dx;
      const extraY = compY + socket.dy;

      if (getCell(extraX, extraY)) continue;

      setCell(connX, connY, socket.connChar);

      if (socket.dx !== 0) {
        //horiz
        setCell(compX, compY, "=");
        setCell(extraX, extraY, "=");
      } else {
        //vertical
        setCell(compX, compY, "H");
        setCell(extraX, extraY, "H");
      }
      partsAdded++;
    } else {
      //if not an impostor
      setCell(connX, connY, socket.connChar);
      const randomPart =
        STANDARD_PARTS[Math.floor(random() * STANDARD_PARTS.length)];
      setCell(compX, compY, randomPart);

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
}

//DEBUG
function printStation(size: number, seed: string) {
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
      rowStr += getCell(x, y) || " ";
    }
    console.log(rowStr);
  }
  console.log("\n=== FINISH ===\n");
}

const size = 20;
const seed = "stardance";
generateStation(size, seed);
printStation(size, seed);

generateStation(size, seed);
printStation(size, seed);
