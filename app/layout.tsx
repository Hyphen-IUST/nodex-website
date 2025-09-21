import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "../components/global/theme-provider";
import { MaintenanceWrapper } from "../components/global/maintenance-wrapper";
import { ScrollEffects } from "../components/global/scroll-effects";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const poppinsSecondary = Poppins({
  variable: "--font-poppins-secondary",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
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
        className={`${poppins.variable} ${poppinsSecondary.variable} antialiased dark`}
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
