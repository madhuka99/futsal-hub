// components/layout/app-sidebar.jsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  User,
  BarChart,
  Clock,
  Settings,
  X,
  Images,
  ShieldAlert,
} from "lucide-react";
import { LuUsers } from "react-icons/lu";

import { supabaseBrowser } from "@/utils/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "../../public/logo.png";
import { FaRegUserCircle } from "react-icons/fa";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Matches", url: "/matches", icon: Calendar },
  { title: "Players", url: "/players", icon: LuUsers },
  // { title: "Stats", url: "/stats", icon: BarChart },
  { title: "Gallery", url: "/gallery", icon: Images },
  { title: "Profile", url: "/profile", icon: FaRegUserCircle },
  { title: "Admin", url: "/admin", icon: ShieldAlert },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [user, setUser] = React.useState(null);
  const [role, setRole] = React.useState(null);
  const { open, setOpen, openMobile, setOpenMobile } = useSidebar();
  const [isMobile, setIsMobile] = React.useState(false);

  // Detect mobile viewport
  React.useEffect(() => {
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

  React.useEffect(() => {
    let mounted = true;

    const fetchUserAndRole = async () => {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) return;

      if (mounted) setUser(user);

      const { data: profile, error } = await supabaseBrowser
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile && mounted) {
        setRole(profile.role);
      }
    };

    fetchUserAndRole();

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
      (_, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) fetchUserAndRole(); // Refetch role if user changes
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const filteredNavItems = navItems.filter((item) =>
    item.title === "Admin" ? user?.email === "yhmpth@gmail.com" : true
  );

  // Function to close sidebar when clicking links on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="hidden md:flex w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-700">

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center !text-lg gap-3 px-4 py-6 my-1 rounded-lg transition-colors duration-150
                            ${
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            }`}
                        onClick={handleLinkClick}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              name: user.user_metadata.full_name ?? user.email,
              email: user.email,
              avatar: user.user_metadata.avatar_url ?? "",
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
