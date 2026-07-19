import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Sparkles, ShieldCheck, FileClock, ShieldAlert, CheckCircle2 } from "lucide-react";
import { WalletCheckState } from "../types";

export default function WLChecker() {
  const [address, setAddress] = useState("");
  const [statusResult, setStatusResult] = useState<WalletCheckState | null>(null);
  const [checking, setChecking] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setIsActive(!!data.walletCheckerActive);
      }
    } catch (e) {
      console.error("Failed to fetch site settings", e);
    }
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    
    const cleanAddr = address.trim();
    if (!cleanAddr) {
      setErrorText("Provide a valid wallet address to search the checker");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddr)) {
      setErrorText("Robinhood supported address must be a valid 42-character hex (0x...)");
      return;
    }

    setChecking(true);
    try {
      const res = await fetch(`/api/wallets/check/${cleanAddr}`);
      if (!res.ok) throw new Error("Connection broken");
      const data: WalletCheckState = await res.json();
      setStatusResult(data);
    } catch (err) {
      setErrorText("Failed to contact verification service. Check network connection.");
    } finally {
      setChecking(false);
    }
  };

  const getResultStyle = (status: string) => {
    switch (status) {
      case "Approved WL":
        return {
          cardBg: "from-[#112415] to-[#0A0A0A] border-green-500/50 shadow-[0_0_25px_rgba(34,197,94,0.15)]",
          glowText: "text-green-400 font-serif",
          icon: <ShieldCheck className="w-12 h-12 text-green-400" />,
          title: "APPROVED WHITELIST",
          desc: "Your address has been signed and approved inside the official YOKAIO collection whitelist."
        };
      case "Priority WL":
        return {
          cardBg: "from-[#2A1D0E] to-[#0A0A0A] border-brand-gold shadow-[0_0_25px_rgba(200,164,106,0.30)]",
          glowText: "text-brand-gold font-serif font-bold",
          icon: <Sparkles className="w-12 h-12 text-brand-gold animate-spin" style={{ animationDuration: '6s' }} />,
          title: "PRIORITY CHAMPION WHITELIST (OG)",
          desc: "You belong to the OG elite class. Guaranteed priority mint privilege unlocked."
        };
      case "Waitlist":
        return {
          cardBg: "from-[#1A182E] to-[#0A0A0A] border-indigo-500/50 shadow-[0_0_25px_rgba(99,102,241,0.15)]",
          glowText: "text-indigo-400 font-serif",
          icon: <FileClock className="w-12 h-12 text-indigo-400" />,
          title: "STANDBY WAITLIST",
          desc: "Your application resides on standby. In the event of vacant allocation slots, you will be queued next."
        };
      case "Pending Review":
        return {
          cardBg: "from-[#1B1B1B] to-[#0A0A0A] border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
          glowText: "text-amber-400 font-serif",
          icon: <FileClock className="w-12 h-12 text-amber-400" />,
          title: "PENDING APPLICATION REVIEW",
          desc: "Your application is currently logged. Art and development reviews are vetting your submitted items."
        };
      default:
        return {
          cardBg: "from-[#1F0D0D] to-[#0A0A0A] border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)]",
          glowText: "text-red-400 font-serif",
          icon: <ShieldAlert className="w-12 h-12 text-red-400" />,
          title: "NOT ELIGIBLE YET",
          desc: "This address is not on the whitelist. Please complete the tasks and apply below."
        };
    }
  };

  return (
    <section id="checker" className="relative py-28 px-4 border-t border-brand-brown/30 bg-[#050706] z-10 overflow-hidden">
      
      {/* Decorative runic design borders */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />

      <div className={`max-w-3xl mx-auto text-center transition-all duration-500 ${!isActive ? "filter blur-md select-none pointer-events-none opacity-30" : ""}`}>
        
        {/* Title Header */}
        <div className="mb-12">
          <p className="font-mono text-xs tracking-[0.5em] text-brand-gold uppercase glow-gold mb-3">LIST REGISTER SEARCH</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-wider text-brand-cream text-shadow-sm mb-4">
            WHITELIST CHECKER
          </h2>
          <div className="w-16 h-0.5 bg-brand-gold mx-auto opacity-50" />
          <p className="max-w-md mx-auto text-xs text-zinc-400 mt-4 leading-relaxed">
            Verify if your digital wallet address has been mapped or approved to mint one of the 100 YOKAIO.
          </p>
        </div>

        {/* Input box form */}
        <div className="bg-[#0b0f0c] border border-brand-brown/40 p-6 md:p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto">
          <form onSubmit={handleCheck} className="space-y-4">
            <div className="text-left">
              <label htmlFor="address-check" className="block text-xs font-mono tracking-widest text-brand-gold uppercase mb-2 font-semibold">
                ROBINHOOD SUPPORTED WALLET ADDRESS
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="address-check"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter 0x... wallet address"
                  className="w-full bg-black text-brand-cream placeholder-zinc-600 font-mono text-sm border border-brand-brown/40 rounded-xl pl-10 pr-4 py-4 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/40 transition-all"
                />
              </div>
            </div>

            {errorText && (
              <p className="text-xs text-red-400 font-mono text-left bg-red-950/40 border border-red-900/30 px-3.5 py-2.5 rounded-lg animate-pulse">
                ✦ {errorText}
              </p>
            )}

            <button
              type="submit"
              disabled={checking}
              className="w-full font-serif text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-brand-brown via-brand-gold to-brand-brown text-black py-4 rounded-xl cursor-pointer hover:shadow-[0_0_20px_rgba(198,255,0,0.3)] transition-all flex items-center justify-center gap-2 border border-brand-gold/40"
            >
              {checking ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  QUERYING CODES...
                </>
              ) : (
                "CHECK APPLICATION STATUS"
              )}
            </button>
          </form>

          {/* Checker active results panels */}
          <AnimatePresence mode="wait">
            {statusResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`mt-8 border-2 rounded-xl bg-gradient-to-b p-6 text-left ${getResultStyle(statusResult.status).cardBg}`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="p-3 bg-black/60 rounded-xl border border-brand-brown/20 shrink-0">
                    {getResultStyle(statusResult.status).icon}
                  </div>
                  
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="font-mono text-[10px] tracking-widest text-brand-gold uppercase">REGISTRY SCAN COMPLETED</p>
                    <h3 className={`text-xl font-bold tracking-wide ${getResultStyle(statusResult.status).glowText}`}>
                      {getResultStyle(statusResult.status).title}
                    </h3>
                    <p className="text-sm text-zinc-300 font-light leading-relaxed">
                      {getResultStyle(statusResult.status).desc}
                    </p>
                  </div>
                </div>

                <div className="border-t border-brand-brown/15 pt-4 mt-5 flex flex-wrap gap-4 justify-between items-center text-xs text-zinc-500 font-mono">
                  <div className="truncate pr-4 flex-1">
                    <span className="text-zinc-600">ADDRESS:</span> {statusResult.address}
                  </div>
                  <div>
                    <span className="text-zinc-600">TRANSIT:</span> {statusResult.note || "NATIVE RESOLUTION"}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Coming Soon Overlay */}
      {!isActive && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[5px] z-20 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#120F0D] border border-brand-gold/40 p-8 md:p-10 rounded-2xl shadow-2xl max-w-md mx-auto">
            <p className="font-mono text-xs tracking-[0.5em] text-brand-gold uppercase glow-gold mb-3">ACCESS SEALED</p>
            <h3 className="font-serif text-3xl font-bold tracking-wider text-brand-cream text-shadow-sm mb-4">
              COMING SOON
            </h3>
            <div className="w-16 h-0.5 bg-brand-gold mx-auto opacity-50 mb-4" />
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              The official Whitelist verification radar is currently offline. Verification protocols will initiate once the recruitment phase closes.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
