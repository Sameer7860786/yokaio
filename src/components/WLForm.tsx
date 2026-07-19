import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Twitter, 
  MessageSquare, 
  CheckCircle, 
  Circle, 
  Sparkles, 
  User, 
  Wallet, 
  Link as LinkIcon, 
  HelpCircle, 
  Flame, 
  ExternalLink,
  Users
} from "lucide-react";
import { WhitelistTask, WhitelistApplication } from "../types";

interface Props {
  onApplicationSuccess: (app: WhitelistApplication) => void;
}

export default function WLForm({ onApplicationSuccess }: Props) {
  // Live dynamic tasks loaded from backend
  const [tasks, setTasks] = useState<WhitelistTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [timerActive, setTimerActive] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  
  // Whitelist Form Fields State
  const [xUsername, setXUsername] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [commentLink, setCommentLink] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successApp, setSuccessApp] = useState<WhitelistApplication | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchTimerSettings();
  }, []);

  const fetchTimerSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setTimerActive(!!data.timerActive);
        setTimerRemaining(data.timerRemaining !== undefined ? data.timerRemaining : null);
      }
    } catch (error) {
      console.error("Failed to load timer settings", error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timerRemaining !== null && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev === null || prev <= 1) {
            setTimerActive(false);
            if (interval) clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerRemaining]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to load tasks setup", error);
    }
  };

  // Mark task as completed on interaction
  const handleTaskAction = (taskId: string, externalLink: string) => {
    window.open(externalLink, "_blank", "noopener,noreferrer");
    setCompletedTasks(prev => ({ ...prev, [taskId]: true }));
  };

  // Toggle tasks manually by clicking checkbox directly
  const toggleTaskManual = (taskId: string) => {
    setCompletedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const activeTasks = tasks.filter(t => t.active);
  const totalActiveTasks = activeTasks.length || 3;
  const completedCount = activeTasks.filter(t => completedTasks[t.id]).length;
  const isQuestFullyCompleted = completedCount >= totalActiveTasks;

  // Validation rules handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!xUsername.trim()) {
      setFormError("Twitter/X handle is required to verify tasks");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setFormError("Please enter a valid 42-char Robinhood supported wallet starting with 0x");
      return;
    }

    if (!commentLink.trim()) {
      setFormError("Proving tweet link is required");
      return;
    }

    if (!reason.trim() || reason.trim().length < 15) {
      setFormError("State a clear reason (at least 15 characters) for the reviewers");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xUsername,
          walletAddress,
          commentLink,
          reason
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.error || "Registry validation rejected application transmission.");
      } else {
        setSuccessApp(result.application);
        onApplicationSuccess(result.application); // Notify main app to update counts
      }
    } catch (err) {
      setFormError("Lost communication with the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render proper icon per task subclass
  const getTaskIcon = (type: string) => {
    switch (type) {
      case "x-follow":
        return <Twitter className="w-5 h-5 text-brand-gold" />;
      case "x-repost":
        return <Flame className="w-5 h-5 text-brand-gold" />;
      case "x-comment":
        return <MessageSquare className="w-5 h-5 text-brand-gold" />;
      default:
        return <Users className="w-5 h-5 text-brand-gold" />;
    }
  };

  return (
    <section id="whitelist" className="relative py-28 px-4 border-t border-brand-brown/30 bg-brand-black z-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Title Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs tracking-[0.5em] text-brand-gold uppercase glow-gold mb-3">Entrance Trails</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-wider text-brand-cream text-shadow-sm mb-4">
            COMPLETE THE QUEST
          </h2>
          <div className="w-24 h-0.5 bg-brand-gold mx-auto opacity-60" />
          <p className="max-w-xl mx-auto text-sm text-zinc-400 mt-6 font-light leading-relaxed">
            Ensure all requirements are met. Complete the tasks below to unlock the official Whitelist Application portal.
          </p>
        </div>

        {/* Dynamic Countdown clock banner */}
        {timerRemaining !== null && timerRemaining > 0 && (
          <div className="mb-12 max-w-lg mx-auto bg-zinc-950/40 border border-brand-brown/15 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="font-mono text-[10px] text-[#C8A46A] tracking-widest uppercase font-bold flex items-center justify-center sm:justify-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" />
                REGISTRATION ENDING IN
              </span>
              <p className="text-[10px] text-zinc-500 font-light mt-1">Application matrices seal in real-time.</p>
            </div>
            
            <div className="flex items-center gap-1.5 font-mono text-lg font-bold text-brand-cream tracking-widest">
              {(() => {
                const d = Math.floor(timerRemaining / (3600 * 24));
                const h = Math.floor((timerRemaining % (3600 * 24)) / 3600);
                const m = Math.floor((timerRemaining % 3600) / 60);
                const s = timerRemaining % 60;
                
                const dStr = String(d).padStart(2, "0");
                const hStr = String(h).padStart(2, "0");
                const mStr = String(m).padStart(2, "0");
                const sStr = String(s).padStart(2, "0");
                
                return (
                  <>
                    <span className="bg-[#050505] px-2.5 py-1 border border-brand-brown/15 rounded text-brand-cream">{dStr}d</span>
                    <span className="text-brand-gold font-normal animate-pulse">:</span>
                    <span className="bg-[#050505] px-2.5 py-1 border border-brand-brown/15 rounded text-brand-cream">{hStr}h</span>
                    <span className="text-brand-gold font-normal animate-pulse">:</span>
                    <span className="bg-[#050505] px-2.5 py-1 border border-brand-brown/15 rounded text-brand-cream">{mStr}m</span>
                    <span className="text-brand-gold font-normal animate-pulse">:</span>
                    <span className="bg-[#050505] px-2.5 py-1 border border-brand-brown/15 rounded text-brand-gold">{sStr}s</span>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Tasks Board in Elegant Dark pattern */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#050706] border border-brand-gold/30 p-6 md:p-8 shadow-2xl shadow-black relative overflow-hidden">
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-2xl font-serif font-bold uppercase italic text-brand-cream">Quest Progress</h3>
                <span className="text-brand-gold text-sm font-bold tracking-widest font-mono">
                  {completedCount} / {totalActiveTasks} COMPLETE
                </span>
              </div>

              {/* Progress Bar of Elegant Dark */}
              <div className="w-full h-1 bg-brand-brown mb-8 relative">
                <motion.div 
                  className="absolute left-0 top-0 h-full bg-brand-gold shadow-[0_0_15px_#C6FF00]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / totalActiveTasks) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Tasks List */}
              <div className="space-y-6">
                {(activeTasks.length > 0 ? activeTasks : [
                  { id: "task-1", title: "Follow @YokaioNFT", description: "Social Verification", buttonLabel: "Follow", externalLink: "#", type: "x-follow" },
                  { id: "task-2", title: "Repost Announcement", description: "Engagement Task", buttonLabel: "Open Post", externalLink: "#", type: "x-repost" },
                  { id: "task-3", title: "Comment Wallet Address", description: "Registration", buttonLabel: "Comment", externalLink: "#", type: "x-comment" }
                ] as any[]).map((task) => {
                  const isDone = !!completedTasks[task.id];
                  return (
                    <div 
                      key={task.id}
                      className={`flex items-center justify-between gap-4 transition-all duration-300 ${
                        isDone ? "opacity-100" : "opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Diamond rotate bullet button */}
                        <button
                          type="button"
                          onClick={() => toggleTaskManual(task.id)}
                          className="w-6 h-6 border border-brand-gold/40 flex items-center justify-center rotate-45 shrink-0 transition-all hover:border-brand-gold"
                        >
                          {isDone && (
                            <div className="w-2.5 h-2.5 bg-brand-gold rounded-full rotate-[-45deg]" />
                          )}
                        </button>
                        
                        <div className="text-left flex-1 min-w-0">
                          <p className={`text-sm font-semibold tracking-wide text-brand-cream truncate ${isDone ? "line-through text-zinc-550" : ""}`}>
                            {task.title}
                          </p>
                          <p className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono truncate mt-0.5">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleTaskAction(task.id, task.externalLink)}
                        className={`px-4 py-1 text-[10px] border uppercase tracking-widest transition-all font-mono font-bold font-semibold shrink-0 cursor-pointer ${
                          isDone
                            ? "bg-transparent border-zinc-800 text-zinc-550"
                            : "border-brand-gold/30 text-brand-gold hover:bg-brand-gold hover:text-black"
                        }`}
                      >
                        {task.buttonLabel.split(" ")[0]}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-brand-gold/10 text-center">
                <p className="text-[11px] text-brand-cream/40 uppercase tracking-widest leading-relaxed">
                  Complete all tasks to unlock the <br/> submission portal below.
                </p>
              </div>

            </div>
          </div>

          {/* Right Column: Dynamic Form Space */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {successApp ? (
                /* Application Success state */
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-[#112415] border-2 border-green-500/50 p-8 rounded-2xl shadow-3xl text-left"
                >
                  <div className="flex items-center gap-4 mb-6 border-b border-green-700/30 pb-4">
                    <div className="p-3 bg-green-500/20 text-green-400 rounded-full">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] tracking-widest text-brand-gold uppercase font-bold">SUBMISSION RECEIVED</p>
                      <h4 className="font-serif text-2xl font-bold text-green-400">APPLICATION REGISTERED</h4>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-sm font-light leading-relaxed mb-6">
                    Your records have been successfully logged. Your application is now stored in the database. The team will cross-verify your Twitter tasks and submitted wallet address in due course.
                  </p>

                  <div className="bg-black/40 border border-green-800/30 p-5 rounded-xl font-mono text-xs space-y-3.5 text-brand-cream">
                    <div className="flex justify-between border-b border-brand-cream/5 pb-2">
                      <span className="text-zinc-550">APPLICATION ID:</span>
                      <span className="text-brand-gold font-bold">{successApp.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-cream/5 pb-2">
                      <span className="text-zinc-550">X DISCOVERY:</span>
                      <span>{successApp.xUsername}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-cream/5 pb-2">
                      <span className="text-zinc-550">ETH REGISTER:</span>
                      <span className="text-brand-gold truncate max-w-[200px] sm:max-w-none">{successApp.walletAddress}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-cream/5 pb-2">
                      <span className="text-zinc-550">PROOF ANCHOR:</span>
                      <a href={successApp.commentLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-[150px] sm:max-w-none flex items-center gap-1.5">
                        Open Proof <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-550">CURRENT STATE:</span>
                      <span className="px-2 py-0.5 bg-amber-950/80 text-amber-500 border border-amber-500/30 rounded text-[10px] uppercase font-bold animate-pulse">
                        {successApp.status} Review
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 font-light mt-6 italic text-center">
                    Keep your wallet connected and stay close to official notifications. Check your status anytime in the Whitelist Checker above.
                  </p>
                </motion.div>
              ) : timerRemaining === 0 ? (
                /* Whitelist Ended / Closed State */
                <motion.div
                  key="timer-expired-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-[#1A0D0D] border border-red-500/30 p-8 text-center shadow-3xl"
                >
                  <div className="w-12 h-12 border border-red-500/40 rotate-45 flex items-center justify-center text-red-500 mx-auto mb-8 relative">
                    <HelpCircle className="w-5 h-5 -rotate-45 animate-pulse" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-red-500 tracking-wider uppercase mb-1">
                    Admissions Terminated
                  </h3>
                  <p className="font-mono text-[9px] tracking-widest text-[#C8A46A] uppercase font-bold mb-4">
                    WHITELIST REGISTRATION CLOSED
                  </p>
                  <p className="text-zinc-400 text-xs font-light leading-relaxed mb-6 max-w-sm mx-auto font-sans">
                    The countdown chronometer has reached zero. The registration matrices are now officially locked, preventing any subsequent applications from being registered.
                  </p>
                  <div className="inline-flex gap-2 items-center bg-red-950/25 text-red-400 font-mono text-[10px] tracking-widest uppercase border border-red-900/35 px-4 py-2 rounded">
                    <span>Status:</span>
                    <span className="font-black">Submissions Closed</span>
                  </div>
                </motion.div>
              ) : isQuestFullyCompleted ? (
                /* Unlocked Whitelist Application form */
                <motion.div
                  key="unlocked-form"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#050706] border border-brand-gold p-6 md:p-8 text-left shadow-2xl shadow-black"
                >
                  <div className="border-b border-brand-gold/20 pb-4 mb-6">
                    <p className="font-mono text-[9px] tracking-[0.25em] text-brand-gold flex items-center gap-1 font-bold">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" /> APPLICATION ACCESS UNLOCKED
                    </p>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-brand-cream tracking-wider uppercase mt-1">
                      WHITELIST APPLICATION
                    </h3>
                  </div>

                  {formError && (
                    <p className="bg-red-950/40 border border-red-900/30 text-red-400 font-mono text-xs px-4 py-3 mb-6">
                      ✦ {formError}
                    </p>
                  )}

                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    {/* Twitter Handle */}
                    <div>
                      <label htmlFor="xUsername" className="block text-xs font-mono tracking-widest text-brand-gold uppercase mb-1.5 font-semibold">
                        X / Twitter username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          id="xUsername"
                          value={xUsername}
                          onChange={(e) => setXUsername(e.target.value)}
                          placeholder="@yournickname"
                          className="w-full bg-black text-brand-cream placeholder-zinc-650 font-sans text-sm border border-brand-gold/20 pl-10 pr-4 py-3.5 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/40 transition-shadow"
                          required
                        />
                      </div>
                    </div>

                    {/* Robinhood Wallet */}
                    <div>
                      <label htmlFor="walletAddress" className="block text-xs font-mono tracking-widest text-brand-gold uppercase mb-1.5 font-semibold">
                        Robinhood Wallet Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          id="walletAddress"
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          placeholder="0x..."
                          className="w-full bg-black text-brand-cream placeholder-zinc-650 font-mono text-sm border border-brand-gold/20 pl-10 pr-4 py-3.5 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/40 transition-shadow"
                          required
                        />
                      </div>
                    </div>

                    {/* Comment Link URL */}
                    <div>
                      <label htmlFor="commentLink" className="block text-xs font-mono tracking-widest text-brand-gold uppercase mb-1.5 font-semibold">
                        Twitter comment Proof URL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <LinkIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="url"
                          id="commentLink"
                          value={commentLink}
                          onChange={(e) => setCommentLink(e.target.value)}
                          placeholder="Paste your comment URL"
                          className="w-full bg-black text-brand-cream placeholder-zinc-650 font-sans text-sm border border-brand-gold/20 pl-10 pr-4 py-3.5 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/40"
                          required
                        />
                      </div>
                    </div>

                    {/* Reason statement */}
                    <div>
                      <label htmlFor="reason" className="block text-xs font-mono tracking-widest text-brand-gold uppercase mb-1.5 font-semibold">
                        Why do you want to collect YOKAIO?
                      </label>
                      <textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        placeholder="Tell us why you want to collect one of the 100 unique YOKAIO characters..."
                        className="w-full bg-black text-brand-cream placeholder-zinc-650 font-sans text-sm border border-brand-gold/20 px-4 py-3.5 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/40"
                        minLength={15}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full font-mono font-bold tracking-widest text-sm uppercase bg-brand-gold text-black py-4.5 cursor-pointer hover:brightness-110 transition-all flex items-center justify-center gap-2 border border-brand-gold"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          SUBMITTING APPLICATION...
                        </>
                      ) : (
                        "Apply For Whitelist"
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                /* Locked form state placeholder in Elegant Dark rules */
                <motion.div
                  key="locked-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#050706] border border-dashed border-brand-gold/30 p-8 flex flex-col items-center justify-center min-h-[450px] text-center shadow-2xl"
                >
                  <div className="w-12 h-12 border border-brand-gold/40 rotate-45 flex items-center justify-center text-brand-gold mb-8 relative">
                    <HelpCircle className="w-5 h-5 -rotate-45 animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold tracking-wider text-brand-cream uppercase italic">
                    PORTAL IS LOCKED
                  </h3>
                  
                  <p className="max-w-md text-zinc-400 text-xs mt-4 leading-relaxed font-sans">
                    The registration form is currently locked. Complete all <span className="text-brand-gold font-mono font-bold">{totalActiveTasks} tasks</span> in the progress panel above to unlock high-priority whitelist access.
                  </p>

                  <div className="mt-8 flex gap-3 text-[11px] font-mono uppercase tracking-widest">
                    <span className="text-zinc-600">STATE:</span>
                    <span className="text-brand-gold font-bold">AWAITING TASK COMPLETION</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
