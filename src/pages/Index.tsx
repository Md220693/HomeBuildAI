import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
//import ProcessSteps from "@/components/ProcessSteps";
//import BenefitsSection from "@/components/BenefitsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import PremiumOverview from "@/components/PremiumOverview";


const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <PremiumOverview />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
