import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import ProductsSection from './components/ProductsSection'
import FeaturedProducts from './components/FeaturedProducts'
import SupplyTiers from './components/SupplyTiers'
import SourcingSection from './components/SourcingSection'
import BannerSection from './components/BannerSection'
import FeaturesSection from './components/FeaturesSection'
import StatsSection from './components/StatsSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import BackToTopButton from './components/BackToTopButton'

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <ProductsSection />
      <FeaturedProducts />
      <SupplyTiers />
      <SourcingSection />
      <BannerSection />
      {/* Nền tối phủ sau cụm pin — chặn khe hở sub-pixel lộ nền trắng (giật trắng khi scroll) */}
      <div className="bg-[#3A3A3A]">
        <FeaturesSection />
        <StatsSection />
      </div>
      <ContactSection />
      <Footer />
      <BackToTopButton />
    </main>
  )
}
