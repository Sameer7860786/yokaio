import { supabase } from "./supabase.js";
import { 
  WhitelistApplication, 
  CollectibleNFT, 
  WhitelistTask, 
  CMSContent, 
  WalletRecord, 
  AuditLog 
} from "./types.js";

// Default Seed Data
const DEFAULT_STATE = {
  cms: {
    heroTitle: "YOKAIO",
    heroHeadline: "YOKAIO 👹⚔️",
    heroDescription: "A premium collection of 100 unique anime-inspired characters built for collectors who appreciate strong character design, individuality, and premium digital collectibles.",
    aboutTitle: "WHAT IS YOKAIO?",
    aboutContent: "YOKAIO is a collection of 100 unique anime-inspired characters coming soon on @RobinhoodApp.\n\nFrom elite fighters and tactical hunters to fearless rebels and wandering legends, every YOKAIO is designed to stand out.\n\nEach character brings its own style, identity, and presence.\n\nBuilt for collectors.\n\nCreated for community.\n\nForged for the bold.",
    wlStatus: "Open",
    mintPrice: "TBA",
    mintDate: "TBA",
    supply: 100,
    socials: {
      twitter: "https://x.com/YokaioNFT",
      discord: "https://discord.gg/yokaio",
      website: "https://yokaio.io",
      opensea: "https://opensea.io/collection/yokaio"
    }
  },
  tasks: [
    {
      id: "task-1",
      title: "Follow @YokaioNFT",
      description: "Social Verification",
      buttonLabel: "Follow",
      externalLink: "https://x.com/YokaioNFT",
      active: true,
      type: "x-follow"
    },
    {
      id: "task-2",
      title: "Like & Repost Whitelist Announcement",
      description: "Engagement Task",
      buttonLabel: "Open Post",
      externalLink: "https://x.com/YokaioNFT",
      active: true,
      type: "x-repost"
    },
    {
      id: "task-3",
      title: "Comment your wallet address",
      description: "Registration",
      buttonLabel: "Comment Address",
      externalLink: "https://x.com/YokaioNFT",
      active: true,
      type: "x-comment"
    }
  ],
  gallery: [
    {
      id: 1,
      name: "YOKAIO #001",
      category: "Cyber Ronin",
      rarity: "Legendary",
      image: "/assets/1.png",
      description: "A disciplined cyber ronin with silver-black hair tied in a traditional knot and worn ceremonial robes. Masters ancient techniques enhanced by futuristic precision.",
      characterLore: "Once a guardian of the old world, YOKAIO #001 wanders the fractured cities seeking balance between forgotten traditions and relentless technology. Every movement reflects patience, honor, and unwavering discipline.",
      displayOrder: 1,
      visible: true,
      featured: true
    },
    {
      id: 2,
      name: "YOKAIO #002",
      category: "Tech Operative",
      rarity: "Rare",
      image: "/assets/2.png",
      description: "A phantom tech operative wearing an advanced digital LED mask and sharp formal suit. Blends cybernetic technology with high-class style.",
      characterLore: "Known across the network as a ghost in the machine, YOKAIO #002 moves through the shadows of megacorporations, leaving only a glowing mask and corrupted systems behind.",
      displayOrder: 2,
      visible: true,
      featured: false
    },
    {
      id: 3,
      name: "YOKAIO #003",
      category: "Rebel Genius",
      rarity: "Epic",
      image: "/assets/3.png",
      description: "A rebellious cyber genius with icy blue hair, formal attire, and an arrogant grin. Thrives on chaos while bending digital systems to his will.",
      characterLore: "Feared by security networks and admired by underground hackers, YOKAIO #003 turns every firewall into a playground. His signature smirk is the last thing opponents remember before their systems collapse.",
      displayOrder: 3,
      visible: true,
      featured: false
    },
    {
      id: 4,
      name: "YOKAIO #004",
      category: "Cyber Wanderer",
      rarity: "1/1 Exclusive",
      image: "/assets/4.png",
      description: "A one-of-one cyber wanderer wearing a battle-worn spiked hat, rugged leather jacket, crimson scarf, and carrying his signature boba. Blends post-apocalyptic survival with effortless street style.",
      characterLore: "Unlike every other YOKAIO, #004 exists as a singular legend. Created exclusively for @KontonNFT, this lone drifter roams the forgotten frontiers where technology and chaos collide. He never seeks fame or conflict, yet his presence alone inspires stories across the wastelands. With every sip of boba and every silent step forward, he reminds the world that true legends don't need to announce themselves—they simply exist.",
      displayOrder: 4,
      visible: true,
      featured: true
    }
  ],
  applications: [
    {
      id: "APP-5512",
      xUsername: "@crypto_samurai",
      walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      commentLink: "https://x.com/crypto_samurai/status/178593410293",
      reason: "I have been collecting premium anime character collectibles since 2021. YOKAIO's clean aesthetic and S-grade character design look incredible. I want to represent the Rebels!",
      submissionDate: "2026-06-21T18:44:12.000Z",
      status: "Approved",
      adminNotes: "Active Twitter profile with active involvement in premium character arts. Approved."
    },
    {
      id: "APP-8231",
      xUsername: "@yokai_hunter",
      walletAddress: "0x3Db76920D27ab5DF6eFffB287796d897ef05027a",
      commentLink: "https://x.com/yokai_hunter/status/178229410111",
      reason: "I am a major character art collector. The 100 supply limit makes this exceptionally scarce. Excited to register!",
      submissionDate: "2026-06-22T01:10:45.000Z",
      status: "Pending",
      adminNotes: ""
    },
    {
      id: "APP-1290",
      xUsername: "@sushi_collector",
      walletAddress: "0x2AefDb24849a60e0aFffB287799d897ee0F77cBA",
      commentLink: "https://x.com/sushi_collector/status/178999331122",
      reason: "The art style shown in the teaser looks extremely beautiful. I want to collect one of the first 100 unique characters!",
      submissionDate: "2026-06-22T01:55:00.000Z",
      status: "Pending",
      adminNotes: ""
    }
  ],
  wallets: [
    {
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      status: "Approved WL",
      username: "@crypto_samurai",
      addedAt: "2026-06-21T18:45:00.000Z",
      customNote: "Approved via application APP-5512"
    },
    {
      address: "0x4b78756EC7ab88b098defB751B7401B5f6d89123",
      status: "Priority WL",
      username: "@yokai_shogun",
      addedAt: "2026-06-20T10:00:00.000Z",
      customNote: "Partnership reserve allocation"
    }
  ],
  auditLogs: [
    {
      id: "LOG-INIT",
      timestamp: new Date().toISOString(),
      action: "Database Initialized",
      details: "YOKAIO database generated and loaded successfully with luxury preset items.",
      user: "System"
    }
  ],
  settings: {
    walletCheckerActive: false,
    socialTaskLink: "https://x.com/YokaioNFT",
    commentTaskLink: "https://x.com/YokaioNFT",
    timerActive: false,
    timerDuration: 259200,
    timerRemaining: 259200,
    timerEndsAt: null
  }
};

// Global in-memory cache to support serverless environment fallback and speed up reads
let memoryState: typeof DEFAULT_STATE = { ...DEFAULT_STATE };
let lastFetchedTime = 0;
const CACHE_TTL = 3000; // 3 seconds cache TTL for high-concurrency requests

export async function readDB(): Promise<typeof DEFAULT_STATE> {
  const now = Date.now();
  if (now - lastFetchedTime < CACHE_TTL) {
    return memoryState;
  }

  if (!supabase) {
    console.warn("Supabase client is not initialized. Using memoryState fallback.");
    return memoryState;
  }

  try {
    // 1. Try to read from yokaio_db table (Single document JSON store)
    const { data: docData, error: docError } = await supabase
      .from("yokaio_db")
      .select("data")
      .eq("id", 1)
      .maybeSingle();

    if (!docError && docData && docData.data) {
      memoryState = docData.data;
      lastFetchedTime = now;
      return memoryState;
    }

    // 2. Fallback: Try to read from individual relational tables
    const [cmsRes, tasksRes, galleryRes, appsRes, walletsRes, logsRes] = await Promise.all([
      supabase.from("cms_content").select("*").eq("id", 1).maybeSingle(),
      supabase.from("tasks").select("*").order("displayOrder", { ascending: true }),
      supabase.from("gallery_items").select("*").order("displayOrder", { ascending: true }),
      supabase.from("applications").select("*").order("submissionDate", { ascending: false }),
      supabase.from("wallets").select("*").order("addedAt", { ascending: false }),
      supabase.from("activity_logs").select("*").order("timestamp", { ascending: false }).limit(200)
    ]);

    // Check if at least some relational tables loaded successfully
    const hasAnyRelationalData = cmsRes.data || tasksRes.data || galleryRes.data || appsRes.data || walletsRes.data;

    if (hasAnyRelationalData) {
      const cms = cmsRes.data 
        ? {
            heroTitle: cmsRes.data.heroTitle,
            heroHeadline: cmsRes.data.heroHeadline,
            heroDescription: cmsRes.data.heroDescription,
            aboutTitle: cmsRes.data.aboutTitle,
            aboutContent: cmsRes.data.aboutContent,
            wlStatus: cmsRes.data.wlStatus,
            mintPrice: cmsRes.data.mintPrice,
            mintDate: cmsRes.data.mintDate,
            supply: cmsRes.data.supply,
            socials: cmsRes.data.socials || DEFAULT_STATE.cms.socials
          }
        : DEFAULT_STATE.cms;

      const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : DEFAULT_STATE.tasks;
      const gallery = Array.isArray(galleryRes.data)
        ? galleryRes.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            rarity: item.rarity,
            image: item.image,
            description: item.description,
            characterLore: item.characterLore,
            displayOrder: item.displayOrder || 0,
            visible: item.visible !== undefined ? item.visible : true,
            featured: item.featured !== undefined ? item.featured : false
          }))
        : DEFAULT_STATE.gallery;

      const applications = Array.isArray(appsRes.data) ? appsRes.data : DEFAULT_STATE.applications;
      const wallets = Array.isArray(walletsRes.data) ? walletsRes.data : DEFAULT_STATE.wallets;
      const auditLogs = Array.isArray(logsRes.data)
        ? logsRes.data.map((log: any) => ({
            id: String(log.id),
            timestamp: log.timestamp,
            action: log.action,
            details: log.details,
            user: log.username || "System"
          }))
        : DEFAULT_STATE.auditLogs;

      // Try to read settings from cms_content.settings or similar, or default
      const settings = cmsRes.data && cmsRes.data.settings
        ? cmsRes.data.settings
        : DEFAULT_STATE.settings;

      memoryState = {
        cms,
        tasks,
        gallery,
        applications,
        wallets,
        auditLogs,
        settings
      };
      lastFetchedTime = now;
      return memoryState;
    }

    // 3. Fallback to Memory State if no database table loaded
    return memoryState;
  } catch (error) {
    console.error("Error reading database from Supabase:", error);
    return memoryState;
  }
}

export async function writeDB(data: typeof DEFAULT_STATE): Promise<boolean> {
  memoryState = data;
  lastFetchedTime = Date.now();

  if (!supabase) {
    console.warn("Supabase is not configured. Saving to memory state only.");
    return true;
  }

  try {
    // 1. Write to yokaio_db (Single document JSON store)
    const { error: upsertDocError } = await supabase
      .from("yokaio_db")
      .upsert({ id: 1, data, updated_at: new Date().toISOString() });

    if (upsertDocError) {
      console.warn("Could not write to yokaio_db document store. Trying relational tables...", upsertDocError);
    }

    // 2. Write/Sync to individual relational tables in background to support user dashboards
    // We swallow errors so that if any of these tables don't exist, the rest of the flow does not fail.
    try {
      // Sync CMS Content (with settings stored in a JSON column if they exist, or standard columns)
      await supabase.from("cms_content").upsert({
        id: 1,
        heroTitle: data.cms.heroTitle,
        heroHeadline: data.cms.heroHeadline,
        heroDescription: data.cms.heroDescription,
        aboutTitle: data.cms.aboutTitle,
        aboutContent: data.cms.aboutContent,
        wlStatus: data.cms.wlStatus,
        mintPrice: data.cms.mintPrice,
        mintDate: data.cms.mintDate,
        supply: data.cms.supply,
        socials: data.cms.socials,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {}

    try {
      // Sync Tasks
      if (Array.isArray(data.tasks)) {
        for (const task of data.tasks) {
          await supabase.from("tasks").upsert({
            id: task.id,
            title: task.title,
            description: task.description,
            buttonLabel: task.buttonLabel,
            externalLink: task.externalLink,
            active: task.active,
            type: task.type
          });
        }
      }
    } catch (e) {}

    try {
      // Sync Gallery Items
      if (Array.isArray(data.gallery)) {
        for (const item of data.gallery) {
          await supabase.from("gallery_items").upsert({
            id: item.id,
            name: item.name,
            category: item.category,
            rarity: item.rarity,
            image: item.image,
            description: item.description,
            characterLore: item.characterLore,
            displayOrder: item.displayOrder
          });
        }
      }
    } catch (e) {}

    try {
      // Sync Whitelist Applications
      if (Array.isArray(data.applications)) {
        for (const app of data.applications) {
          await supabase.from("applications").upsert({
            id: app.id,
            xUsername: app.xUsername,
            walletAddress: app.walletAddress,
            commentLink: app.commentLink,
            reason: app.reason,
            submissionDate: app.submissionDate,
            status: app.status,
            adminNotes: app.adminNotes || ""
          });
        }
      }
    } catch (e) {}

    try {
      // Sync Wallets
      if (Array.isArray(data.wallets)) {
        for (const wallet of data.wallets) {
          await supabase.from("wallets").upsert({
            address: wallet.address,
            status: wallet.status,
            username: wallet.username,
            addedAt: wallet.addedAt,
            customNote: wallet.customNote || ""
          });
        }
      }
    } catch (e) {}

    try {
      // Sync Activity Logs
      if (Array.isArray(data.auditLogs) && data.auditLogs.length > 0) {
        const latestLog = data.auditLogs[0];
        await supabase.from("activity_logs").insert({
          action: latestLog.action,
          details: latestLog.details,
          username: latestLog.user || "System",
          timestamp: latestLog.timestamp || new Date().toISOString()
        });
      }
    } catch (e) {}

    return true;
  } catch (error) {
    console.error("Failed to write to Supabase:", error);
    return false;
  }
}

// System Logger Helper
export async function logAction(action: string, details: string, user: string = "System") {
  try {
    const db = await readDB();
    const log: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      user
    };
    db.auditLogs = [log, ...(db.auditLogs || [])].slice(0, 500); // keep max 500 logs
    await writeDB(db);
  } catch (error) {
    console.error("Failed to log action:", error);
  }
}

export function getUpdatedSettings(db: any) {
  if (!db.settings) {
    db.settings = {
      walletCheckerActive: false,
      socialTaskLink: "https://x.com/YokaioNFT",
      commentTaskLink: "https://x.com/YokaioNFT",
      timerActive: false,
      timerDuration: 259200, // 72 hours
      timerRemaining: 259200,
      timerEndsAt: null
    };
    return db.settings;
  }

  // Ensure standard settings
  if (db.settings.walletCheckerActive === undefined) db.settings.walletCheckerActive = false;
  if (db.settings.socialTaskLink === undefined) db.settings.socialTaskLink = "https://x.com/YokaioNFT";
  if (db.settings.commentTaskLink === undefined) db.settings.commentTaskLink = "https://x.com/YokaioNFT";

  // Ensure timer variables
  if (db.settings.timerActive === undefined) db.settings.timerActive = false;
  if (db.settings.timerDuration === undefined) db.settings.timerDuration = 259200;
  if (db.settings.timerRemaining === undefined) db.settings.timerRemaining = db.settings.timerDuration;
  if (db.settings.timerEndsAt === undefined) db.settings.timerEndsAt = null;

  // Process live active timer
  if (db.settings.timerActive && db.settings.timerEndsAt) {
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((db.settings.timerEndsAt - now) / 1000));
    db.settings.timerRemaining = remaining;
    if (remaining === 0) {
      db.settings.timerActive = false;
      db.settings.timerEndsAt = null;
    }
  }

  return db.settings;
}
