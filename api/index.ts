import { readDB, writeDB, logAction, getUpdatedSettings } from "./db.js";
import { WhitelistApplication, CollectibleNFT } from "./types.js";

// Helper to parse query parameters from the URL
function parseQueryParams(reqUrl: string, reqHeadersHost?: string) {
  const url = new URL(reqUrl || "", `http://${reqHeadersHost || "localhost"}`);
  const queryObj: any = {};
  url.searchParams.forEach((val, key) => {
    queryObj[key] = val;
  });
  return { pathname: url.pathname, query: queryObj };
}

// Handler functions for each route

async function handleCms(req: any, res: any) {
  if (req.method === "GET") {
    try {
      const db = await readDB();
      return res.status(200).json(db.cms);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch CMS content" });
    }
  } else if (req.method === "POST") {
    try {
      const db = await readDB();
      db.cms = { ...db.cms, ...req.body };
      await writeDB(db);
      await logAction("CMS Content Updated", `CMS variables edited (Headline: "${db.cms.heroHeadline}", Supply: ${db.cms.supply})`, "Admin");
      return res.status(200).json({ success: true, cms: db.cms });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update CMS content" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleSettings(req: any, res: any) {
  if (req.method === "GET") {
    try {
      const db = await readDB();
      const settings = getUpdatedSettings(db);
      return res.status(200).json(settings);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch settings" });
    }
  } else if (req.method === "POST") {
    try {
      const db = await readDB();
      const settings = getUpdatedSettings(db);
      db.settings = { ...settings, ...req.body };

      // Also update task-2's externalLink if socialTaskLink is modified
      if (req.body.socialTaskLink && db.tasks) {
        const t2Index = db.tasks.findIndex((t: any) => t.id === "task-2");
        if (t2Index !== -1) {
          db.tasks[t2Index].externalLink = req.body.socialTaskLink;
        }
      }

      // Also update task-3's externalLink if commentTaskLink is modified
      if (req.body.commentTaskLink && db.tasks) {
        const t3Index = db.tasks.findIndex((t: any) => t.id === "task-3");
        if (t3Index !== -1) {
          db.tasks[t3Index].externalLink = req.body.commentTaskLink;
        }
      }

      await writeDB(db);
      await logAction("Settings Updated", `Admin updated settings (Wallet Checker Active: ${db.settings.walletCheckerActive}, Social Link: ${db.settings.socialTaskLink}, Comment Link: ${db.settings.commentTaskLink})`, "Admin");
      return res.status(200).json({ success: true, settings: db.settings });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update settings" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleTimerStart(req: any, res: any) {
  if (req.method === "POST") {
    try {
      const db = await readDB();
      const settings = getUpdatedSettings(db);
      if (!settings.timerActive && settings.timerRemaining > 0) {
        settings.timerActive = true;
        settings.timerEndsAt = Date.now() + settings.timerRemaining * 1000;
        await writeDB(db);
        await logAction("Timer Started", `Whitelist application closing timer started with ${settings.timerRemaining}s remaining.`, "Admin");
      }
      return res.status(200).json(settings);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to start timer" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleTimerPause(req: any, res: any) {
  if (req.method === "POST") {
    try {
      const db = await readDB();
      const settings = getUpdatedSettings(db);
      if (settings.timerActive && settings.timerEndsAt) {
        const remaining = Math.max(0, Math.ceil((settings.timerEndsAt - Date.now()) / 1000));
        settings.timerActive = false;
        settings.timerRemaining = remaining;
        settings.timerEndsAt = null;
        await writeDB(db);
        await logAction("Timer Paused", `Whitelist application closing timer paused at ${remaining}s.`, "Admin");
      }
      return res.status(200).json(settings);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to pause timer" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleTimerReset(req: any, res: any) {
  if (req.method === "POST") {
    try {
      const db = await readDB();
      const settings = getUpdatedSettings(db);
      const duration = req.body.duration !== undefined ? Number(req.body.duration) : 259200; // default 72 hours
      settings.timerActive = false;
      settings.timerDuration = duration;
      settings.timerRemaining = duration;
      settings.timerEndsAt = null;
      await writeDB(db);
      await logAction("Timer Reset", `Whitelist application closing timer reset to ${duration}s.`, "Admin");
      return res.status(200).json(settings);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to reset timer" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleTasks(req: any, res: any) {
  if (req.method === "GET") {
    try {
      const db = await readDB();
      return res.status(200).json(db.tasks || []);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch tasks" });
    }
  } else if (req.method === "POST") {
    try {
      const db = await readDB();
      const updatedTasks = req.body;
      if (Array.isArray(updatedTasks)) {
        db.tasks = updatedTasks;
        await writeDB(db);
        await logAction("Tasks Reconfigured", `Admin updated tasks setup (${updatedTasks.length} total tasks configured)`, "Admin");
        return res.status(200).json({ success: true, tasks: db.tasks });
      }
      return res.status(400).json({ error: "Invalid format. Expected an array of tasks." });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to save tasks" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleApplicationsDownloadCsv(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await readDB();
    const appsList = db.applications || [];

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=yokaio_applications_${new Date().toISOString().slice(0, 10)}.csv`);

    const escapeCSVField = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val);
      const escaped = str.replace(/"/g, '""');
      if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    const headers = ["ID", "X Username", "Wallet Address", "Comment Link", "Reason", "Submission Date", "Status", "Admin Notes"];
    res.write(headers.join(",") + "\r\n");

    for (const app of appsList) {
      const row = [
        escapeCSVField(app.id),
        escapeCSVField(app.xUsername),
        escapeCSVField(app.walletAddress),
        escapeCSVField(app.commentLink),
        escapeCSVField(app.reason),
        escapeCSVField(app.submissionDate),
        escapeCSVField(app.status),
        escapeCSVField(app.adminNotes || "")
      ];
      res.write(row.join(",") + "\r\n");
    }
    res.end();
    await logAction("Applications Exported", `Admin downloaded CSV export of all ${appsList.length} applications`, "Admin");
  } catch (e: any) {
    console.error("Failed to generate CSV download", e);
    if (!res.headersSent) {
      return res.status(500).send("Internal Server Error generating CSV");
    }
  }
}

async function handleSingleApplication(req: any, res: any) {
  const id = (req.query.id || req.params?.id) as string;

  if (!id) {
    return res.status(400).json({ error: "Application ID is required" });
  }

  if (req.method === "PATCH") {
    try {
      const { status, adminNotes } = req.body;
      const db = await readDB();
      const appIndex = db.applications.findIndex((a: any) => a.id === id);

      if (appIndex === -1) {
        return res.status(404).json({ error: "Application not found" });
      }

      const oldStatus = db.applications[appIndex].status;
      db.applications[appIndex].status = status;
      if (adminNotes !== undefined) {
        db.applications[appIndex].adminNotes = adminNotes;
      }

      const application = db.applications[appIndex];

      // Automatically sync with Wallets Database based on Approval status
      const walletIndex = db.wallets.findIndex(
        (w: any) => w.address.toLowerCase() === application.walletAddress.toLowerCase()
      );

      if (status === "Approved") {
        if (walletIndex === -1) {
          db.wallets.push({
            address: application.walletAddress,
            status: "Approved WL",
            username: application.xUsername,
            addedAt: new Date().toISOString(),
            customNote: `Approved via app ${id}`
          });
        } else {
          db.wallets[walletIndex].status = "Approved WL";
        }
      } else if (status === "Waitlisted") {
        if (walletIndex === -1) {
          db.wallets.push({
            address: application.walletAddress,
            status: "Waitlist",
            username: application.xUsername,
            addedAt: new Date().toISOString(),
            customNote: `Added to Waitlist via app ${id}`
          });
        } else {
          db.wallets[walletIndex].status = "Waitlist";
        }
      } else {
        // If status turned into Rejected or remains Pending, remove from wallet DB unless manually created
        if (walletIndex !== -1 && db.wallets[walletIndex].customNote?.includes(id)) {
          db.wallets.splice(walletIndex, 1);
        }
      }

      await writeDB(db);
      await logAction(
        "Application Status Changed", 
        `Application ${id} status updated from ${oldStatus} to ${status}`, 
        "Admin"
      );

      return res.status(200).json({ success: true, application: db.applications[appIndex] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update application" });
    }
  } else if (req.method === "DELETE") {
    try {
      const db = await readDB();
      const appIndex = db.applications.findIndex((a: any) => a.id === id);
      if (appIndex === -1) {
        return res.status(404).json({ error: "Application not found" });
      }

      const deletedApp = db.applications[appIndex];
      db.applications.splice(appIndex, 1);

      // Also remove from wallet database if automatically attached
      const walletIndex = db.wallets.findIndex(
        (w: any) => w.address.toLowerCase() === deletedApp.walletAddress.toLowerCase()
      );
      if (walletIndex !== -1 && db.wallets[walletIndex].customNote?.includes(id)) {
        db.wallets.splice(walletIndex, 1);
      }

      await writeDB(db);
      await logAction("Application Deleted", `Application ID ${id} deleted permanently`, "Admin");
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to delete application" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleApplications(req: any, res: any) {
  if (req.method === "GET") {
    try {
      const db = await readDB();
      let list = db.applications || [];

      // Support summary query for landing page metrics to prevent heavy data transmission
      if (req.query.summary === "true") {
        return res.status(200).json({ count: list.length });
      }

      // Calculate database stats for the admin dashboard before filtering
      const totalCount = list.length;
      const pendingCount = list.filter((a: any) => a.status === "Pending").length;
      const approvedCount = list.filter((a: any) => a.status === "Approved").length;
      const rejectedCount = list.filter((a: any) => a.status === "Rejected").length;
      const waitlistedCount = list.filter((a: any) => a.status === "Waitlisted").length;

      // Apply Search Filter
      const search = req.query.search ? String(req.query.search).trim().toLowerCase() : "";
      if (search) {
        list = list.filter((app: any) => {
          return (
            (app.id || "").toLowerCase().includes(search) ||
            (app.xUsername || "").toLowerCase().includes(search) ||
            (app.walletAddress || "").toLowerCase().includes(search) ||
            (app.reason || "").toLowerCase().includes(search)
          );
        });
      }

      // Apply Status Filter
      const status = req.query.status ? String(req.query.status).trim() : "All";
      if (status && status !== "All") {
        list = list.filter((app: any) => app.status === status);
      }

      // Apply Sorting
      const sortBy = req.query.sortBy ? String(req.query.sortBy).trim() : "submissionDate";
      const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

      list.sort((a: any, b: any) => {
        let valA = a[sortBy] !== undefined ? a[sortBy] : "";
        let valB = b[sortBy] !== undefined ? b[sortBy] : "";

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      // Apply Pagination
      const isAll = req.query.all === "true" || req.query.limit === "-1";
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 50);
      const totalMatched = list.length;
      const totalPages = isAll ? 1 : Math.ceil(totalMatched / limit);
      
      const paginatedList = isAll ? list : list.slice((page - 1) * limit, page * limit);

      return res.status(200).json({
        applications: paginatedList,
        pagination: {
          total: totalMatched,
          page,
          limit,
          totalPages
        },
        stats: {
          total: totalCount,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          waitlisted: waitlistedCount
        }
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch applications" });
    }
  } else if (req.method === "POST") {
    try {
      const { xUsername, walletAddress, commentLink, reason } = req.body;

      // Server-Side Validations
      if (!xUsername || !xUsername.trim()) {
        return res.status(400).json({ error: "X username is required." });
      }
      if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ error: "A valid Ethereum wallet address (0x...) is required." });
      }
      if (!commentLink || !commentLink.trim()) {
        return res.status(400).json({ error: "Proof comment link is required." });
      }
      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({ error: "Please enter a valid reason of at least 10 characters." });
      }

      const db = await readDB();
      const settings = getUpdatedSettings(db);
      if (settings.timerRemaining === 0) {
        return res.status(403).json({ error: "The Whitelist Application period has officially closed." });
      }
      
      // Duplicate Detections
      const cleanWallet = walletAddress.toLowerCase();
      const cleanXUsername = xUsername.toLowerCase().trim();

      const isDuplicateWallet = db.applications.some(
        (app: any) => app.walletAddress.toLowerCase() === cleanWallet
      ) || db.wallets.some(
        (w: any) => w.address.toLowerCase() === cleanWallet
      );

      const isDuplicateX = db.applications.some(
        (app: any) => app.xUsername.toLowerCase().trim() === cleanXUsername
      );

      if (isDuplicateWallet) {
        return res.status(400).json({ error: "This wallet address has already been blacklisted or registered." });
      }
      if (isDuplicateX) {
        return res.status(400).json({ error: "This Twitter/X account has already submitted an application." });
      }

      // Register application
      const appId = `APP-${Math.floor(1000 + Math.random() * 9000)}`;
      const newApp: WhitelistApplication = {
        id: appId,
        xUsername: xUsername.trim().startsWith("@") ? xUsername.trim() : `@${xUsername.trim()}`,
        walletAddress,
        commentLink: commentLink.trim(),
        reason: reason.trim(),
        submissionDate: new Date().toISOString(),
        status: "Pending",
        adminNotes: ""
      };

      db.applications = [newApp, ...db.applications];
      await writeDB(db);

      await logAction(
        "Application Submitted", 
        `New WL applicant registered successfully: ${newApp.xUsername} (${appId})`, 
        newApp.xUsername
      );

      return res.status(200).json({ success: true, application: newApp });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to submit application" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleBulkAction(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action, ids } = req.body; // action: 'approve' | 'reject' | 'delete'
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No applications selected" });
    }

    const db = await readDB();
    let count = 0;

    if (action === "approve") {
      db.applications.forEach((app: any) => {
        if (ids.includes(app.id)) {
          app.status = "Approved";
          count++;
          // sync to wallets
          if (!db.wallets.some((w: any) => w.address.toLowerCase() === app.walletAddress.toLowerCase())) {
            db.wallets.push({
              address: app.walletAddress,
              status: "Approved WL",
              username: app.xUsername,
              addedAt: new Date().toISOString(),
              customNote: `Bulk Approved via ${app.id}`
            });
          }
        }
      });
      await logAction("Bulk Applications Approval", `Bulk approved ${count} application records`, "Admin");
    } else if (action === "reject") {
      db.applications.forEach((app: any) => {
        if (ids.includes(app.id)) {
          app.status = "Rejected";
          count++;
          // remove auto-wallets
          const wlIdx = db.wallets.findIndex((w: any) => w.address.toLowerCase() === app.walletAddress.toLowerCase());
          if (wlIdx !== -1 && db.wallets[wlIdx].customNote?.includes(app.id)) {
            db.wallets.splice(wlIdx, 1);
          }
        }
      });
      await logAction("Bulk Applications Rejection", `Bulk rejected ${count} application records`, "Admin");
    } else if (action === "delete") {
      db.applications = db.applications.filter((app: any) => {
        if (ids.includes(app.id)) {
          count++;
          // remove auto-wallets
          const wlIdx = db.wallets.findIndex((w: any) => w.address.toLowerCase() === app.walletAddress.toLowerCase());
          if (wlIdx !== -1 && db.wallets[wlIdx].customNote?.includes(app.id)) {
            db.wallets.splice(wlIdx, 1);
          }
          return false;
        }
        return true;
      });
      await logAction("Bulk Applications Deletion", `Bulk deleted ${count} application records`, "Admin");
    } else {
      return res.status(400).json({ error: "Invalid action type" });
    }

    await writeDB(db);
    return res.status(200).json({ success: true, updatedCount: count });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Bulk operation failed" });
  }
}

async function handleCheckWallet(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const address = (req.query.address || req.params?.address) as string;

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(200).json({ 
      address, 
      status: "Not Eligible", 
      note: "Search format requires fully qualified 42-char Hex string (0x...)" 
    });
  }

  try {
    const db = await readDB();
    const record = db.wallets.find((w: any) => w.address.toLowerCase() === address.toLowerCase());
    
    if (record) {
      let friendlyStatus = "Approved WL";
      if (record.status === "Priority WL") friendlyStatus = "Priority WL";
      if (record.status === "Waitlist") friendlyStatus = "Waitlist";

      return res.status(200).json({
        address,
        status: friendlyStatus,
        note: record.customNote || "Awakened Generation Spirit"
      });
    }

    // Check if they are in the pending applications queue
    const application = db.applications.find((a: any) => a.walletAddress.toLowerCase() === address.toLowerCase());
    if (application) {
      if (application.status === "Pending") {
        return res.status(200).json({
          address,
          status: "Pending Review",
          note: `Your application is currently being handled under ID: ${application.id}. Stay connected code.`
        });
      }
      if (application.status === "Rejected") {
        return res.status(200).json({
          address,
          status: "Not Eligible",
          note: "This application cycle was discarded or deemed ineligible upon structural view."
        });
      }
    }

    return res.status(200).json({
      address,
      status: "Not Eligible",
      note: "Address did not participate in the current quest or lacks a pre-approved signoff."
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to check wallet" });
  }
}

async function handleSingleWallet(req: any, res: any) {
  const address = (req.query.address || req.params?.address) as string;

  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  if (req.method === "DELETE") {
    try {
      const db = await readDB();
      const initialLen = db.wallets.length;
      
      db.wallets = db.wallets.filter((w: any) => w.address.toLowerCase() !== address.toLowerCase());
      
      if (db.wallets.length < initialLen) {
        await writeDB(db);
        await logAction("Wallet Revoked", `Revoked access record for address ${address}`, "Admin");
        return res.status(200).json({ success: true });
      }
      return res.status(404).json({ error: "Wallet not found in whitelist database." });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to delete wallet" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleWallets(req: any, res: any) {
  if (req.method === "GET") {
    try {
      const db = await readDB();
      return res.status(200).json(db.wallets || []);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch wallets" });
    }
  } else if (req.method === "POST") {
    try {
      const { address, status, username, customNote } = req.body;
      
      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(400).json({ error: "Valid Ethereum wallet address is required." });
      }

      const db = await readDB();
      const cleanAddr = address.toLowerCase();
      const existingIndex = db.wallets.findIndex((w: any) => w.address.toLowerCase() === cleanAddr);

      const payload: any = {
        address,
        status: status || "Approved WL",
        username: username?.trim() || "Manual Intake",
        addedAt: new Date().toISOString(),
        customNote: customNote?.trim() || "Added manually by overseer"
      };

      if (existingIndex !== -1) {
        db.wallets[existingIndex] = { ...db.wallets[existingIndex], ...payload };
        await writeDB(db);
        await logAction("Wallet Modified", `Modified wallet metadata for ${address} (${payload.status})`, "Admin");
        return res.status(200).json({ success: true, wallet: db.wallets[existingIndex], updated: true });
      } else {
        db.wallets.push(payload);
        await writeDB(db);
        await logAction("Wallet Appended", `Manually added ${address} straight to Whitelist database`, "Admin");
        return res.status(200).json({ success: true, wallet: payload, updated: false });
      }
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to save wallet" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleGalleryReorder(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await readDB();
    const { orderedIds } = req.body; // Array of IDs
    if (Array.isArray(orderedIds)) {
      const reordered: CollectibleNFT[] = [];
      orderedIds.forEach((id: number) => {
        const item = db.gallery.find((g: any) => g.id === Number(id));
        if (item) reordered.push(item);
      });
      // Append others that were not in the reordered list just in case
      db.gallery.forEach((g: any) => {
        if (!orderedIds.includes(g.id)) {
          reordered.push(g);
        }
      });
      // Update display order of each according to their index + 1
      reordered.forEach((g: any, index: number) => {
        g.displayOrder = index + 1;
      });
      db.gallery = reordered;
      await writeDB(db);
      await logAction("Gallery Reordered", "Admin adjusted the appearance order of spirit artworks", "Admin");
      return res.status(200).json({ success: true, gallery: db.gallery });
    }
    return res.status(400).json({ error: "Invalid layout." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to reorder gallery" });
  }
}

async function handleGalleryBulk(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await readDB();
    const { ids, action, value } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No artworks selected." });
    }

    if (action === "delete") {
      db.gallery = db.gallery.filter((g: any) => !ids.includes(g.id));
      await logAction("Bulk Art Deletion", `Deleted ${ids.length} artworks from active gallery in bulk`, "Admin");
    } else if (action === "visible") {
      db.gallery = db.gallery.map((g: any) => {
        if (ids.includes(g.id)) {
          g.visible = Boolean(value);
        }
        return g;
      });
      await logAction("Bulk Art Visibility", `Updated visibility status to ${value} for ${ids.length} artworks`, "Admin");
    } else if (action === "featured") {
      db.gallery = db.gallery.map((g: any) => {
        if (ids.includes(g.id)) {
          g.featured = Boolean(value);
        }
        return g;
      });
      await logAction("Bulk Art Feature", `Updated featured status to ${value} for ${ids.length} artworks`, "Admin");
    } else {
      return res.status(400).json({ error: "Unknown action parameter." });
    }

    await writeDB(db);
    return res.status(200).json({ success: true, gallery: db.gallery });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to execute bulk action" });
  }
}

async function handleSingleGallery(req: any, res: any) {
  const idStr = (req.query.id || req.params?.id) as string;
  if (!idStr) {
    return res.status(400).json({ error: "Artwork ID is required" });
  }

  const id = Number(idStr);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Artwork ID must be a number" });
  }

  if (req.method === "DELETE") {
    try {
      const db = await readDB();
      const initialLen = db.gallery.length;

      db.gallery = db.gallery.filter((g: any) => g.id !== id);
      if (db.gallery.length < initialLen) {
        await writeDB(db);
        await logAction("Artwork Deleted", `Removed artwork index #${id} from active gallery portal`, "Admin");
        return res.status(200).json({ success: true });
      }
      return res.status(404).json({ error: "Artwork not found in current collection lists." });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to delete artwork" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleGallery(req: any, res: any) {
  if (req.method === "GET") {
    try {
      const db = await readDB();
      let list = db.gallery || [];

      // Legacy fallback compatibility: if no query parameters, return raw array
      const hasParams = Object.keys(req.query).length > 0;
      if (!hasParams) {
        return res.status(200).json(list);
      }

      // Filter by public view
      const isPublic = req.query.public === "true";
      if (isPublic) {
        list = list.filter((g: any) => g.visible);
      }

      // Apply Search (case insensitive matching on Name, ID or description)
      const search = req.query.search ? String(req.query.search).trim().toLowerCase() : "";
      if (search) {
        list = list.filter((g: any) => {
          return (
            (g.name || "").toLowerCase().includes(search) ||
            String(g.id).includes(search) ||
            (g.description || "").toLowerCase().includes(search)
          );
        });
      }

      // Apply Filter Status (Admin can filter: "All", "Visible", "Hidden", "Featured")
      const filter = req.query.filter ? String(req.query.filter).trim() : "All";
      if (filter === "Visible") {
        list = list.filter((g: any) => g.visible);
      } else if (filter === "Hidden") {
        list = list.filter((g: any) => !g.visible);
      } else if (filter === "Featured") {
        list = list.filter((g: any) => g.featured);
      }

      // Apply Sorting (default to displayOrder asc)
      const sortBy = req.query.sortBy ? String(req.query.sortBy).trim() : "displayOrder";
      const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

      list.sort((a: any, b: any) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      // Pagination
      const isAll = req.query.all === "true" || req.query.limit === "-1";
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 12);
      const totalMatched = list.length;
      const totalPages = isAll ? 1 : Math.ceil(totalMatched / limit);
      
      const paginatedList = isAll ? list : list.slice((page - 1) * limit, page * limit);

      return res.status(200).json({
        artworks: paginatedList,
        pagination: {
          total: totalMatched,
          page,
          limit,
          totalPages
        }
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch gallery" });
    }
  } else if (req.method === "POST") {
    try {
      const db = await readDB();
      const { originalId, ...art } = req.body;
      
      if (!art.name) {
        return res.status(400).json({ error: "Name is a required field." });
      }

      const idToFind = originalId !== undefined ? Number(originalId) : (art.id ? Number(art.id) : null);

      if (idToFind !== null) {
        // Editing
        const idx = db.gallery.findIndex((g: any) => g.id === idToFind);
        if (idx !== -1) {
          db.gallery[idx] = { 
            ...db.gallery[idx], 
            id: art.id !== undefined ? Number(art.id) : db.gallery[idx].id,
            name: art.name,
            image: art.image,
            description: art.description || "",
            characterLore: art.characterLore || "",
            displayOrder: art.displayOrder !== undefined ? Number(art.displayOrder) : db.gallery[idx].displayOrder,
            visible: art.visible !== undefined ? Boolean(art.visible) : db.gallery[idx].visible,
            featured: art.featured !== undefined ? Boolean(art.featured) : db.gallery[idx].featured,
            category: art.category || db.gallery[idx].category || "Fighter",
            rarity: art.rarity || db.gallery[idx].rarity || "Rare"
          };
          await writeDB(db);
          await logAction("Artwork Modified", `Modified artwork details for ${art.name}`, "Admin");
          return res.status(200).json({ success: true, artwork: db.gallery[idx] });
        }
      }

      // Adding dynamic
      const newId = art.id !== undefined ? Number(art.id) : (Math.max(...db.gallery.map((g: any) => Number(g.id)), 0) + 1);
      const defaultImagePath = `/gallery/${String(newId).padStart(3, '0')}.png`;

      const newArt: CollectibleNFT = {
        id: newId,
        name: art.name,
        category: art.category || "Fighter",
        rarity: art.rarity || "Rare",
        image: art.image || defaultImagePath,
        description: art.description || "Freshly awakened Yoakaio collectible spirit.",
        characterLore: art.characterLore || "Awakened by administrator oversight code.",
        displayOrder: art.displayOrder !== undefined ? Number(art.displayOrder) : newId,
        visible: art.visible !== undefined ? Boolean(art.visible) : true,
        featured: art.featured !== undefined ? Boolean(art.featured) : false
      };

      db.gallery.push(newArt);
      await writeDB(db);
      await logAction("Artwork Created", `Added a new spirit candidate to the collection: ${newArt.name}`, "Admin");
      return res.status(200).json({ success: true, artwork: newArt });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to save artwork" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleLogs(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await readDB();
    return res.status(200).json(db.auditLogs || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch audit logs" });
  }
}

async function handleAdminVerify(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "Sameer@786";
    if (password === adminPassword) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, error: "Incorrect password" });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Verification failed" });
  }
}

// Router table
const routes = [
  {
    pattern: /^\/api\/admin\/verify\/?$/,
    handler: handleAdminVerify
  },
  {
    pattern: /^\/api\/cms\/?$/,
    handler: handleCms
  },
  {
    pattern: /^\/api\/settings\/?$/,
    handler: handleSettings
  },
  {
    pattern: /^\/api\/timer\/start\/?$/,
    handler: handleTimerStart
  },
  {
    pattern: /^\/api\/timer\/pause\/?$/,
    handler: handleTimerPause
  },
  {
    pattern: /^\/api\/timer\/reset\/?$/,
    handler: handleTimerReset
  },
  {
    pattern: /^\/api\/tasks\/?$/,
    handler: handleTasks
  },
  {
    pattern: /^\/api\/applications\/download-csv\/?$/,
    handler: handleApplicationsDownloadCsv
  },
  {
    pattern: /^\/api\/applications\/([^\/]+)\/?$/,
    paramNames: ["id"],
    handler: handleSingleApplication
  },
  {
    pattern: /^\/api\/applications\/?$/,
    handler: handleApplications
  },
  {
    pattern: /^\/api\/bulk-action\/?$/,
    handler: handleBulkAction
  },
  {
    pattern: /^\/api\/wallets\/check\/([^\/]+)\/?$/,
    paramNames: ["address"],
    handler: handleCheckWallet
  },
  {
    pattern: /^\/api\/wallets\/([^\/]+)\/?$/,
    paramNames: ["address"],
    handler: handleSingleWallet
  },
  {
    pattern: /^\/api\/wallets\/?$/,
    handler: handleWallets
  },
  {
    pattern: /^\/api\/gallery\/reorder\/?$/,
    handler: handleGalleryReorder
  },
  {
    pattern: /^\/api\/gallery\/bulk\/?$/,
    handler: handleGalleryBulk
  },
  {
    pattern: /^\/api\/gallery\/([^\/]+)\/?$/,
    paramNames: ["id"],
    handler: handleSingleGallery
  },
  {
    pattern: /^\/api\/gallery\/?$/,
    handler: handleGallery
  },
  {
    pattern: /^\/api\/logs\/?$/,
    handler: handleLogs
  }
];

// Single serverless entry point
export default async function handler(req: any, res: any) {
  // CORS Headers support
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-admin-password"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { pathname, query } = parseQueryParams(req.url || "", req.headers?.host);

    // Secure administrative endpoints
    const isPublicGetCms = pathname.match(/^\/api\/cms\/?$/) && req.method === "GET";
    const isPublicGetSettings = pathname.match(/^\/api\/settings\/?$/) && req.method === "GET";
    const isPublicGetTasks = pathname.match(/^\/api\/tasks\/?$/) && req.method === "GET";
    const isPublicGetGallery = pathname.match(/^\/api\/gallery\/?$/) && req.method === "GET";
    const isPublicCheckWallet = pathname.match(/^\/api\/wallets\/check\/([^\/]+)\/?$/) && req.method === "GET";
    const isPublicPostApplication = pathname.match(/^\/api\/applications\/?$/) && req.method === "POST";
    const isPublicGetAppSummary = pathname.match(/^\/api\/applications\/?$/) && req.method === "GET" && query.summary === "true";
    const isVerifyAdmin = pathname.match(/^\/api\/admin\/verify\/?$/) && req.method === "POST";

    const isPublicRoute = 
      isPublicGetCms || 
      isPublicGetSettings || 
      isPublicGetTasks || 
      isPublicGetGallery || 
      isPublicCheckWallet || 
      isPublicPostApplication || 
      isPublicGetAppSummary || 
      isVerifyAdmin;

    if (!isPublicRoute) {
      const clientPassword = req.headers["x-admin-password"] || req.headers["X-Admin-Password"];
      const adminPassword = process.env.ADMIN_PASSWORD || "Sameer@786";
      if (clientPassword !== adminPassword) {
        return res.status(401).json({ error: "Unauthorized. Admin credentials required." });
      }
    }

    // Dynamic routing match
    for (const route of routes) {
      const match = pathname.match(route.pattern);
      if (match) {
        const params: any = {};
        if (route.paramNames) {
          route.paramNames.forEach((name, idx) => {
            params[name] = match[idx + 1];
          });
        }
        req.params = { ...req.params, ...params };
        req.query = { ...query, ...req.query, ...params };
        return await route.handler(req, res);
      }
    }

    return res.status(404).json({ error: `API Route not found: ${pathname}` });
  } catch (error: any) {
    console.error("Router error:", error);
    return res.status(500).json({ error: error.message || "Internal router error" });
  }
}
