import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/dashboard/SessionSelector";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export const metadata: Metadata = {
  title: "F1 VISUALIZER - Real-Time Formula 1 Data",
  description:
    "Real-time and historical Formula 1 data visualization powered by OpenF1 API",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-nb-bg text-nb-text font-body">
        <ThemeProvider>
          <QueryProvider>
            <SessionProvider>
              <TopNav />
              <div className="flex min-h-[calc(100vh-72px)]">
                <Sidebar />
                <main className="flex-1 md:ml-64 pt-[72px] pb-20 md:pb-8">
                  <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
                    {children}
                  </div>
                </main>
              </div>
              <MobileBottomNav />
            </SessionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
