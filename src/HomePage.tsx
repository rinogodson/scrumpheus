import { DoorOpen, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("hackatime_access");
    localStorage.removeItem("hackatime_refresh");

    navigate("/");
  };

  return (
    <div className=" w-screen h-screen flex justify-start flex-col p-7 gap-7 items-center">
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
        <button className="bg-[#FEF3E0] flex gap-3 px-5 font-bold  py-4 justify-center items-center text-lg rounded-full active:bg-[#F5C577] active:shadow-[0_0_0_5px_rgba(245, 197, 119, 1)] shadow-[inset_0_-1px_3px_2px_rgba(0,0,0,0.3)]">
          <Rocket className="w-5 h-5" />
          Create a ship
        </button>
      </div>
    </div>
  );
};

export default HomePage;
