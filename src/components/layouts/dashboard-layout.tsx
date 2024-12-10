import { useEffect, useState } from "react";
import { DesktopSidebar } from "@/components/customs/desktop-sidebar";
import { MobileMenuBar } from "@/components/customs/mobile-menubar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Threshold for mobile
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex h-screen">
      {!isMobile && <DesktopSidebar />}
      <main className={`flex-1 ${!isMobile ? "ml-60" : "pb-16"}`}>{children}</main>
      {isMobile && <MobileMenuBar />}
    </div>
  )
}
