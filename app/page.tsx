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
      <FeaturesSection />
      <StatsSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
