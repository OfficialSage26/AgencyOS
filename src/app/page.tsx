import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/marketing/site-header";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { Cta } from "@/components/marketing/cta";
import { SiteFooter } from "@/components/marketing/site-footer";

export default async function HomePage() {
  // Signed-in users skip the marketing site and go straight to the app.
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </>
  );
}
