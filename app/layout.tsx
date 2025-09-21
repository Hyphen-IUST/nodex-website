import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import { ThemeProvider } from "../components/global/theme-provider";
import { MaintenanceWrapper } from "../components/global/maintenance-wrapper";
import { ScrollEffects } from "../components/global/scroll-effects";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const robotoMonoSecondary = Roboto_Mono({
  variable: "--font-roboto-mono-secondary",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${robotoMono.variable} ${robotoMonoSecondary.variable} antialiased dark`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ScrollEffects />
          <MaintenanceWrapper>
            {children}
            <Toaster />
          </MaintenanceWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
