"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Calendar,
  BarChart,
  Images,
  Menu,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { LuUsers } from "react-icons/lu";
import { FaRegUserCircle } from "react-icons/fa";
import { supabaseBrowser } from "@/utils/supabase/client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const bottomNav = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Matches", url: "/matches", icon: Calendar },
  { title: "Players", url: "/players", icon: LuUsers },
  { title: "Stats", url: "/stats", icon: BarChart },
];

const moreNav = [
  { title: "Gallery", url: "/gallery", icon: Images },
  { title: "Profile", url: "/profile", icon: FaRegUserCircle },
  { title: "Admin", url: "/admin", icon: ShieldAlert },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState(null);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) return;
      if (mounted) setUser(user);
    };

    fetchUser();

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
      (_, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await supabaseBrowser.auth.signOut();
    router.push("/");
  };

  const filteredMoreNav = moreNav.filter((item) =>
    item.title === "Admin" ? user?.email === "yhmpth@gmail.com" : true
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <nav className="flex items-center justify-around h-16">
        {bottomNav.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.title}</span>
            </Link>
          );
        })}

        {/* More menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center flex-1 h-full text-xs text-muted-foreground">
              <Menu className="h-5 w-5 mb-1" />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <nav className="grid grid-cols-3 gap-4 py-4 px-4">
              {filteredMoreNav.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-lg transition-colors border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="h-6 w-6 mb-2" />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t p-4 pb-8">
              <Button
                variant="ghost"
                className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Log out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
