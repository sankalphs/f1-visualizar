import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
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
    >
      <body className="min-h-full flex bg-zinc-950 text-zinc-100">
        <QueryProvider>
          <SessionProvider>
            <Sidebar />
            <main className="ml-56 flex-1 min-h-screen">
              <div className="mx-auto max-w-[1600px] p-6">{children}</div>
            </main>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
