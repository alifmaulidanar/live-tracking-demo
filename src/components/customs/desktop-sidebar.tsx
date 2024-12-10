import { useEffect, useState } from "react";
import { handleLogout } from "@/auth/userAuth";
import { Home, User, UserCircle, LogOutIcon } from "lucide-react";

const desktopItems = [
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

export function DesktopSidebar() {
  const [role, setRole] = useState<string | null>(localStorage.getItem("user_role"));

  useEffect(() => {
    const storedRole = localStorage.getItem("user_role");
    if (storedRole) setRole(storedRole);
  }, []);

  return (
    <div className="fixed top-0 left-0 h-full bg-gray-100 shadow-md w-60">
      <nav className="flex flex-col h-full">
        <div className="flex flex-col gap-4 p-4">
          {desktopItems
            .filter((item) => (item.title === "Users" && role !== "admin" ? false : true))
            .map((item) => (
              <a
                key={item.title}
                href={item.url}
                className="flex items-center gap-3 p-2 text-gray-700 rounded hover:bg-gray-200"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </a>
            ))}
        </div>
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 p-2 text-white bg-red-600 rounded hover:bg-red-800"
          >
            <LogOutIcon className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
