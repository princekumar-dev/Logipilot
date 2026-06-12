import type { Metadata } from "next";
import { Instrument_Sans, Bricolage_Grotesque } from "next/font/google";
import { Toaster } from "sonner";
import AuthProvider from "@/components/providers/AuthProvider";
import { RouteLoader } from "@/components/ui/RouteLoader";
import "./globals.css";

const instrumentSans = Instrument_Sans({ 
  subsets: ["latin"],
  variable: "--font-instrument",
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "LogiPilot AI - Command Center",
  description: "AI-powered logistics operations platform",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body className={`${instrumentSans.variable} ${bricolageGrotesque.variable} font-sans antialiased min-h-screen bg-background text-foreground flex flex-col overflow-y-scroll`} suppressHydrationWarning>
        <RouteLoader />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
