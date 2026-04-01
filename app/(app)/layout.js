// app/(app)/layout.js
import { AppSidebar } from "@/components/layout/app-sidebar";
import Navbar from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/providers/session-provider";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { UpdateNotification } from "@/components/pwa/update-notification";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { PersistentStorage } from "@/components/pwa/persistent-storage";
import { NotificationPrompt } from "@/components/pwa/notification-prompt";

export const metadata = {
  title: {
    default: "FutsalHub",
    template: "%s | FutsalHub",
  },
  description: "Manage your futsal games with friends",
  openGraph: {
    title: {
      default: "FutsalHub",
      template: "%s | FutsalHub",
    },
    description: "Manage your futsal games with friends",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "FutsalHub Logo",
      },
    ],
  },
  twitter: {
    title: {
      default: "FutsalHub",
      template: "%s | FutsalHub",
    },
    description: "Manage your futsal games with friends",
    images: ["https://futsal-manager.vercel.app/logo.png"],
  },
};

export default function AppLayout({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <SidebarProvider>
          <AppSidebar />
          <div className="flex-1 flex min-h-screen flex-col">
            <Navbar />
            <div className="flex flex-1 overflow-hidden pb-16 md:pb-0">
              <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
            </div>
          </div>
          <Toaster duration="1500" position="bottom-right" />

          {/* PWA Components */}
          <InstallPrompt />
          <UpdateNotification />
          <OfflineIndicator />
          <PersistentStorage />
          <NotificationPrompt />
          <MobileNav />
        </SidebarProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
