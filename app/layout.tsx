import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../components/global/theme-provider";
import { MaintenanceWrapper } from "../components/global/maintenance-wrapper";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NodeX - Think. Solve. Transform.",
  description:
    "NodeX is a vibrant, student-led technical club at IUST Kashmir, fostering innovation, collaboration, and shared growth through hackathons, workshops, and collaborative projects.",
  keywords:
    "NodeX, IUST, tech club, programming, hackathons, workshops, Kashmir, student organization, innovation, collaboration",
  authors: [{ name: "NodeX Team" }],
  openGraph: {
    title: "NodeX - Think. Solve. Transform.",
    description:
      "Student-led technical club at IUST Kashmir fostering innovation and collaboration",
    siteName: "NodeX",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NodeX - Think. Solve. Transform.",
    description:
      "Student-led technical club at IUST Kashmir fostering innovation and collaboration",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <MaintenanceWrapper>{children}</MaintenanceWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
