import type { Metadata } from "next";
import "./globals.css";
import { AppDataProvider } from "@/components/providers/AppDataProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: {
    default: "SkillForge - mini-courses for software engineering & AI tools",
    template: "%s | SkillForge",
  },
  description:
    "Personalised learning paths, interactive simulations, mock interviews, coding exercises and AI-narrated lessons on software engineering and AI tools. Built for both CS and non-CS learners.",
  keywords: [
    "mini-courses",
    "software engineering",
    "AI tools",
    "learning paths",
    "mock interview",
    "coding practice",
  ],
  openGraph: {
    title: "SkillForge",
    description:
      "Mini-courses on software engineering and AI tools with personalised paths, simulations and mock interviews.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col font-sans">
        <AppDataProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AppDataProvider>
      </body>
    </html>
  );
}
