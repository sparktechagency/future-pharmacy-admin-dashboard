import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import OptimusSidebar from "@/components/appSidebar/AppsideBar";
import Header from "@/components/header/Header";

export const metadata: Metadata = {
  title: "Peterson Dashboard",
  description: "Peterson Dashboard",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <AuthGuard>
    // <CrossTabLogoutHandler />
    <SidebarProvider>
      <OptimusSidebar />
      <SidebarInset className="bg-gray-100 h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-4 overflow-auto min-w-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
    // </AuthGuard>
  );
}
