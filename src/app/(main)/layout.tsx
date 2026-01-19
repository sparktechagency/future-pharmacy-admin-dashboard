import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import OptimusSidebar from "@/components/appSidebar/AppsideBar";
import Header from "@/components/header/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "../globals.css";

export const metadata: Metadata = {
  title: "Optimus HS Dashboard",
  description: "OptimusHS Dashboard for Future Pharmacy",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "/site.webmanifest",
};
// dsfsdfsdfs
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
