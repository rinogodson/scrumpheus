import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./HomePage";

function Home() {
  if (
    localStorage.getItem("hackatime_access") &&
    localStorage.getItem("hackatime_refresh")
  ) {
    return <Navigate to="/space" replace />;
  }
  const loginWithHackatime = () => {
    const clientId = import.meta.env.VITE_HACKATIME_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      "http://localhost:5173/auth/callback",
    );
    window.location.href = `https://hackatime.hackclub.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
  };

  return (
    <div className="bg-black h-screen relative overflow-hidden w-screen flex flex-col justify-center items-center gap-10">
      <img src="/Scrumpheus.svg" alt="Scrumpheus" />
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--base-opacity); }
          50% { opacity: 0.05; }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1px, 0.5px); }
          20% { transform: translate(0.8px, -0.3px); }
          30% { transform: translate(-0.5px, -0.8px); }
          40% { transform: translate(0.3px, 1px); }
          50% { transform: translate(-0.7px, -0.2px); }
          60% { transform: translate(1px, 0.7px); }
          70% { transform: translate(-0.3px, -0.5px); }
          80% { transform: translate(0.5px, 0.3px); }
          90% { transform: translate(-0.8px, 0.5px); }
        }
        .star {
          animation: twinkle var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }
      `}</style>
      <div
        className="absolute w-full h-full top-0 left-0"
        style={{ animation: "shake 0.8s ease-in-out infinite" }}
      >
        <div
          className="w-[200%] h-[200%] -z-199 overflow-hidden -top-1/2 -left-1/2 absolute"
          style={{ animation: "spin 120s linear infinite" }}
        >
          {Array.from({ length: 100 }, (_, i) => {
            const baseOpacity = ((i * 11 + 3) % 5) / 5 + 0.3;
            return (
              <div
                key={i}
                className="star absolute rounded-full bg-white"
                style={
                  {
                    width: (i % 3) + 1 + "px",
                    height: (i % 3) + 1 + "px",
                    top: ((i * 37 + 13) % 100) + "%",
                    left: ((i * 53 + 7) % 100) + "%",
                    "--base-opacity": baseOpacity,
                    "--duration": ((i * 73) % 3) + 2 + "s",
                    "--delay": (-(i * 137.5) % 2) + "s",
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>
      </div>
      <button
        onClick={loginWithHackatime}
        className="bg-[#D8A657] px-4 py-2 z-100 text-amber-950 text-lg rounded-[3px] active:brightness-130 hover:brightness-110 transition duration-100 font-bold flex items-center gap-2"
      >
        Login with Hackatime
      </button>
    </div>
  );
}

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      fetch("http://localhost:8787/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem("hackatime_access", data.access_token);
          localStorage.setItem("hackatime_refresh", data.refresh_token);

          navigate("/space");
        });
    }
  }, [navigate]);

  return (
    <div className="bg-black h-screen relative overflow-hidden w-screen flex flex-col justify-center items-center gap-1">
      <p className="text-white text-2xl">
        You're now Travelling through a wormhole...
      </p>
      <p className="text-white/20 text-lg">LOGGING YOU IN TO SCRUMPHEUS...</p>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--base-opacity); }
          50% { opacity: 0.05; }
        }
        @keyframes spin {
          100% { transform: rotate(360deg) scale(1.5); }
        }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1px, 0.5px); }
          20% { transform: translate(0.8px, -0.3px); }
          30% { transform: translate(-0.5px, -0.8px); }
          40% { transform: translate(0.3px, 1px); }
          50% { transform: translate(-0.7px, -0.2px); }
          60% { transform: translate(1px, 0.7px); }
          70% { transform: translate(-0.3px, -0.5px); }
          80% { transform: translate(0.5px, 0.3px); }
          90% { transform: translate(-0.8px, 0.5px); }
        }
        .star {
          animation: twinkle var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }
      `}</style>
      <div
        className="absolute w-full h-full top-0 left-0"
        style={{ animation: "shake 0.8s ease-in-out infinite" }}
      >
        <div
          className="w-[200%] h-[200%] -z-199 overflow-hidden -top-1/2 -left-1/2 absolute"
          style={{ animation: "spin 1s linear infinite" }}
        >
          {Array.from({ length: 500 }, (_, i) => {
            const baseOpacity = ((i * 11 + 3) % 5) / 5 + 0.3;
            return (
              <div
                key={i}
                className="star absolute rounded-full bg-white"
                style={
                  {
                    width: (i % 3) + 1 + "px",
                    height: (i % 3) + 1 + "px",
                    top: ((i * 37 + 13) % 100) + "%",
                    left: ((i * 53 + 7) % 100) + "%",
                    "--base-opacity": baseOpacity,
                    "--duration": ((i * 73) % 3) + 2 + "s",
                    "--delay": (-(i * 137.5) % 2) + "s",
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/space" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
