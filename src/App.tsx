/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from "@/utils/supabase";
import { useRole } from "@/hooks/useRole";
import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import { Button } from "./components/ui/button";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import UsersPage from "@/pages/(admin)/users/UsersPage";
import { LoginForm } from "@/components/customs/login-form";
import ProfilePage from "@/pages/(users)/profile/ProfilePage";
// import UpdateUserInfo from "@/pages/(admin)/users/UpdateProfile";
import { SessionContextProvider, User } from "@supabase/auth-helpers-react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

function App() {
  const [loading, setLoading] = useState(true);
  const [, setUser] = useState<User | null>(null);
  const { role, loading: roleLoading } = useRole();
  const userSession = localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_SESSION);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(() =>
    JSON.parse(localStorage.getItem("showInstallBanner") || "true")
  );

  useEffect(() => {
    const session = userSession ? JSON.parse(userSession) : null;
    if (session) setUser(session);
    setLoading(false);
  }, [userSession]);

  // Handle the 'beforeinstallprompt' event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
      localStorage.setItem("showInstallBanner", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the A2HS prompt");
        } else {
          console.log("User dismissed the A2HS prompt");
        }
        setDeferredPrompt(null);
        setShowBanner(false);
        localStorage.setItem("showInstallBanner", "false");
      });
    }
  };

  const checkUser = () => {
    return userSession !== null;
  };

  if (loading || roleLoading) return <div>Loading...</div>;

  const handleCloseBanner = () => {
    setShowBanner(false);
    localStorage.setItem("showInstallBanner", "false");
  };

  function InstallPromptAlert() {
    if (!showBanner) return null;

    return (
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-4 text-sm font-bold text-white bg-[#059669] shadow-md"
        style={{ marginTop: "0" }}
      >
        <span className="mr-4">Install this app to your Home Screen for quick access!</span>
        <div className="flex items-center gap-2">
          <Button
            className="px-4 py-2 text-sm font-bold text-[#10b981] transition-transform duration-200 bg-white border border-[#10b981] rounded-md cursor-pointer hover:bg-green-50 active:bg-green-100 active:scale-95"
            onClick={handleInstallClick}
          >
            Install
          </Button>
          <button
            className="text-white hover:text-gray-200"
            onClick={handleCloseBanner}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
        <div className={`transition-all duration-300 ${showBanner ? "mt-20" : ""}`}>
          <InstallPromptAlert />
          <Routes>
            <Route
              path="/"
              element={checkUser() ? <Navigate to="/dashboard" /> : <LandingPage />}
            />

            {/* Halaman Login */}
            <Route
              path="/login"
              element={checkUser() ? <Navigate to="/dashboard" /> : <LoginForm />}
            />

            {/* Halaman Dashboard */}
            <Route
              path="/dashboard"
              element={checkUser() ? <DashboardPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/users"
              element={checkUser() && role === 'admin' ? <UsersPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={checkUser() ? <ProfilePage /> : <Navigate to="/login" />}
            />

            {/* Halaman Update */}
            {/* <Route
            path="/update"
            element={<UpdateUserInfo />}
          /> */}
          </Routes>
        </div>
      </Router>
    </SessionContextProvider>
  );
}

export default App;
