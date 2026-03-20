import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/dashboard/SessionSelector";
import { Sidebar } from "@/components/layout/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "F1 Visualizer - Real-Time Formula 1 Data Dashboard",
  description:
    "Real-time and historical Formula 1 data visualization powered by OpenF1 API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex bg-zinc-950 text-zinc-100">
        <ThemeProvider>
          <QueryProvider>
            <SessionProvider>
              <Sidebar />
              <main className="flex-1 min-h-screen md:ml-56">
                <div className="mx-auto max-w-[1600px] p-4 md:p-6">{children}</div>
              </main>
            </SessionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
