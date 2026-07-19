import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQItem } from "../types";

export default function FAQAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: "faq-1",
      question: "What is YOKAIO?",
      answer: "YOKAIO is a premium, character-focused anime art collection of 100 unique digital masterpieces on Robinhood. The gallery consists of elite fighters, hunters, mercenaries, outcasts, and legends with distinct personalities, styles, professions, and stories built specifically for collectors."
    },
    {
      id: "faq-2",
      question: "What blockchain is it on?",
      answer: "The entire collection is anchored on the Robinhood platform, utilizing highly optimized integrations to guarantee secure, high-end digital ownership."
    },
    {
      id: "faq-3",
      question: "How many NFTs exist?",
      answer: "To ensure absolute scarcity and select community curation, the total supply is strictly capped at exactly 100 character NFTs. No additional editions or genesis tokens will ever be minted."
    },
    {
      id: "faq-4",
      question: "How do I get whitelist?",
      answer: "Whitelist applicants must complete the active social verification tasks (follow Twitter/X, repost official annoucements, comment address, and join Discord). Once complete, you may fill out the application statement for manual review."
    },
    {
      id: "faq-5",
      question: "When is mint?",
      answer: "The mint launching date is TBA. Whitelist approved lists will receive exclusive guaranteed allocation times. All parameters and countdown schedules will be shared exclusively on our official Twitter and Discord channels."
    },
    {
      id: "faq-6",
      question: "How will applications be reviewed?",
      answer: "Each application is vetted manually by the team. We assess community involvement, character collector alignment, and genuine long-term project interest. Spams, bots, or duplicate applications will be automatically flagged and rejected."
    }
  ];

  return (
    <section id="faq" className="relative py-28 px-4 border-t border-brand-brown/30 bg-[#050706] z-10">
      
      {/* Decorative center element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />

      <div className="max-w-4xl mx-auto">
        
        {/* Title Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs tracking-[0.5em] text-brand-gold uppercase glow-gold mb-3">GET COMMITTED</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-wider text-brand-cream text-shadow-sm mb-4">
            FREQUENT QUESTIONS
          </h2>
          <div className="w-16 h-0.5 bg-brand-gold mx-auto opacity-50" />
          <p className="max-w-md mx-auto text-xs text-zinc-400 mt-4 leading-relaxed">
            Consolidated answers and essential reference details for the YOKAIO whitelist process.
          </p>
        </div>

        {/* Collapsible Accordions List */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div 
                key={faq.id}
                id={`faq-accordion-${faq.id}`}
                className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? "bg-[#0b0f0c] border-brand-gold shadow-[0_0_15px_rgba(198,255,0,0.1)]" 
                    : "bg-brand-brown/10 border-brand-brown/25 hover:border-brand-gold/45"
                }`}
              >
                {/* Trigger Button bar */}
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full text-left px-5 py-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="font-serif font-bold text-sm md:text-base text-brand-cream hover:text-brand-gold transition-colors flex items-center gap-2.5">
                    <HelpCircle className={`w-4 h-4 text-brand-gold shrink-0 ${isOpen ? "animate-spin" : ""}`} style={{ animationDuration: '4s' }} />
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-brand-gold shrink-0"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.span>
                </button>

                {/* Content Panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-zinc-400 font-light leading-relaxed border-t border-brand-brown/10 pl-11 text-left">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
