import BookDemo from "@/components/common/home/BookDemo";
import DifferentiatorsSection from "@/components/common/home/Differentiators";
import FAQSection from "@/components/common/home/FAQ";
import FeaturesSection from "@/components/common/home/Features";
import HeroSection from "@/components/common/home/Hero";
import HowItWorks from "@/components/common/home/HowItWorks";
import ProblemSection from "@/components/common/home/Problem";
import SocialProofSection from "@/components/common/home/SocialProof";
import TractionSection from "@/components/common/home/Traction";
import WhyNowSection from "@/components/common/home/WhyNow";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div className="section-divider" />
      <SocialProofSection />
      <ProblemSection />
      <HowItWorks />
      <DifferentiatorsSection />
      <WhyNowSection />
      <div className="section-divider" />
      <TractionSection />
      <FAQSection />
      <BookDemo />
    </main>
  );
}
