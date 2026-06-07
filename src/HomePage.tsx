import { DoorOpen, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  db,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
} from "./firebase";
import { useEffect, useRef, useState, useMemo } from "react";
import { generateStation } from "./utils/algo";
// import { Application } from "@pixi/react";
import SpaceCanvas from "./SpaceCanvas";

const HomePage = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("hackatime_access");
    localStorage.removeItem("hackatime_refresh");

    navigate("/");
  };
  const [hackatimeUser, setHackatimeUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);

  //input stuff
  const [projectName, setProjectName] = useState("");
  const [goalHours, setGoalHours] = useState("");

  const parentRef = useRef(null);

  const [shipSeed, setShipSeed] = useState("rino");
  const [shipScale, setShipScale] = useState(0);
  const [shipGrid, setShipGrid] = useState<Map<string, string> | null>(null);

  const handleGenerateShip = () => {
    if (!shipSeed) return;
    const grid = generateStation(shipScale, shipSeed);
    setShipGrid(grid);
  };

  const renderedShip = useMemo(() => {
    if (!shipGrid) return null;

    //this is the asset shop babies, here you get assets, if any change on algo, just update it here too
    //future modular baby when user customization is gonna be there...
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

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    const parsedGoodBabyGrid = Array.from(shipGrid.entries()).map(
      ([key, char]) => {
        const [x, y] = key.split(",").map(Number);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        return { key, x, y, char };
      },
    );
    const CELL_SIZE = 64;
    const cols = maxX - minX + 1;
    const rows = maxY - minY + 1;

    const cells_basket: React.ReactNode[] = [];
    const processedSolars = new Set<string>();

    parsedGoodBabyGrid.forEach(({ key, x, y, char }) => {
      if (char === "&") {
        if (processedSolars.has(key)) return;
        const isDown = shipGrid.get(`${x},${y + 1}`) === "&";
        const isUp = shipGrid.get(`${x},${y - 1}`) === "&";
        if (!isDown && !isUp) return; //bad algo gave bad stuff... no broken solars
        const topY = isDown ? y : y - 1;

        processedSolars.add(`${x},${topY}`);
        processedSolars.add(`${x},${topY + 1}`);
        const belowCell = shipGrid.get(`${x},${topY + 2}`);
        const facesUp = belowCell && belowCell !== "&" && belowCell !== "$";

        cells_basket.push(
          <img
            key={key}
            src="/parts/SOLAR.svg"
            alt="solar-v"
            draggable={false}
            style={{
              position: "absolute",
              left: `${(x - minX) * CELL_SIZE}px`,
              top: `${(topY - minY) * CELL_SIZE}px`,
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE * 2}px`,
              transform: facesUp ? `rotate(180deg)` : undefined,
              userSelect: "none",
            }}
          />,
        );
        return;
      }

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

        cells_basket.push(
          <img
            key={key}
            src="/parts/SOLAR.svg"
            alt="solar-h"
            draggable={false}
            style={{
              position: "absolute",
              left: `${(leftX - minX) * CELL_SIZE + CELL_SIZE / 2}px`,
              top: `${(y - minY) * CELL_SIZE - CELL_SIZE / 2}px`,
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE * 2}px`,
              transform: facesLeft ? `rotate(90deg)` : `rotate(-90deg)`,
              userSelect: "none",
            }}
          />,
        );
        return;
      }

      let src = "";
      let rotation = 0;

      if (PART_MAP[char]) {
        src = PART_MAP[char];
      } else if (char === "║") {
        src = "/parts/CONNECTOR.svg";
      } else if (char === "═") {
        src = "/parts/CONNECTOR.svg";
        rotation = 90;
      }

      if (!src) return;

      if (src) {
        cells_basket.push(
          <img
            key={key + char}
            src={src}
            alt={char}
            draggable={false}
            style={{
              position: "absolute",
              left: `${(x - minX) * CELL_SIZE}px`,
              top: `${(y - minY) * CELL_SIZE}px`,
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`,
              transform: rotation ? `rotate(${rotation}deg)` : undefined,
              userSelect: "none",
            }}
          />,
        );
      }
    });

    return (
      <div
        style={{
          position: "relative",
          width: `${cols * CELL_SIZE}px`,
          height: `${rows * CELL_SIZE}px`,
        }}
      >
        {cells_basket}
      </div>
    );
  }, [shipGrid]);

  useEffect(() => {
    const token = localStorage.getItem("hackatime_access");
    if (!token || token === "undefined") return;

    const apiUrl = "https://hackatime.hackclub.com/api/v1/authenticated/me";

    let unsubscribe = () => {};

    fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Server responded with ${res.status}: ${errorText}`);
        }
        return res.json();
      })
      .then(async (user) => {
        console.log("User Data:", user);
        setHackatimeUser(user);

        const userRef = doc(db, "users", String(user.id));
        await setDoc(
          userRef,
          {
            username: user.github_username || "",
            photo: user.photo || "",
            lastSeen: new Date().toISOString(),
          },
          { merge: true },
        );

        const q = query(
          collection(db, "spaceships"),
          where("userId", "==", user.id),
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedProjects = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProjects(loadedProjects);
          console.log("Loaded projects:", loadedProjects);
        });
      })
      .catch((err) => {
        console.error("Fetch Error:", err.message);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleCreateProjectModal = () => {
    setShowForm(true);
    setProjectName("");
    setGoalHours("");
  };

  const handleAddProject = async (e) => {
    setShowForm(false);
    e.preventDefault();
    if (!projectName || !goalHours || !hackatimeUser) return;

    await addDoc(collection(db, "spaceships"), {
      userId: hackatimeUser.id,
      projectName: projectName,
      goalHours: Number(goalHours),
      currentHours: 0,
      status: "active",
    });

    //form clearence here:
    setProjectName("");
    setGoalHours("");
  };

  if (!hackatimeUser)
    return <h2 style={{ color: "white" }}>Loading your space console...</h2>;

  return (
    <div className=" w-screen h-screen flex justify-start flex-col p-7 gap-7 items-center">
      {showForm && (
        <div
          onClick={() => {
            setShowForm(false);
          }}
          className="z-1000 backdrop-saturate-0 absolute w-full h-full top-0 left-0 bg-black/0 flex justify-center items-center"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAddProject}
            className="bg-[#FEF3E0]/90 border-2 border-[#FEF3E0] flex flex-col gap-5 p-5 justify-center items-center text-lg rounded-3xl"
          >
            <p className="text-2xl font-bold text-start w-full flex gap-3 justify-start items-center">
              <Rocket className="w-10  aspect-square inline" />
              Create a Station
            </p>
            <input
              type="text"
              placeholder="Project Name (e.g. scrumpheus)"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="px-3 py-2 rounded-lg focus:border-[#E67C41] text-black w-full bg-white border-black border-3 outline-none"
            />
            <input
              type="number"
              placeholder="Goal (in Hours)"
              value={goalHours}
              onChange={(e) => setGoalHours(e.target.value)}
              className="px-3 focus:border-[#E67C41] py-2 rounded-lg text-black w-full bg-white border-black border-3 outline-none"
            />
            <div className="flex gap-5 w-full">
              <button
                onClick={() => {
                  setShowForm(false);
                }}
                type="submit"
                className="w-full bg-[#D8A657] px-4 py-2 text-amber-950 text-lg rounded-lg border-amber-950 border-2 active:brightness-130 hover:brightness-110 transition duration-100 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full bg-[#D8A657] px-4 py-2 text-amber-950 text-lg rounded-lg border-amber-950 border-2 active:brightness-130 hover:brightness-110 transition duration-100 font-bold"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="w-full flex justify-between items-center">
        <img src="/Scrumpheus.svg" alt="Scrumpheus" />
        <button
          onClick={() => handleLogout()}
          className="w-fit bg-red-600 text-white px-4 gap-2 py-2 rounded-full active:bg-red-700 transition duration-100 flex justify-center items-center font-bold"
        >
          <DoorOpen className="w-5 h-5" />
          Log Out
        </button>
      </div>
      <div
        ref={parentRef}
        className="h-[90%] w-full rounded-[3rem] bg-black shadow-[0_1.5px_0_2px_rgba(255,255,255,0.1),0_-1px_0_2px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        <SpaceCanvas projects={projects} />
        {/* <Application */}
        {/*   autoStart */}
        {/*   sharedTicker */}
        {/*   resizeTo={parentRef} */}
        {/*   backgroundAlpha={0.1} */}
        {/*   backgroundColor={0x000000} */}
        {/* /> */}
        {/* THE DIVIDE -------- */}
        {/* {projects.map( */}
        {/*   (project: { */}
        {/*     id: number; */}
        {/*     currentHours: number; */}
        {/*     goalHours: number; */}
        {/*     projectName: string; */}
        {/*     status: string; */}
        {/*   }) => ( */}
        {/*     <div */}
        {/*       key={project.id} */}
        {/*       className="z-10 bg-white/5 backdrop-blur-md border border-white/20 p-5 rounded-4xl text-white w-64 h-fit flex flex-col gap-2.5 shadow-xl" */}
        {/*     > */}
        {/*       <h3 className="text-xl font-bold">{project.projectName}</h3> */}
        {/*       <div */}
        {/*         style={{ */}
        {/*           backgroundColor: */}
        {/*             project.status == "active" ? "#D8A657" : "red", */}
        {/*         }} */}
        {/*         className="relative w-full h-fit flex flex-col rounded-2xl overflow-hidden py-3 justify-center items-center font-black" */}
        {/*       > */}
        {/*         <div */}
        {/*           style={{ */}
        {/*             width: */}
        {/*               String( */}
        {/*                 (project.currentHours / project.goalHours) * 100, */}
        {/*               ) + "%", */}
        {/*           }} */}
        {/*           className="absolute h-full bg-white/30 left-0" */}
        {/*         ></div> */}
        {/*         <p className="text-shadow-xs text-sm uppercase"> */}
        {/*           {project.status} */}
        {/*         </p> */}
        {/*         <p className="text-shadow-2xs"> */}
        {/*           {project.currentHours}/{project.goalHours} hours */}
        {/*         </p> */}
        {/*       </div> */}
        {/*     </div> */}
        {/*   ), */}
        {/* )} */}

        {/* THE TESTING PART HERE */}
        {/* <div className="w-full h-full flex justify-center items-center overflow-auto"> */}
        {/*   {renderedShip} */}
        {/* </div> */}
      </div>

      {/* THE TESTING PART HERE */}
      {/* <div className="w-full flex justify-center items-center gap-4 flex-wrap"> */}
      {/*   <input */}
      {/*     type="text" */}
      {/*     placeholder="Seed key" */}
      {/*     value={shipSeed} */}
      {/*     onChange={(e) => setShipSeed(e.target.value)} */}
      {/*     className="px-4 py-2 rounded-xl bg-white/10 border-2 border-white/20 text-white outline-none focus:border-[#E67C41] transition duration-150 placeholder:text-white/40" */}
      {/*   /> */}
      {/*   <input */}
      {/*     type="number" */}
      {/*     placeholder="Scale" */}
      {/*     value={shipScale} */}
      {/*     min={1} */}
      {/*     max={70} */}
      {/*     onChange={(e) => setShipScale(Number(e.target.value))} */}
      {/*     className="px-4 py-2 rounded-xl bg-white/10 border-2 border-white/20 text-white outline-none focus:border-[#E67C41] transition duration-150 w-24 placeholder:text-white/40" */}
      {/*   /> */}
      {/*   <button */}
      {/*     onClick={handleGenerateShip} */}
      {/*     className="bg-[#D8A657] px-5 py-2 text-amber-950 font-bold rounded-xl border-2 border-amber-950 hover:brightness-110 active:brightness-130 transition duration-100" */}
      {/*   > */}
      {/*     Generate ship */}
      {/*   </button> */}
      {/* </div> */}
      <div className="h-fit w-fit rounded-full border-[#FEF3E0] border-3 p-1 absolute bottom-8 hover:border-[#E67C41]  hover:scale-105 active:scale-100 transition duration-100">
        <button
          onClick={handleCreateProjectModal}
          className="bg-[#FEF3E0] flex gap-3 px-5 font-bold  py-4 justify-center items-center text-lg rounded-full active:bg-[#F5C577] active:shadow-[0_0_0_5px_rgba(245, 197, 119, 1)] shadow-[inset_0_-1px_3px_2px_rgba(0,0,0,0.3)]"
        >
          <Rocket className="w-5 h-5" />
          Create a station
        </button>
      </div>
    </div>
  );
};

export default HomePage;
