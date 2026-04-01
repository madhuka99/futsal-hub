// components/layout/navbar.jsx
"use client";

import Link from "next/link";
import { Menu, Bell, UserCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import logo from "../../public/logo.png";
import Image from "next/image";

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { openMobile, setOpenMobile } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add resize listener
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">

      {/* Logo / title */}
      <div className="flex-1">
        <Link href="/" className="text-2xl font-bold">
          <div className="flex items-center gap-3 md:gap-5">
            <Image
              src={logo}
              width={30}
              height={30}
              className="rounded-full"
              alt="logo"
            />
            <span>FutsalHub</span>
          </div>
        </Link>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={toggle}
        >
          {theme === "dark" ? (
            <Sun className="size-6" />
          ) : (
            <Moon className="size-6" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}
