import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProgramGrid from "../components/ProgramGrid";
import Features from "../components/Features";
import Mentors from "../components/Mentors";
import Testimonials from "../components/Testimonials";
import SectionDivider from "../components/SectionDivider";
import FAQ from "../components/FAQ";
import ClosingCTA from "../components/ClosingCTA";
import ClosingBrand from "../components/ClosingBrand"; 
import Footer from "../components/Footer";

export default function Page() {
  return (
    <main className="bg-slate-950 text-white min-h-screen">
      <Navbar />
      <Hero />
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionDivider />
        <ProgramGrid />
        <SectionDivider />
        <Features />
        <SectionDivider />
        <Mentors />
        <SectionDivider />
        <Testimonials />
        <SectionDivider />
        <FAQ />
        <SectionDivider />
      </div>

      <ClosingCTA />
      <ClosingBrand />
      <Footer />
    </main>
  );
}
