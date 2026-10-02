import HeroShowcase from '@/components/home/HeroShowcase';
import CompanyProfile from '@/components/home/CompanyProfile';
import CuratedSetups from '@/components/home/CuratedSetups';
import FeaturedCatalog from '@/components/home/FeaturedCatalog';
import InspectionStandards from '@/components/home/InspectionStandards';
import CorporateWorkflow from '@/components/home/CorporateWorkflow';
import BrandEcosystem from '@/components/home/BrandEcosystem';
import BriefBuilder from '@/components/home/BriefBuilder';
import HomeFAQ from '@/components/home/HomeFAQ';

export default function HomePage() {
  return (
    <main id="main-content" className="home-profile-view">
      {/* 1. Hero Showcase: Brand Overview & Live Verified Hardware Hub */}
      <HeroShowcase />

      {/* 2. Company Profile: Vision, Values, & 4 Core Institutional Pillars */}
      <CompanyProfile />

      {/* 3. Curated Workspaces: Engineering, Business, Creation, & Power Setups */}
      <CuratedSetups />

      {/* 4. Verified Catalog: Handpicked inventory with real photos & specs */}
      <FeaturedCatalog />

      {/* 5. 7-Point Quality Standards: Laboratory Diagnostic Protocol & Warranty */}
      <InspectionStandards />

      {/* 6. Corporate Supply Workflow: 4-step procurement for teams in Sana'a */}
      <CorporateWorkflow />

      {/* 7. Brand Ecosystem: Global partners & enterprise lines */}
      <BrandEcosystem />

      {/* 8. Interactive Brief & Instant WhatsApp Quote Builder */}
      <BriefBuilder />

      {/* 9. Frequently Asked Questions */}
      <HomeFAQ />
    </main>
  );
}
