import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CollectibleNFT } from "../types";
import { X, Grid, Sparkles, ChevronDown } from "lucide-react";

interface Props {
  artworks?: CollectibleNFT[];
  loading?: boolean;
}

export default function NFTGallery({}: Props) {
  const [artworksList, setArtworksList] = useState<CollectibleNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeArt, setActiveArt] = useState<CollectibleNFT | null>(null);
  
  // Keep track of broken images to replace with gorgeous fallbacks
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  const ITEMS_PER_PAGE = 12;

  const fetchArtworks = async (pageNum: number, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(`/api/gallery?public=true&page=${pageNum}&limit=${ITEMS_PER_PAGE}`);
      if (res.ok) {
        const data = await res.json();
        const fresh = data.artworks || [];
        setArtworksList(prev => append ? [...prev, ...fresh] : fresh);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error("Failed to load NFT artworks", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchArtworks(1, false);
  }, []);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArtworks(nextPage, true);
    }
  };

  // Safe image render with elegant SVG fallback
  const renderNFTImage = (art: CollectibleNFT, isModal = false) => {
    const isBroken = brokenImages[art.id];
    if (isBroken || !art.image) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-brand-brown/40 to-brand-black flex flex-col items-center justify-center p-6 border border-brand-gold/20 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-brand-gold/60 animate-pulse" />
          </div>
          <p className="font-serif text-brand-cream text-sm tracking-wide font-semibold">{art.name}</p>
          <p className="font-mono text-[9px] text-brand-gold tracking-wider mt-1">YOKAIO #{String(art.id).padStart(3, '0')}</p>
          <p className="text-[10px] text-zinc-500 mt-2 italic font-light">Artwork details saved</p>
        </div>
      );
    }

    return (
      <img
        src={art.image}
        alt={art.name}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => {
          setBrokenImages(prev => ({ ...prev, [art.id]: true }));
        }}
        className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
          isModal ? "" : "group-hover:scale-105"
        }`}
      />
    );
  };

  return (
    <section id="gallery" className="relative py-28 px-4 border-t border-brand-brown/30 bg-[#050706] z-10">
      {/* Premium Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-brown/10 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Gallery Title Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-gold/20 bg-brand-black/40 backdrop-blur-sm mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.3em] text-brand-gold uppercase">PREMIUM SHOWCASE</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider text-brand-cream text-shadow-sm">
            NFT ART GALLERY
          </h2>
          <div className="w-16 h-0.5 bg-brand-gold mx-auto opacity-50 mt-4" />
          <p className="max-w-xl mx-auto text-sm text-zinc-400 mt-6 leading-relaxed font-light">
            An elite showcase of the genesis YOKAIO art collection. Pure digital craftsmanship, individual identities, and striking visual details.
          </p>
        </div>

        {/* Gallery Grid Showcase */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28">
            <div className="w-12 h-12 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-mono text-xs text-brand-gold tracking-[0.2em] uppercase animate-pulse">INITIATING ART PORTAL...</p>
          </div>
        ) : artworksList.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-brand-brown/20 rounded-2xl bg-[#050706] max-w-md mx-auto">
            <Grid className="w-12 h-12 text-brand-gold/40 mx-auto mb-4" />
            <p className="font-serif text-lg text-brand-cream">Art Portal Currently Offline</p>
            <p className="text-xs text-zinc-500 mt-2 font-light">No active artworks are published in the gallery right now.</p>
          </div>
        ) : (
          <div className="space-y-16">
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {artworksList.map((art, index) => (
                  <motion.div
                    key={art.id}
                    id={`nft-card-${art.id}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
                    whileHover={{ y: -6 }}
                    onClick={() => setActiveArt(art)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-b from-brand-brown/20 to-[#050706] border border-brand-brown/20 p-3.5 shadow-2xl transition-all duration-300 hover:border-brand-gold/40 hover:shadow-brand-gold/5"
                  >
                    {/* Glowing effect inside card */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-gold/[0.04] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Image Container with precise frame styling */}
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-black/40 mb-4 border border-brand-brown/25">
                      {renderNFTImage(art)}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                    </div>

                    {/* Card Footer Info: Title and ID */}
                    <div className="space-y-1.5 px-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-serif text-lg text-brand-cream group-hover:text-brand-gold transition-colors duration-300 truncate font-semibold">
                          {art.name}
                        </h3>
                        <span className="font-mono text-xs text-brand-gold/80 bg-brand-gold/5 border border-brand-gold/10 px-2 py-0.5 rounded">
                          #{String(art.id).padStart(3, '0')}
                        </span>
                      </div>
                      
                      {/* Premium Branding Note */}
                      <p className="font-mono text-[9px] text-zinc-500 tracking-wider uppercase group-hover:text-brand-gold/50 transition-colors">
                        YOKAIO GENESIS COLLECTIBLE
                      </p>
                    </div>

                    {/* Sleek slide-up accent on hover */}
                    <div className="border-t border-brand-brown/20 pt-3 mt-3.5 flex justify-between items-center text-[10px] font-mono text-zinc-500 px-1 group-hover:text-brand-gold transition-colors">
                      <span className="tracking-widest">VIEW COLLECTIBLE</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Load More Action */}
            {page < totalPages && (
              <div className="text-center pt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-brown/60 to-brand-black hover:from-brand-gold hover:to-brand-gold text-brand-cream hover:text-black border border-brand-brown/40 hover:border-brand-gold font-serif font-bold tracking-widest text-xs uppercase px-8 py-4 rounded-xl shadow-lg transition-all duration-350 cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-brand-cream border-t-transparent rounded-full animate-spin" />
                      <span>RETRIEVING ARTWORKS...</span>
                    </>
                  ) : (
                    <>
                      <span>LOAD MORE ARTWORKS</span>
                      <ChevronDown className="w-4 h-4 animate-bounce" />
                    </>
                  )}
                </button>
                <p className="text-zinc-650 font-mono text-[10px] mt-3 tracking-wider uppercase">
                  SHOWING {artworksList.length} OF {totalCount} UNIQUE CREATIONS
                </p>
              </div>
            )}
          </div>
        )}

        {/* Cinema-Style Fullscreen Modal View */}
        <AnimatePresence>
          {activeArt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-xl z-55 flex items-center justify-center p-4 md:p-6"
              onClick={() => setActiveArt(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 30 }}
                className="relative max-w-4xl w-full bg-[#050706] border border-brand-gold/40 rounded-2xl shadow-[0_0_80px_rgba(198,255,0,0.15)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  id="modal-close-btn"
                  onClick={() => setActiveArt(null)}
                  className="absolute top-5 right-5 bg-black/80 hover:bg-brand-gold/20 text-brand-cream hover:text-brand-gold p-3 rounded-full z-10 transition-colors border border-brand-gold/10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  
                  {/* Left Side: Premium Artwork Container */}
                  <div className="relative aspect-square md:h-full min-h-[400px] bg-black/40 flex items-center justify-center">
                    {renderNFTImage(activeArt, true)}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050706] via-transparent to-transparent opacity-80 pointer-events-none" />
                    
                    {/* Floating Watermark logo */}
                    <div className="absolute bottom-6 left-6 font-mono text-zinc-400 text-xs pointer-events-none">
                      <p className="text-[9px] tracking-[0.4em] uppercase text-brand-gold">YOKAIO ORIGIN</p>
                      <p className="text-xs font-semibold tracking-widest text-brand-cream uppercase mt-1">GENESIS GALLERY</p>
                    </div>
                  </div>

                  {/* Right Side: Showcase Metadata & Lore */}
                  <div className="p-8 md:p-12 flex flex-col justify-between text-left bg-[#050706]">
                    <div>
                      {/* Meta tracking codes */}
                      <div className="flex items-center gap-3 mb-6 font-mono text-xs">
                        <span className="text-brand-gold font-medium tracking-widest bg-brand-gold/5 border border-brand-gold/10 px-2.5 py-1 rounded">
                          #{String(activeArt.id).padStart(3, "0")}
                        </span>
                        <span className="h-4 w-px bg-brand-brown/30" />
                        <span className="text-zinc-500 tracking-wider">INDEX PORTAL</span>
                      </div>

                      {/* Display Headings */}
                      <h3 className="font-serif text-3xl md:text-4xl font-bold tracking-wider text-brand-cream border-b border-brand-brown/15 pb-4 mb-6">
                        {activeArt.name}
                      </h3>

                      {/* Character Summary */}
                      {activeArt.description && (
                        <p className="font-serif italic text-base text-brand-cream/90 mb-6 leading-relaxed">
                          &ldquo;{activeArt.description}&rdquo;
                        </p>
                      )}

                      {/* Ancient Myth Lore text */}
                      {activeArt.characterLore && (
                        <div className="space-y-3 text-sm text-zinc-400 leading-relaxed font-light">
                          <p className="text-[10px] uppercase font-mono text-brand-gold tracking-[0.25em] font-semibold">THE CHRONICLE</p>
                          <p className="max-h-[160px] overflow-y-auto pr-2 font-light text-zinc-300">
                            {activeArt.characterLore}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom branding footer */}
                    <div className="border-t border-brand-brown/15 pt-8 mt-8 flex justify-between items-center text-xs text-zinc-500">
                      <div>
                        <p className="font-mono text-[9px] text-zinc-550 tracking-widest uppercase">DESIGN STANDARD</p>
                        <p className="font-serif text-brand-cream font-semibold mt-0.5 tracking-wider">GENESIS EDITION</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[9px] text-zinc-650 tracking-widest uppercase">EDITION SIZE</p>
                        <p className="font-serif text-brand-gold font-medium mt-0.5">1 OF 1 UNIQUE</p>
                      </div>
                    </div>

                  </div>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
