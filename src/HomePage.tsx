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
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const token = localStorage.getItem("hackatime_access");
    if (!token || token === "undefined") return;

    const apiUrl = "https://hackatime.hackclub.com/api/v1/authenticated/me";

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

        const userRef = doc(db, "users", user.id);
        await setDoc(
          userRef,
          {
            username: user.username,
            photo: user.photo || "",
            lastSeen: new Date().toISOString(),
          },
          { merge: true },
        );

        const q = query(
          collection(db, "spaceships"),
          where("userId", "==", user.id),
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedProjects = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProjects(loadedProjects);
        });

        return () => unsubscribe();
      })
      .catch((err) => {
        console.error("Fetch Error:", err.message);
      });
  }, []);

  const handleCreateProjectModal = () => {
    setShowForm(true);
    setProjectName("");
    setGoalHours("");
  };

  const handleAddProject = async (e) => {
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
    setShowForm(false);
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
      <div className="h-[90%] w-full rounded-[3rem] bg-black shadow-[0_1.5px_0_2px_rgba(255,255,255,0.1),0_-1px_0_2px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {projects.length === 0 ? (
          <p className="text-white">No projects yet. Build a ship!</p>
        ) : (
          <ul>
            {projects.map((project) => (
              <li
                key={project.id}
                className="bg-[#333] p-4 text-white rounded-lg w-full max-w-md shadow-[0_1.5px_0_2px_rgba(255,255,255,0.1),0_-1px_0_2px_rgba(0,0,0,0.5)]"
              >
                <h4>{project.projectName}</h4>
                <p>Goal: {project.goalHours} hours</p>
                <div
                  style={{
                    background: "#555",
                    width: "100%",
                    height: "20px",
                    borderRadius: "10px",
                    marginTop: "10px",
                  }}
                >
                  <div
                    style={{
                      background: "#4caf50",
                      width: `${(project.currentHours / project.goalHours) * 100}%`,
                      height: "100%",
                      borderRadius: "10px",
                    }}
                  ></div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: (i % 3) + 1 + "px",
              height: (i % 3) + 1 + "px",
              top: ((i * 37 + 13) % 100) + "%",
              left: ((i * 53 + 7) % 100) + "%",
              opacity: ((i * 11 + 3) % 5) / 5 + 0.3,
            }}
          />
        ))}
      </div>
      <div className="h-fit w-fit rounded-full border-[#FEF3E0] border-3 p-1 absolute bottom-8 hover:border-[#E67C41]  hover:scale-105 active:scale-100 transition duration-100">
        <button
          onClick={handleCreateProjectModal}
          className="bg-[#FEF3E0] flex gap-3 px-5 font-bold  py-4 justify-center items-center text-lg rounded-full active:bg-[#F5C577] active:shadow-[0_0_0_5px_rgba(245, 197, 119, 1)] shadow-[inset_0_-1px_3px_2px_rgba(0,0,0,0.3)]"
        >
          <Rocket className="w-5 h-5" />
          Create a station
        </button>
      </div>
      <div className="h-fit w-fit rounded-full left-10 border-[#FEF3E0] border-3 p-1 absolute bottom-8 hover:border-[#E67C41]  hover:scale-105 active:scale-100 transition duration-100">
        <button
          onClick={syncProjects}
          className="bg-[#FEF3E0] flex gap-3 px-5 font-bold  py-4 justify-center items-center text-lg rounded-full active:bg-[#F5C577] active:shadow-[0_0_0_5px_rgba(245, 197, 119, 1)] shadow-[inset_0_-1px_3px_2px_rgba(0,0,0,0.3)]"
        >
          Sync
        </button>
      </div>
    </div>
  );
};

export default HomePage;
