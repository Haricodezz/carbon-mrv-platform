import HeroSection from "@/components/landing/HeroSection";
import FeatureSection from "@/components/landing/FeatureSection";
import TrustSection from "@/components/landing/TrustSection";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  return (
    <main className="bg-white text-slate-900">
      <HeroSection />
      <FeatureSection />
      <TrustSection />
      <CTASection />
    </main>
  );
}