import { handleLogout } from "@/auth/userAuth";
import { useState, useEffect } from "react";
import { Home, User, UserCircle, LogOutIcon } from "lucide-react";

const mobileItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Users",
    url: "/users",
    icon: User,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: UserCircle,
  },
];

export function MobileMenuBar() {
  const [role, setRole] = useState<string | null>(localStorage.getItem("user_role"));

  useEffect(() => {
    const storedRole = localStorage.getItem("user_role");
    if (storedRole) setRole(storedRole);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-around p-2">
        {mobileItems
          .filter((item) => (item.title === "Users" && role !== "admin" ? false : true))
          .map((item) => (
            <button
              key={item.title}
              className="flex flex-col items-center text-gray-600 hover:text-green-600"
              onClick={() => (window.location.href = item.url)}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.title}</span>
            </button>
          ))}
        <button
          className="flex flex-col items-center text-gray-600 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOutIcon className="w-6 h-6" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </div>
  );
}
