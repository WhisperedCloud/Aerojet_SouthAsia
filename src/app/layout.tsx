import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Shared/Header";
import NetworkBanner from "@/components/Shared/NetworkBanner";
import InstallAppBanner from "@/components/Shared/InstallAppBanner";
import { Toaster } from "sonner";
import Galaxy from "@/components/effects/Galaxy";
import FlightCursor from "@/components/effects/FlightCursor";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "AeroJet | Premium Flight Management System",
  description: "Seamlessly search, book, and manage your flights in real-time. Experience custom seating and instant rescheduling.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AeroJet",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B132B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-slate-950 text-slate-100 min-h-screen flex flex-col`}>
        <NetworkBanner />
        <Header />
        <div className="fixed inset-0 z-[-2] pointer-events-none opacity-60">
          <Galaxy 
            transparent={true} 
            density={1.0} 
            glowIntensity={0.5} 
            saturation={0.8} 
            hueShift={240} 
          />
        </div>
        <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
          {children}
        </main>
        <InstallAppBanner />
        <FlightCursor />
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
