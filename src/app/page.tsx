import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProgramGrid from "../components/ProgramGrid";
import Features from "../components/Features";
import Mentors from "../components/Mentors";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import ClosingCTA from "../components/ClosingCTA";
import Footer from "../components/Footer";
import ClosingBrand from "@/components/ClosingBrand";

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