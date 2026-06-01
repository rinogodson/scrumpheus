import { Rocket } from "lucide-react";

const App = () => {
  return (
    <div className=" w-screen h-screen flex justify-start flex-col p-7 gap-7 items-center">
      <img src="/Scrumpheus.svg" alt="Scrumpheus" />
      <div className="h-[90%] w-full rounded-2xl bg-black"></div>
      <div className="h-fit w-fit rounded-2xl rounded-full border-[#FEF3E0] border-3 p-1 absolute bottom-10 hover:border-[#E67C41] hover:scale-105 active:scale-100 transition duration-100">
        <button className="bg-[#FEF3E0] flex gap-3 px-5 font-bold py-4 justify-center items-center text-lg rounded-full active:bg-[#F5C577] active:shadow-[0_0_0_5px_rgba(245, 197, 119, 1)]">
          <Rocket className="w-5 h-5" />
          Create a ship
        </button>
      </div>
    </div>
  );
};

export default App;
