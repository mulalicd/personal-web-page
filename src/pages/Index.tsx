import { Navigation } from "@/components/Navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { BooksSection } from "@/components/BooksSection";
import { AISBPSection } from "@/components/AISBPSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { VolunteeringSection } from "@/components/VolunteeringSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { ChatBot } from "@/components/ChatBot";
import { ParticleBackground } from "@/components/ParticleBackground";
import { useSectionTracking } from "@/hooks/useSectionTracking";

const Index = () => {
  useSectionTracking();
  return (
    <div className="min-h-screen relative">
      {/* Accessibility: skip directly to main content for keyboard / screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus-visible:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Skip to main content
      </a>
      <ParticleBackground />
      <Navigation />
      <main id="main-content" tabIndex={-1} className="relative z-10 outline-none">
        <ErrorBoundary sectionName="Hero">
          <HeroSection />
        </ErrorBoundary>
        <ErrorBoundary sectionName="About">
          <AboutSection />
        </ErrorBoundary>
        <ErrorBoundary sectionName="Experience">
          <ExperienceSection />
        </ErrorBoundary>
        <ErrorBoundary sectionName="Books">
          <BooksSection />
        </ErrorBoundary>
        <ErrorBoundary sectionName="AISBP">
          <AISBPSection />
        </ErrorBoundary>
        <ErrorBoundary sectionName="Portfolio">
          <PortfolioSection />
        </ErrorBoundary>
        <ErrorBoundary sectionName="Volunteering">
          <VolunteeringSection />
        </ErrorBoundary>
        <ErrorBoundary sectionName="Testimonials">
          <TestimonialsSection />
        </ErrorBoundary>
        <ErrorBoundary sectionName="Contact">
          <ContactSection />
        </ErrorBoundary>
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Index;
