import { motion } from "motion/react";
import { Sparkles, Milestone, Compass, Rocket, Award, Network } from "lucide-react";
import { RoadmapPhase } from "../types";

export default function Roadmap() {
  const phases: RoadmapPhase[] = [
    {
      phase: "PHASE 1",
      title: "WHITELIST CAMPAIGN",
      description: "Establishing the entry portal for the first 100 character collectors.",
      status: "Active",
      items: [
        "Launch the official YOKAIO whitelist application website.",
        "Commence premium Twitter/X and community vetting campaigns.",
        "Meticulously review candidates to secure dedicated Web3 collectors.",
        "Begin continuous art previews and high-level character trait leaks."
      ]
    },
    {
      phase: "PHASE 2",
      title: "COMMUNITY REVEALS",
      description: "Highlighting the premium anime character designs and character traits.",
      status: "Next",
      items: [
        "Complete manual validation of the first whitelist allocation slots.",
        "Conduct exclusive interactive AMA chats with the core art coordinators.",
        "Distribute official role credentials and Discord collector ranks.",
        "Coordinate high-fidelity digital arts previews for priority contributors."
      ]
    },
    {
      phase: "PHASE 3",
      title: "MINT LAUNCH",
      description: "Direct deployment of the 100 character collectibles onto the Robinhood platform.",
      status: "Locked",
      items: [
        "Deploy and integrate our highly optimized smart contracts with Robinhood.",
        "Open private Whitelist mint window: guaranteed TBA pricing with exclusive benefits.",
        "Public mint window reserved solely for remaining allocation blocks.",
        "Immediate high-resolution metadata reveal and Robinhood Web3 Wallet support."
      ]
    },
    {
      phase: "PHASE 4",
      title: "HOLDER EXPANSION",
      description: "Delivering continuous benefits and collector status perks.",
      status: "Locked",
      items: [
        "Dynamic collector dashboards tracking active traits and profiles.",
        "Exclusive physical YOKAIO streetwear merchandise and embroidery drops.",
        "Private community voting to influence future character narrative expansions.",
        "Strategic holding rewards and community whitelist invitations for future sets."
      ]
    },
    {
      phase: "PHASE 5",
      title: "THE JOURNEY AHEAD",
      description: "Expanding the YOKAIO universe into cross-media content and gaming styles.",
      status: "Locked",
      items: [
        "Initiate production of official YOKAIO short stories and comic strips.",
        "Partner with elite character-concept curators and digital designers.",
        "Release modular files of characters optimized for digital spaces.",
        "Strategic holder-first physical exhibitions in Tokyo and New York."
      ]
    }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/20 text-green-400 border-green-500/40";
      case "Active":
        return "bg-brand-gold/20 text-brand-gold border-brand-gold/60 shadow-[0_0_10px_rgba(198,255,0,0.3)]";
      case "Next":
        return "bg-amber-950/40 text-amber-500 border-amber-950";
      default:
        return "bg-zinc-900/60 text-zinc-500 border-zinc-805";
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case "PHASE 1":
        return <Milestone className="w-5 h-5 text-brand-gold" />;
      case "PHASE 2":
        return <Compass className="w-5 h-5 text-brand-gold" />;
      case "PHASE 3":
        return <Rocket className="w-5 h-5 text-zinc-500" />;
      case "PHASE 4":
        return <Award className="w-5 h-5 text-zinc-500" />;
      default:
        return <Network className="w-5 h-5 text-zinc-500" />;
    }
  };

  return (
    <section id="roadmap" className="relative py-28 px-4 border-t border-brand-brown/30 bg-brand-black z-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Title Header */}
        <div className="text-center mb-20">
          <p className="font-mono text-xs tracking-[0.5em] text-brand-gold uppercase glow-gold mb-3">LAUNCH Sequence</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-wider text-brand-cream text-shadow-sm mb-4">
            THE JOURNEY
          </h2>
          <div className="w-24 h-0.5 bg-brand-gold mx-auto opacity-60" />
          <p className="max-w-lg mx-auto text-sm text-zinc-400 mt-6 font-light leading-relaxed">
            A systematically structured expansion plan centering entirely on character design, premium media releases, and elite Web3 collector benefits.
          </p>
        </div>

        {/* Timeline structure container */}
        <div className="relative border-l-2 border-brand-brown/25 ml-4 md:ml-32 pl-6 md:pl-12 space-y-16">
          {phases.map((p, index) => (
            <motion.div
              key={p.phase}
              id={`roadmap-phase-${index + 1}`}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Left timeline glowing node indicator */}
              <div className="absolute -left-[35px] md:-left-[59px] top-1.5 w-8 h-8 rounded-full bg-brand-black border-2 border-brand-gold flex items-center justify-center shadow-[0_0_15px_rgba(198,255,0,0.3)] z-10">
                {getPhaseIcon(p.phase)}
              </div>

              {/* Absolute side-tag for Desktop layout */}
              <div className="hidden md:block absolute -left-[180px] top-1.5 w-32 text-right">
                <span className="font-serif font-black tracking-widest text-brand-gold/60 text-lg">
                  {p.phase}
                </span>
                <p className={`text-[10px] font-mono uppercase tracking-[0.2em] font-semibold mt-1 inline-block px-2 py-0.5 border rounded ${getStatusStyle(p.status)}`}>
                  {p.status}
                </p>
              </div>

              {/* Timeline Card details */}
              <div className="bg-[#0b0f0c] border border-brand-brown/40 p-6 md:p-8 rounded-2xl shadow-xl hover:border-brand-gold/40 transition-colors duration-400">
                
                {/* Mobile visible category badge */}
                <div className="flex md:hidden items-center justify-between gap-4 mb-4">
                  <span className="font-serif text-brand-gold font-bold">{p.phase}</span>
                  <span className={`text-[9px] font-mono uppercase tracking-wider font-semibold px-20.5 border rounded-full ${getStatusStyle(p.status)}`}>
                    {p.status}
                  </span>
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="space-y-1.5 text-left">
                    <h3 className="font-serif text-xl md:text-2xl font-bold tracking-wide text-brand-cream">
                      {p.title}
                    </h3>
                    <p className="text-sm text-brand-gold/70 italic font-serif">
                      {p.description}
                    </p>
                  </div>
                </div>

                {/* Sublist bullets */}
                <div className="border-t border-brand-brown/10 pt-4 mt-4 text-left">
                  <p className="font-mono text-[10px] text-zinc-500 tracking-wider mb-3.5 uppercase font-medium">Core Directives:</p>
                  <ul className="space-y-2.5">
                    {p.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-zinc-350 font-light leading-relaxed">
                        <span className="text-brand-gold select-none mt-1 shrink-0 font-bold text-xs">✦</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
