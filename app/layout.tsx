import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import AuthDebugger from "@/components/debug/AuthDebugger";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VolunteerHub - Connect with Meaningful Opportunities",
  description: "Join VolunteerHub to discover and connect with meaningful volunteer opportunities. Empowering NGOs and volunteers to make a difference together.",
  keywords: ["volunteer", "NGO", "opportunities", "community service", "social impact", "charity"],
  authors: [{ name: "VolunteerHub Team" }],
  creator: "VolunteerHub",
  publisher: "VolunteerHub",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://volunteerhub.com",
    title: "VolunteerHub - Connect with Meaningful Opportunities",
    description: "Discover and connect with meaningful volunteer opportunities",
    siteName: "VolunteerHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "VolunteerHub - Connect with Meaningful Opportunities",
    description: "Discover and connect with meaningful volunteer opportunities",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
          {isDevelopment && <AuthDebugger />}
        </Providers>
      </body>
    </html>
  );
}
