// app/(auth)/layout.js
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";

export const metadata = {
  title: "FutsalHub - Sign In",
  description: "Sign in to manage your futsal games with friends",
  openGraph: {
    title: "FutsalHub - Sign In",
    description: "Sign in to manage your futsal games with friends",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "FutsalHub Logo",
      },
    ],
  },
  twitter: {
    title: "FutsalHub - Sign In",
    description: "Sign in to manage your futsal games with friends",
    images: ["https://futsal-manager.vercel.app/logo.png"],
  },
};

export default function AuthLayout({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        {children}
        <Toaster duration="1500" position="bottom-right" />
      </div>
    </ThemeProvider>
  );
}
