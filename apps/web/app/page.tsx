import DemoSection from "@/components/DemoSection";
import Features from "@/components/Features";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <HeroSection />
      <Features />
      <HowItWorks />
      <DemoSection />
    </div>
  );
}
