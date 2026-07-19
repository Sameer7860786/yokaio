import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  ChevronDown, 
  Twitter, 
  Send, 
  Globe, 
  ShoppingBag, 
  Database, 
  Menu, 
  X, 
  Heart,
  Loader2
} from "lucide-react";

// Import types
import { CMSContent, CollectibleNFT, WhitelistApplication } from "./types";

// Import Logo & Banner Assets
import logoImg from "./assets/images/yokaio_logo_1783919202691.jpg";
import bannerImg from "./assets/images/yokaio_banner_1783919214441.jpg";
import frontLogoImg from "./assets/images/yokaio_logo_1783919202691.jpg";
import aboutImg from "./assets/images/yokai_samurai_1782119390263.jpg";

// Import Modular Components
import GlowBackground from "./components/GlowBackground";
import WLForm from "./components/WLForm";
import NFTGallery from "./components/NFTGallery";
import WLChecker from "./components/WLChecker";
import Roadmap from "./components/Roadmap";
import FAQAccordion from "./components/FAQAccordion";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  // Mobile navigation visibility
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Full screen Admin panel visibility
  const [adminOpen, setAdminOpen] = useState(false);
  // Logo load error fallback state
  const [logoError, setLogoError] = useState(false);

  // States cached from backend
  const [cms, setCms] = useState<CMSContent | null>(null);
  const [gallery, setGallery] = useState<CollectibleNFT[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats to calculate live count of applicants
  const [totalApplicationsCount, setTotalApplicationsCount] = useState(0);

  useEffect(() => {
    fetchCoreData();
    
    // Administrative panel access via /admin route or back-door queries
    const checkAdmin = () => {
      if (
        window.location.pathname === "/admin" ||
        window.location.pathname.startsWith("/admin/") ||
        window.location.search.includes("admin=true") || 
        window.location.hash === "#admin"
      ) {
        setAdminOpen(true);
      }
    };
    checkAdmin();
    window.addEventListener("hashchange", checkAdmin);
    return () => window.removeEventListener("hashchange", checkAdmin);
  }, []);

  const handleAdminClose = () => {
    setAdminOpen(false);
    if (window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/")) {
      window.history.pushState(null, "", "/");
    }
  };

  const fetchCoreData = async () => {
    try {
      const [resCms, resGallery, resApps] = await Promise.all([
        fetch("/api/cms").then((r) => r.json()),
        fetch("/api/gallery").then((r) => r.json()),
        fetch("/api/applications?summary=true").then((r) => r.json())
      ]);
      setCms(resCms);
      setGallery(resGallery);
      
      // Support either the summary count format or legacy fallback format
      if (resApps && typeof resApps.count === 'number') {
        setTotalApplicationsCount(resApps.count);
      } else if (Array.isArray(resApps)) {
        setTotalApplicationsCount(resApps.length);
      } else if (resApps && resApps.pagination) {
        setTotalApplicationsCount(resApps.pagination.total);
      } else {
        setTotalApplicationsCount(0);
      }
    } catch (error) {
      console.error("Failed to retrieve core portal information", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSuccess = (app: WhitelistApplication) => {
    setTotalApplicationsCount((prev) => prev + 1);
    // Refresh to check if newly approved is added or state updated
    fetchCoreData();
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  if (loading || !cms) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center text-brand-cream font-mono">
        <Loader2 className="w-10 h-10 text-brand-gold animate-spin mb-4" />
        <p className="text-xs tracking-[0.4em] text-brand-gold glow-gold">LOADING GALLERY...</p>
      </div>
    );
  }

  return (
    <div className="relative bg-brand-black text-brand-cream font-sans overflow-hidden min-h-screen">
      
      {/* GLOBAL FLOATING NAVIGATION BAR */}
      <header className="fixed top-0 left-0 w-full z-45 bg-[#050706]/90 backdrop-blur-md border-b border-brand-gold/20 py-5 px-4 md:px-12 transition-transform">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo Brand Title with Custom Logo Image */}
          <div 
            onClick={() => scrollToSection("hero")}
            className="flex items-center gap-4 cursor-pointer group"
          >
            {!logoError && (
              <img
                src={logoImg}
                alt=""
                onError={() => setLogoError(true)}
                className="w-[34px] h-[34px] md:w-[42px] md:h-[42px] object-contain shrink-0"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="relative">
              <span className="font-serif text-2xl font-bold text-brand-cream tracking-[0.25em] group-hover:text-brand-gold transition-colors duration-450 glow-gold uppercase">
                {cms.heroTitle || "YOKAIO"}
              </span>
            </div>
            <span className="hidden lg:inline-block text-[8px] font-mono tracking-widest text-brand-gold border border-brand-gold/40 px-2 py-0.5 ml-1 uppercase animate-pulse">
              100 Supply
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-[0.2em] text-brand-cream/90">
            <button onClick={() => scrollToSection("about")} className="hover:text-brand-gold transition-colors cursor-pointer pb-1">About</button>
            <button onClick={() => scrollToSection("gallery")} className="hover:text-brand-gold transition-colors cursor-pointer pb-1">Gallery</button>
            <button onClick={() => scrollToSection("roadmap")} className="hover:text-brand-gold transition-colors cursor-pointer pb-1">Roadmap</button>
            <button onClick={() => scrollToSection("checker")} className="hover:text-brand-gold transition-colors cursor-pointer pb-1">Check Whitelist</button>
            <button onClick={() => scrollToSection("faq")} className="hover:text-brand-gold transition-colors cursor-pointer pb-1">FAQ</button>
          </nav>

          {/* Action buttons (Whitelist Entry Button) */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => scrollToSection("whitelist")}
              className="px-6 py-2 border border-brand-gold text-brand-gold text-xs uppercase tracking-widest font-bold font-mono hover:bg-brand-gold hover:text-brand-black transition-all cursor-pointer"
            >
              Apply Whitelist
            </button>
          </div>

          {/* Mobile navigation Hamburger trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-brand-gold p-1 border border-brand-brown/40 rounded bg-zinc-950 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE TRIGGER FULL SCREEN LAYER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-brand-black/98 backdrop-blur-xl z-40 flex flex-col justify-center items-center p-6 text-center"
          >
            <nav className="flex flex-col gap-8 text-lg font-serif tracking-[0.15em] uppercase mb-12">
              <button onClick={() => scrollToSection("about")} className="hover:text-brand-gold text-brand-cream transition-colors block">About</button>
              <button onClick={() => scrollToSection("gallery")} className="hover:text-brand-gold text-brand-cream transition-colors block">Gallery</button>
              <button onClick={() => scrollToSection("roadmap")} className="hover:text-brand-gold text-brand-cream transition-colors block">The Awakening</button>
              <button onClick={() => scrollToSection("checker")} className="hover:text-brand-gold text-brand-cream transition-colors block">Check Whitelist</button>
              <button onClick={() => scrollToSection("faq")} className="hover:text-brand-gold text-brand-cream transition-colors block">Compendium</button>
            </nav>

            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button
                onClick={() => scrollToSection("whitelist")}
                className="bg-brand-gold text-brand-black w-full py-4 rounded-xl font-serif font-black tracking-widest uppercase border border-brand-gold text-xs shadow-md cursor-pointer hover:brightness-110 transition-all"
              >
                APPLY FOR WL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO SECTION */}
      <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center pt-32 pb-20 px-4 text-center z-10 overflow-hidden">
        
        {/* Mystic foggy/particle graphics overlay */}
        <GlowBackground />

        {/* Center alignment Content */}
        <div className="relative max-w-4xl mx-auto z-10 mt-6 space-y-10 px-2">
          
          {/* Logo Header styling */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="w-20 h-20 rounded-full border border-brand-gold/40 p-1 bg-black/60 shadow-[0_0_15px_rgba(198,255,0,0.15)] relative mb-2 overflow-hidden">
              <img 
                src={frontLogoImg} 
                alt="YOKAIO Core Logo" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 rounded-full border border-brand-gold/20 animate-pulse pointer-events-none" />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-[1px] w-12 bg-brand-gold"></div>
              <span className="text-brand-gold uppercase tracking-[0.4em] text-xs font-semibold">100 Unique Characters</span>
              <div className="h-[1px] w-12 bg-brand-gold"></div>
            </div>
          </motion.div>

          {/* Headline Display font */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15 }}
            className="text-5xl md:text-7xl lg:text-8.5xl font-extrabold leading-tight uppercase tracking-tight font-serif text-brand-cream"
          >
            {cms.heroHeadline || "YOKAIO 👹⚔️"}
          </motion.h1>

          {/* Subheadline and Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25 }}
            className="font-mono text-sm md:text-md uppercase tracking-[0.3em] text-brand-gold glow-gold text-center"
          >
            UNLEASH THE SPIRIT WITHIN &bull; FORGED FOR THE BOLD
          </motion.div>

          {/* Description line */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35 }}
            className="max-w-2xl mx-auto text-sm md:text-lg text-brand-cream/85 font-normal leading-relaxed pl-1"
          >
            {cms.heroDescription || "A premium collection of 100 unique anime-inspired characters built for collectors who appreciate strong character design, individuality, and premium digital collectibles."}
          </motion.p>

          {/* Core Button Group trigger */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-5 pt-4"
          >
            <button
              id="hero-apply-btn"
              onClick={() => scrollToSection("whitelist")}
              className="w-full sm:w-auto px-10 py-4.5 bg-brand-gold text-black font-extrabold uppercase tracking-widest text-sm hover:brightness-110 transition-all cursor-pointer font-mono"
            >
              Apply For Whitelist
            </button>
            <button
              id="hero-gallery-btn"
              onClick={() => scrollToSection("gallery")}
              className="w-full sm:w-auto px-10 py-4.5 border border-brand-cream/30 text-brand-cream font-extrabold uppercase tracking-widest text-sm hover:bg-brand-cream/10 transition-all cursor-pointer font-mono"
            >
              View Collection
            </button>
          </motion.div>

          {/* Live Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.65 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2 max-w-3xl mx-auto pt-10"
          >
            {[
              { label: "Supply", val: "100" },
              { label: "Chain", val: "Robinhood" },
              { label: "Mint Price", val: "TBA" },
              { label: "Whitelist Status", val: cms.wlStatus || "Open", color: "text-brand-gold glow-gold" }
            ].map((stat, i) => (
              <div 
                key={i} 
                className="bg-brand-brown/15 border border-brand-gold/25 p-5 text-left transition-all hover:bg-brand-brown/25"
              >
                <div className="text-[10px] text-brand-gold uppercase tracking-widest opacity-70 mb-1.5 font-mono">{stat.label}</div>
                <div className={`text-xl font-bold font-serif ${stat.color || "text-brand-cream"}`}>{stat.val}</div>
              </div>
            ))}
          </motion.div>

        </div>

        {/* Scroll helper anchor */}
        <div 
          onClick={() => scrollToSection("about")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer text-zinc-500 hover:text-brand-gold flex flex-col items-center gap-1.5 z-10 transition-colors"
        >
          <span className="font-mono text-[8px] uppercase tracking-[0.3em]">PROCEED</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section id="about" className="relative py-28 px-4 border-t border-brand-brown/30 bg-brand-black z-10">
        
        {/* Section top details */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/15 to-transparent" />

        <div className="max-w-5xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Traditional image frame */}
            <div className="lg:col-span-5 relative mt-8 md:mt-0">
              <div className="aspect-square bg-[#050706] rounded-2xl overflow-hidden border border-brand-gold/30 shadow-2xl relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />
                <img 
                  src={aboutImg} 
                  alt="YOKAIO Elite Warrior" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-center text-[10px] font-mono text-zinc-400">
                  <span className="bg-black/60 px-2 py-1 rounded border border-brand-brown/30 tracking-widest text-brand-gold">SAMURAI ORIGIN</span>
                  <span className="bg-black/60 px-2 py-1 rounded border border-brand-brown/30">ID #026</span>
                </div>
              </div>
            </div>

            {/* Right Column: Narrative textual data */}
            <div className="lg:col-span-7 text-left space-y-6">
              
              <div className="space-y-2">
                <p className="font-mono text-xs tracking-[0.5em] text-brand-gold uppercase glow-gold">Official Overview</p>
                <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-wider text-brand-cream uppercase">
                  {cms.aboutTitle || "WHAT IS YOKAIO?"}
                </h2>
                <div className="w-16 h-0.5 bg-brand-gold opacity-60 mt-4" />
              </div>

              {/* Character Details block */}
              <div className="text-sm md:text-base text-zinc-400 font-light leading-relaxed font-sans space-y-4 pt-2">
                {cms.aboutContent.split("\n\n").map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* Highlight quotes box */}
              <div className="border-l-2 border-brand-gold/60 pl-4 py-1.5 italic font-serif text-brand-gold/90 text-sm md:text-base leading-relaxed bg-brand-brown/25 pr-2 rounded-r-lg">
                &ldquo;100 unique anime-inspired characters built for collectors who appreciate strong character design, individuality, and premium digital collectibles.&rdquo;
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. WHITELIST REGISTER FORMS & TASKS SYSTEMS */}
      <WLForm onApplicationSuccess={handleApplicationSuccess} />



      {/* 4. GALLERY PORTFOLIO PANEL */}
      <NFTGallery artworks={gallery} loading={loading} />

      {/* 5. WHITELIST CHECKER SEARCH RADAR */}
      <WLChecker />

      {/* 6. ROADMAP VERTICAL HISTORIC PATHWAY */}
      <Roadmap />

      {/* 7. FAQ ACCORDIONS */}
      <FAQAccordion />

      {/* 8. LUXURY SOCIAL CARDS MATRIX */}
      <section id="socials" className="relative py-28 px-4 border-t border-brand-brown/30 bg-[#050706] z-10">
        <div className="max-w-6xl mx-auto text-center">
          
          {/* Header Title */}
          <div className="mb-16 text-center">
            <p className="font-mono text-xs tracking-[0.5em] text-brand-gold uppercase glow-gold mb-3">Community Hub</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-wider text-brand-cream text-shadow-sm uppercase">
              JOIN THE COMMUNITY
            </h2>
            <div className="w-16 h-0.5 bg-brand-gold mx-auto opacity-50 mt-4" />
            <p className="max-w-md mx-auto text-xs text-zinc-400 mt-4">
              Step into the official channels. Connect with collectors, designers, and alpha contributors.
            </p>
          </div>

          {/* Social cards grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              {
                name: "Twitter / X",
                href: cms.socials.twitter,
                detail: "Official news leaks, artwork reveals & active raffle broadcasts.",
                icon: <Twitter className="w-6 h-6 text-brand-gold" />,
                label: "Follow @YokaioNFT"
              },
              {
                name: "OpenSea Registry",
                href: cms.socials.opensea,
                detail: "Primary marketplace contracts tracking circulation.",
                icon: <ShoppingBag className="w-6 h-6 text-brand-gold" />,
                label: "Inspect OpenSea collection"
              }
            ].map((social, idx) => (
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                key={idx}
                className="group relative border border-brand-brown/30 bg-gradient-to-b from-brand-brown/30 to-brand-black p-6 rounded-2xl shadow-lg hover:border-brand-gold/60 transition-all duration-450 text-left cursor-pointer flex flex-col justify-between min-h-[220px]"
              >
                {/* Glowing backcard outline on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

                <div className="space-y-4">
                  <div className="p-3 bg-brand-black rounded-lg border border-brand-brown/25 w-fit group-hover:border-brand-gold/50 transition-colors">
                    {social.icon}
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-brand-cream group-hover:text-brand-gold transition-colors">{social.name}</h4>
                    <p className="text-xs text-zinc-400 mt-2 font-light leading-relaxed">{social.detail}</p>
                  </div>
                </div>

                <div className="border-t border-brand-brown/10 pt-4 mt-4 flex justify-between items-center text-[10px] font-mono text-zinc-500 group-hover:text-brand-gold transition-colors font-medium">
                  <span className="uppercase tracking-widest">{social.label}</span>
                  <span>&rarr;</span>
                </div>
              </a>
            ))}
          </div>

        </div>
      </section>

      {/* 9. PREMIUM FOOTER */}
      <footer className="relative bg-[#050706] border-t border-brand-brown/40 py-16 px-4 z-10 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="flex flex-col items-center space-y-4">
            <span className="font-serif text-3xl font-black tracking-[0.2em] text-brand-cream glow-gold flex items-center gap-2">
              {cms.heroTitle || "YOKAIO"}
            </span>
            <p className="font-serif tracking-[0.4em] text-[10px] text-brand-gold uppercase font-bold">
              UNLEASH THE SPIRIT WITHIN
            </p>
          </div>

          <div className="w-20 h-px bg-brand-brown/45 mx-auto" />

          {/* Copyright section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-zinc-500 max-w-4xl mx-auto pt-4">
            <p className="uppercase tracking-wider">
              &copy; 2026 YOKAIO. All Rights Reserved. Forged for the bold.
            </p>
            <p className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" /> for Robinhood Collectors
            </p>
          </div>

        </div>
      </footer>

      {/* ADMIN OVERLAY NODE ACCESS ROUTE CONTROL */}
      <AnimatePresence>
        {adminOpen && (
          <AdminPanel 
            onDataRefresh={fetchCoreData}
            cmsData={cms}
            allArtworks={gallery}
            onAdminClose={handleAdminClose}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
