import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Marketing display + body faces for the Aurora landing page.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "AgencyOS — Run your agency in one place",
    template: "%s · AgencyOS",
  },
  description:
    "AgencyOS is the all-in-one operating system for freelancers, agencies, and consultants: CRM, projects, invoicing, scheduling, a client portal, and AI-powered proposals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-PH"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ClerkProvider>
          {children}
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
