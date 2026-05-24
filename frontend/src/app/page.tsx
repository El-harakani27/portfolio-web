import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import AITeaserSection from "@/components/sections/AITeaserSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />

      {/* Divider — Work → AI Interview */}
      <div style={{ background: '#000000', padding: '0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255)' }} />
        </div>
      </div>

      <AITeaserSection />
      <ContactSection />
    </main>
  );
}