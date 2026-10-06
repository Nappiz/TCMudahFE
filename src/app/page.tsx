import ClosingBrand from "@/components/ClosingBrand";
import ClosingCTA from "../components/ClosingCTA";
import FAQ from "../components/FAQ";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Mentors from "../components/Mentors";
import Navbar from "../components/Navbar";
import ProgramGrid from "../components/ProgramGrid";
import Testimonials from "../components/Testimonials";

// Homepage content is fetched without caching so CMS updates appear immediately.
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="bg-slate-950 text-white min-h-screen selection:bg-cyan-500/30 selection:text-cyan-50">
      <Navbar />

      <div className="space-y-0">
        <Hero />
        <ProgramGrid />
        <Features />
        <Mentors />
        <Testimonials />
        <FAQ />
        <ClosingCTA />
        <ClosingBrand />
      </div>

      <Footer />
    </main>
  );
}
