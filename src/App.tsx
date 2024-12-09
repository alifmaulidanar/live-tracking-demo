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
  const [installPromptVisible, setInstallPromptVisible] = useState(false);

  useEffect(() => {
    const session = userSession ? JSON.parse(userSession) : null;
    if (session) setUser(session);
    setLoading(false);
  }, [userSession]);

  // Handle the 'beforeinstallprompt' event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setInstallPromptVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup listener when the component is unmounted
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        setDeferredPrompt(null);
        setInstallPromptVisible(false);
      });
    }
  };

  const checkUser = () => {
    return userSession !== null;
  };

  if (loading || roleLoading) return <div>Loading...</div>;

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
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

        {installPromptVisible && (
          <div className="install-prompt">
            <Button onClick={handleInstallClick}>Install App</Button>
          </div>
        )}
      </Router>
    </SessionContextProvider>
  );
}

export default App;
