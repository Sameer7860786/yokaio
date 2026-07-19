import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Settings, 
  Database, 
  Image, 
  HelpCircle, 
  Layers, 
  SlidersHorizontal,
  Flame,
  Check, 
  X, 
  Trash2, 
  Save, 
  Edit, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  ExternalLink, 
  Copy, 
  BarChart3,
  BookOpen,
  Eye,
  LogOut,
  Sliders,
  Sparkles,
  ClipboardCheck,
  ShieldCheck,
  Clock,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { 
  WhitelistApplication, 
  CollectibleNFT, 
  WhitelistTask, 
  FAQItem, 
  CMSContent, 
  WalletRecord, 
  AuditLog 
} from "../types";
import { supabase } from "../lib/supabase";

interface Props {
  onDataRefresh: () => void;
  cmsData: CMSContent;
  allArtworks: CollectibleNFT[];
  onAdminClose: () => void;
}

export default function AdminPanel({ onDataRefresh, cmsData, allArtworks, onAdminClose }: Props) {
  // Authentication states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Subsections Navigation
  const [activeTab, setActiveTab] = useState<"dashboard" | "applications" | "wallets" | "tasks" | "cms" | "gallery" | "audit">("dashboard");

  // Core Data caches
  const [applications, setApplications] = useState<WhitelistApplication[]>([]);
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
  
  // Application list pagination, search, filter and sort states
  const [appSearch, setAppSearch] = useState("");
  const [appStatus, setAppStatus] = useState("All");
  const [appSortBy, setAppSortBy] = useState("submissionDate");
  const [appSortOrder, setAppSortOrder] = useState<"asc" | "desc">("desc");
  const [appPage, setAppPage] = useState(1);
  const [appLimit, setAppLimit] = useState(15);
  const [appTotal, setAppTotal] = useState(0);
  const [appPages, setAppPages] = useState(1);
  const [appStats, setAppStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    waitlisted: 0
  });

  // Settings states
  const [walletCheckerActive, setWalletCheckerActive] = useState(false);
  const [socialTaskLink, setSocialTaskLink] = useState("https://x.com/YokaioNFT");
  const [commentTaskLink, setCommentTaskLink] = useState("https://x.com/YokaioNFT");
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(259200);
  const [timerRemaining, setTimerRemaining] = useState(259200);
  const [timerInputHours, setTimerInputHours] = useState("72");
  const [tasks, setTasks] = useState<WhitelistTask[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [cms, setCms] = useState<CMSContent>(cmsData);
  const [gallery, setGallery] = useState<CollectibleNFT[]>(allArtworks);

  // States: View single application detail modal
  const [viewingApp, setViewingApp] = useState<WhitelistApplication | null>(null);
  const [appNotes, setAppNotes] = useState("");

  // States: Manual Wallet add/edit
  const [newWalletAddr, setNewWalletAddr] = useState("");
  const [newWalletStatus, setNewWalletStatus] = useState<'Approved WL' | 'Priority WL' | 'Waitlist'>("Approved WL");
  const [newWalletUser, setNewWalletUser] = useState("");
  const [newWalletNote, setNewWalletNote] = useState("");
  const [walletSearchText, setWalletSearchText] = useState("");
  const [editingWalletAddr, setEditingWalletAddr] = useState<string | null>(null);

  // States: Bullet/Tasks reconfigure
  const [editingTask, setEditingTask] = useState<WhitelistTask | null>(null);

  // States: CMS Config Form State
  const [cmsForm, setCmsForm] = useState<CMSContent>(cmsData);

  // States: Gallery add/modify state
  const [editingArt, setEditingArt] = useState<Partial<CollectibleNFT> | null>(null);

  // Gallery Management States
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [galleryPage, setGalleryPage] = useState(1);
  const [galleryTotalPages, setGalleryTotalPages] = useState(1);
  const [galleryTotal, setGalleryTotal] = useState(0);
  const [gallerySortBy, setGallerySortBy] = useState("displayOrder");
  const [gallerySortOrder, setGallerySortOrder] = useState<"asc" | "desc">("asc");
  const [selectedGalleryIds, setSelectedGalleryIds] = useState<number[]>([]);
  const [editingArtOriginalId, setEditingArtOriginalId] = useState<number | null>(null);

  // Selector for Bulk actions in Application Log
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // CSV Import box state
  const [csvImportText, setCsvImportText] = useState("");
  const [importNotice, setImportNotice] = useState("");

  // General Notification feedback
  const [feedMsg, setFeedMsg] = useState("");

  useEffect(() => {
    const isLocalUnlocked = localStorage.getItem("yokaio_admin_unlocked") === "true";
    if (isLocalUnlocked) {
      setIsUnlocked(true);
      fetchAllAdminData();
    }
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsUnlocked(true);
          localStorage.setItem("yokaio_admin_unlocked", "true");
          localStorage.setItem("yokaio_admin_password", password);
          setTimeout(() => {
            fetchAllAdminData();
          }, 50);
          triggerToast("Systems engaged: Admin verified");
        } else {
          setAuthError(data.error || "Incorrect password. Access denied.");
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setAuthError(errData.error || "Incorrect password. Access denied.");
      }
    } catch (err) {
      setAuthError("Failed to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("Registration is disabled. Use the administrative password.");
  };

  const handleLogout = async () => {
    localStorage.removeItem("yokaio_admin_unlocked");
    localStorage.removeItem("yokaio_admin_password");
    setIsUnlocked(false);
    onAdminClose();
  };

  // Unified secure fetch wrapper
  const adminFetch = async (url: string, options: any = {}) => {
    const adminPassword = localStorage.getItem("yokaio_admin_password") || "";
    const headers = {
      "Content-Type": "application/json",
      "x-admin-password": adminPassword,
      ...(options.headers || {})
    };
    
    return fetch(url, {
      ...options,
      headers
    });
  };

  const fetchApplications = async (page = appPage, search = appSearch, status = appStatus, sortBy = appSortBy, sortOrder = appSortOrder) => {
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(appLimit),
        search,
        status,
        sortBy,
        sortOrder
      }).toString();
      
      const res = await adminFetch(`/api/applications?${query}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        setAppTotal(data.pagination?.total || 0);
        setAppPages(data.pagination?.totalPages || 1);
        setAppPage(data.pagination?.page || 1);
        if (data.stats) {
          setAppStats(data.stats);
        }
      }
    } catch (e) {
      console.error("Failed to fetch applications", e);
    }
  };

  const downloadCSV = async () => {
    try {
      const res = await adminFetch("/api/applications/download-csv");
      if (!res.ok) {
        throw new Error("Failed to download CSV");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `yokaio_applications_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast("CSV application logs downloaded successfully.");
    } catch (e) {
      console.error("Error generating CSV", e);
      triggerToast("Failed to initiate CSV download");
    }
  };

  const fetchAdminGallery = async (
    page: number,
    search: string,
    filter: string,
    sortBy: string,
    sortOrder: string
  ) => {
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
        filter,
        sortBy,
        sortOrder
      }).toString();

      const res = await adminFetch(`/api/gallery?${query}`);
      if (res.ok) {
        const data = await res.json();
        setGallery(data.artworks || []);
        setGalleryTotal(data.pagination?.total || 0);
        setGalleryTotalPages(data.pagination?.totalPages || 1);
        setGalleryPage(data.pagination?.page || 1);
      }
    } catch (e) {
      console.error("Failed to fetch admin gallery", e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await adminFetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setWalletCheckerActive(!!data.walletCheckerActive);
        setSocialTaskLink(data.socialTaskLink || "https://x.com/YokaioNFT");
        setCommentTaskLink(data.commentTaskLink || "https://x.com/YokaioNFT");
        setTimerActive(!!data.timerActive);
        setTimerDuration(data.timerDuration !== undefined ? data.timerDuration : 259200);
        setTimerRemaining(data.timerRemaining !== undefined ? data.timerRemaining : 259200);
      }
    } catch (e) {
      console.error("Failed to fetch site settings", e);
    }
  };

  // Local live ticking countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
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

  const handleStartTimer = async () => {
    try {
      const res = await adminFetch("/api/timer/start", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setTimerActive(!!data.timerActive);
        setTimerRemaining(data.timerRemaining);
        setTimerDuration(data.timerDuration);
        triggerToast("Systems engaged: Whitelist timer is counting down!");
      }
    } catch (e) {
      console.error(e);
      triggerToast("Failed to initiate timer.");
    }
  };

  const handlePauseTimer = async () => {
    try {
      const res = await adminFetch("/api/timer/pause", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setTimerActive(!!data.timerActive);
        setTimerRemaining(data.timerRemaining);
        triggerToast("Systems paused: Whitelist timer suspended.");
      }
    } catch (e) {
      console.error(e);
      triggerToast("Failed to pause timer.");
    }
  };

  const handleResetTimer = async (seconds: number) => {
    try {
      const res = await adminFetch("/api/timer/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: seconds })
      });
      if (res.ok) {
        const data = await res.json();
        setTimerActive(!!data.timerActive);
        setTimerRemaining(data.timerRemaining);
        setTimerDuration(data.timerDuration);
        triggerToast(`Systems recalibrated: Timer reset to ${Math.round(seconds / 3600)} hours.`);
      }
    } catch (e) {
      console.error(e);
      triggerToast("Failed to reset timer.");
    }
  };

  const handleUpdateSettings = async (updates: { walletCheckerActive?: boolean; socialTaskLink?: string; commentTaskLink?: string }) => {
    try {
      const res = await adminFetch("/api/settings", {
        method: "POST",
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setWalletCheckerActive(!!data.settings.walletCheckerActive);
        setSocialTaskLink(data.settings.socialTaskLink || "https://x.com/YokaioNFT");
        setCommentTaskLink(data.settings.commentTaskLink || "https://x.com/YokaioNFT");
        triggerToast("Site settings updated successfully.");
        // Re-fetch tasks list since updating socialTaskLink or commentTaskLink updates task-2 or task-3
        if (updates.socialTaskLink || updates.commentTaskLink) {
          adminFetch("/api/tasks").then(r => r.json()).then(setTasks);
        }
      } else {
        triggerToast("Failed to update site settings.");
      }
    } catch (e) {
      console.error("Error updating settings", e);
      triggerToast("Error updating site settings.");
    }
  };

  const fetchAllAdminData = async () => {
    try {
      const [resWallets, resTasks, resLogs, resCms, resGallery] = await Promise.all([
        adminFetch("/api/wallets").then(r => r.json()),
        adminFetch("/api/tasks").then(r => r.json()),
        adminFetch("/api/logs").then(r => r.json()),
        adminFetch("/api/cms").then(r => r.json()),
        adminFetch("/api/gallery").then(r => r.json())
      ]);

      setWallets(resWallets);
      setTasks(resTasks);
      setLogs(resLogs);
      setCms(resCms);
      setGallery(resGallery);
      setCmsForm(resCms);

      await fetchSettings();
      await fetchApplications(1, "", "All", "submissionDate", "desc");
      await fetchAdminGallery(1, "", "All", "displayOrder", "asc");
    } catch (error) {
      console.error("Critical error reading admin database states", error);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchApplications(appPage, appSearch, appStatus, appSortBy, appSortOrder);
    }
  }, [appPage, appStatus, appSortBy, appSortOrder, isUnlocked]);

  useEffect(() => {
    if (isUnlocked) {
      fetchAdminGallery(galleryPage, gallerySearch, galleryFilter, gallerySortBy, gallerySortOrder);
    }
  }, [galleryPage, gallerySearch, galleryFilter, gallerySortBy, gallerySortOrder, isUnlocked]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppPage(1);
    fetchApplications(1, appSearch, appStatus, appSortBy, appSortOrder);
  };

  const triggerToast = (msg: string) => {
    setFeedMsg(msg);
    setTimeout(() => setFeedMsg(""), 4000);
  };

  // Applications Actions
  const handleAppStatusChange = async (appId: string, status: WhitelistApplication['status']) => {
    try {
      const notesToSubmit = viewingApp?.id === appId ? appNotes : undefined;
      const res = await adminFetch(`/api/applications/${appId}`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminNotes: notesToSubmit })
      });
      if (res.ok) {
        triggerToast(`Application ${appId} shifted to ${status}`);
        fetchAllAdminData();
        onDataRefresh();
        if (viewingApp && viewingApp.id === appId) {
          const updated = await res.json();
          setViewingApp(updated.application);
        }
      }
    } catch (err) {
      triggerToast("Status shifting failed");
    }
  };

  const handleAppDelete = async (appId: string) => {
    if (!window.confirm(`Permanently delete application record ${appId}?`)) return;
    try {
      const res = await adminFetch(`/api/applications/${appId}`, { method: "DELETE" });
      if (res.ok) {
        triggerToast(`permanently deleted application ${appId}`);
        setViewingApp(null);
        fetchAllAdminData();
        onDataRefresh();
      }
    } catch (err) {
      triggerToast("Failed permanently deleting application");
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedAppIds.length === 0) {
      triggerToast("No items ticked for bulk deployment");
      return;
    }
    if (action === "delete" && !window.confirm(`Permanently delete all ${selectedAppIds.length} chosen applications?`)) return;

    try {
      const res = await adminFetch("/api/bulk-action", {
        method: "POST",
        body: JSON.stringify({ action, ids: selectedAppIds })
      });
      if (res.ok) {
        const data = await res.json();
        triggerToast(`Successfully deployed bulk ${action} in ${data.updatedCount} records`);
        setSelectedAppIds([]);
        fetchAllAdminData();
        onDataRefresh();
      }
    } catch (err) {
      triggerToast("Bulk operation failed");
    }
  };

  // Wallet manual administration
  const handleSaveWalletManually = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletAddr || !/^0x[a-fA-F0-9]{40}$/.test(newWalletAddr)) {
      triggerToast("A qualified fully-formed Hex 0x wallet address is required");
      return;
    }

    try {
      const res = await adminFetch("/api/wallets", {
        method: "POST",
        body: JSON.stringify({
          address: newWalletAddr,
          status: newWalletStatus,
          username: newWalletUser || "Manual Overseer Input",
          customNote: newWalletNote || "Injected via admin dashboard"
        })
      });

      if (res.ok) {
        triggerToast(editingWalletAddr ? "Wallet catalog updated" : "Fresh wallet registered");
        // Reset states
        setNewWalletAddr("");
        setNewWalletUser("");
        setNewWalletNote("");
        setEditingWalletAddr(null);
        fetchAllAdminData();
        onDataRefresh();
      }
    } catch (err) {
      triggerToast("Failed adding manual wallet intake link");
    }
  };

  const handleDeleteWallet = async (addr: string) => {
    if (!window.confirm(`Revoke whitelist credentials for wallet: ${addr}?`)) return;
    try {
      const res = await adminFetch(`/api/wallets/${addr}`, { method: "DELETE" });
      if (res.ok) {
        triggerToast("Access privileges revoked");
        fetchAllAdminData();
        onDataRefresh();
      }
    } catch (err) {
      triggerToast("Revocation failure");
    }
  };

  // CMS configuration submit
  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch("/api/cms", {
        method: "POST",
        body: JSON.stringify(cmsForm)
      });
      if (res.ok) {
        triggerToast("CMS variables deployed immediately");
        fetchAllAdminData();
        onDataRefresh();
      }
    } catch (err) {
      triggerToast("Failed updating CMS parameters");
    }
  };

  // Tasks updates
  const handleSaveTaskLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const remapped = tasks.map(t => t.id === editingTask.id ? editingTask : t);
    try {
      const res = await adminFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify(remapped)
      });
      if (res.ok) {
        triggerToast("Task link setups re-cached");
        setEditingTask(null);
        fetchAllAdminData();
      }
    } catch (err) {
      triggerToast("Failed to re-cache link specifications");
    }
  };

  const handleToggleTaskStatus = async (task: WhitelistTask) => {
    const remapped = tasks.map(t => t.id === task.id ? { ...t, active: !t.active } : t);
    try {
      const res = await adminFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify(remapped)
      });
      if (res.ok) {
        triggerToast(`Task "${task.title}" visibility toggled`);
        fetchAllAdminData();
      }
    } catch (err) {
      triggerToast("Failed toggling task visibility");
    }
  };

  // Gallery changes
  const startEditingArt = (art: CollectibleNFT) => {
    setEditingArt({ ...art });
    setEditingArtOriginalId(art.id);
  };

  const handleSaveGalleryArt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArt || !editingArt.name) {
      triggerToast("Name is a required field");
      return;
    }

    try {
      const payload = {
        ...editingArt,
        originalId: editingArtOriginalId !== null ? editingArtOriginalId : undefined
      };

      const res = await adminFetch("/api/gallery", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        triggerToast("Artwork details saved");
        setEditingArt(null);
        setEditingArtOriginalId(null);
        fetchAdminGallery(galleryPage, gallerySearch, galleryFilter, gallerySortBy, gallerySortOrder);
        onDataRefresh();
      }
    } catch (err) {
      triggerToast("Failed syncing gallery updates");
    }
  };

  const handleDeleteGalleryArt = async (id: number) => {
    if (!window.confirm("Permanently destroy this artwork from listing?")) return;
    try {
      const res = await adminFetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerToast("Artwork discarded");
        fetchAdminGallery(galleryPage, gallerySearch, galleryFilter, gallerySortBy, gallerySortOrder);
        onDataRefresh();
      }
    } catch (err) {
      triggerToast("Discarding artwork failed");
    }
  };

  // Reordering Artworks simulation (moves an item up or down)
  const handleMoveGalleryItem = async (index: number, direction: 'up' | 'down') => {
    const listCopy = [...gallery];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= listCopy.length) return;

    // Swap items
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIdx];
    listCopy[targetIdx] = temp;

    setGallery(listCopy);

    try {
      const reqIds = listCopy.map(item => item.id);
      const res = await adminFetch("/api/gallery/reorder", {
        method: "POST",
        body: JSON.stringify({ orderedIds: reqIds })
      });
      if (res.ok) {
        triggerToast("Appearance ordering adjusted");
        fetchAdminGallery(galleryPage, gallerySearch, galleryFilter, gallerySortBy, gallerySortOrder);
      }
    } catch (e) {
      triggerToast("Failed to persist order updates");
    }
  };

  // Bulk Gallery Actions handler
  const handleBulkGalleryAction = async (action: 'visible' | 'featured' | 'delete', value?: boolean) => {
    if (selectedGalleryIds.length === 0) {
      triggerToast("No artworks selected");
      return;
    }

    if (action === "delete" && !window.confirm(`Permanently delete all ${selectedGalleryIds.length} chosen artworks?`)) {
      return;
    }

    try {
      const res = await adminFetch("/api/gallery/bulk", {
        method: "POST",
        body: JSON.stringify({
          ids: selectedGalleryIds,
          action,
          value
        })
      });

      if (res.ok) {
        triggerToast(`Bulk operation successful`);
        setSelectedGalleryIds([]);
        fetchAdminGallery(galleryPage, gallerySearch, galleryFilter, gallerySortBy, gallerySortOrder);
        onDataRefresh();
      } else {
        const errData = await res.json();
        triggerToast(errData.error || "Bulk operation failed");
      }
    } catch (err) {
      triggerToast("Failed to complete bulk operation");
    }
  };

  // CSV Importer logic
  const handleImportCSVText = async () => {
    if (!csvImportText.trim()) {
      setImportNotice("Enter comma separated variables values (0xAddr,Username,Status,Date)");
      return;
    }

    const lines = csvImportText.split("\n");
    let added = 0;
    let failed = 0;

    for (let line of lines) {
      if (!line.trim() || line.trim().startsWith("#")) continue;
      const parts = line.split(",");
      if (parts.length >= 1) {
        const address = parts[0].trim();
        const username = parts[1]?.trim() || "CSV Bulk Intake";
        const statusRaw = parts[2]?.trim() || "Approved WL";
        
        let status: 'Approved WL' | 'Priority WL' | 'Waitlist' = "Approved WL";
        if (statusRaw.includes("Priority")) status = "Priority WL";
        if (statusRaw.includes("Waitlist") || statusRaw.includes("Standby")) status = "Waitlist";

        if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
          try {
            await adminFetch("/api/wallets", {
              method: "POST",
              body: JSON.stringify({
                address,
                status,
                username,
                customNote: `Imported via CSV file scan on ${new Date().toLocaleDateString()}`
              })
            });
            added++;
          } catch (e) {
            failed++;
          }
        } else {
          failed++;
        }
      }
    }

    setImportNotice(`Scan results: Imported ${added} wallets straight to whitelist registry. Failed ${failed}.`);
    setCsvImportText("");
    fetchAllAdminData();
    onDataRefresh();
  };

  // CSV Exports logic
  const handleDownloadCSV = async (type: 'approved' | 'rejected' | 'pending' | 'full') => {
    let headers = "wallet_address,username,status,date\n";
    let rows = "";

    try {
      if (type === "approved") {
        const list = wallets.filter(w => w.status === "Approved WL" || w.status === "Priority WL");
        rows = list.map(w => `${w.address},${w.username},${w.status},${w.addedAt}`).join("\n");
      } else if (type === "rejected") {
        const res = await adminFetch("/api/applications?all=true&status=Rejected");
        const data = await res.json();
        const list = data.applications || [];
        rows = list.map((a: any) => `${a.walletAddress},${a.xUsername},Rejected,${a.submissionDate}`).join("\n");
      } else if (type === "pending") {
        const res = await adminFetch("/api/applications?all=true&status=Pending");
        const data = await res.json();
        const list = data.applications || [];
        rows = list.map((a: any) => `${a.walletAddress},${a.xUsername},Pending,${a.submissionDate}`).join("\n");
      } else {
        // Full list
        rows = wallets.map(w => `${w.address},${w.username},${w.status},${w.addedAt}`).join("\n");
      }

      const payload = headers + rows;
      const blob = new Blob([payload], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `yoakaio_whitelist_${type}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast(`Exported ${type.toUpperCase()} whitelist CSV file`);
    } catch (error) {
      console.error("Export error", error);
      triggerToast("Failed to compile export file");
    }
  };

  // Copier trigger helper
  const copyText = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    triggerToast(`Copied ${label} to clipboard`);
  };

  // Stats Calculations
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === "Pending").length;
  const approvedWL = wallets.filter(w => w.status === "Approved WL" || w.status === "Priority WL").length;
  const rejectedApps = applications.filter(a => a.status === "Rejected").length;
  const uniqueWalletsCount = Array.from(new Set([
    ...wallets.map(w => w.address.toLowerCase()),
    ...applications.map(a => a.walletAddress.toLowerCase())
  ])).length;

  const todayCount = applications.filter(a => {
    try {
      const date = new Date(a.submissionDate);
      const today = new Date();
      return date.getDate() === today.getDate() && 
             date.getMonth() === today.getMonth() && 
             date.getFullYear() === today.getFullYear();
    } catch {
      return false;
    }
  }).length;

  const filteredWallets = wallets.filter(w => {
    const q = walletSearchText.toLowerCase().trim();
    if (!q) return true;
    return w.address.toLowerCase().includes(q) || w.username.toLowerCase().includes(q) || w.status.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 bg-brand-black/98 backdrop-blur-2xl z-55 overflow-y-auto px-4 py-8 text-[#E8D5C4] relative text-left">
      
      {/* Toast Feed */}
      <AnimatePresence>
        {feedMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-60 bg-brand-gold text-brand-black px-6 py-3 rounded-full font-mono text-xs font-bold shadow-[0_0_20px_#C8A46A] tracking-wider uppercase border border-brand-cream/20 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-brand-black" />
            {feedMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        
        {/* LOCK MODULE */}
        {!isUnlocked ? (
          <div className="min-h-[80vh] flex flex-col justify-center items-center max-w-md mx-auto text-center px-4 py-8">
            <div className="p-4 bg-brand-brown/15 border-2 border-brand-gold/60 rounded-full mb-6">
              <Sliders className="w-10 h-10 text-brand-gold animate-pulse" />
            </div>
            
            <h2 className="font-serif text-3xl font-bold tracking-widest text-brand-cream">
              ADMINISTRATIVE PORTAL
            </h2>
            <p className="text-zinc-400 font-sans text-xs mt-2 leading-relaxed">
              Verify administrative password to govern the whitelist matrices, contents, and galleries of YOKAIO.
            </p>

            <form onSubmit={handleUnlock} className="w-full mt-8 space-y-4">
              <div className="text-left">
                <label className="block text-[10px] font-mono tracking-widest text-[#C8A46A] uppercase mb-1.5 font-bold">
                  SECRET ACCESS PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#0A0A0A] text-left text-xs border border-brand-brown/30 rounded p-3 focus:outline-none focus:border-brand-gold text-[#E8D5C4]"
                />
              </div>

              {authError && (
                <p className="text-xs text-red-500 font-mono text-left bg-red-950/40 border border-red-900/30 px-3 py-2.5 rounded-lg leading-snug">
                  ✦ {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full font-serif font-black tracking-widest text-xs uppercase bg-brand-gold hover:bg-[#E8D5C4] text-brand-black py-4 rounded-xl cursor-pointer hover:shadow-[0_0_20px_rgba(200,164,106,0.20)] transition-all border border-brand-gold/50 flex justify-center items-center gap-2"
              >
                ENGAGE COGNITIVE CONTROL
              </button>
            </form>

            <button 
              onClick={onAdminClose}
              className="mt-6 text-zinc-500 hover:text-brand-gold text-xs font-mono uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              Cancel Access
            </button>
          </div>
        ) : (
          /* ACTIVE MASTER DASHBOARD */
          <div>
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-brand-brown/30 pb-6 mb-8">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="font-mono text-[9px] tracking-widest text-[#C8A46A] uppercase">COMMAND PORTAL ONLINE</p>
                </div>
                <h2 className="font-serif text-3xl font-black tracking-wider text-brand-cream">
                  YOKAIO ADMISSIONS PANEL
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={fetchAllAdminData}
                  className="bg-zinc-900 hover:bg-zinc-800 text-xs font-mono tracking-widest uppercase px-4 py-2.5 rounded-lg border border-[#3D2B22]/30 transition-all flex items-center gap-2 cursor-pointer text-brand-cream"
                >
                  Sync Core States
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-950/40 hover:bg-red-900/40 text-red-400 text-xs font-mono tracking-widest uppercase px-4 py-2.5 rounded-lg border border-red-900/35 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Close Sanctum
                </button>
              </div>
            </div>

            {/* Bento statistics dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
              {/* Stat 1 */}
              <div className="bg-[#120F0D] border border-brand-brown/30 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-zinc-550 font-mono text-[9px] uppercase tracking-wider block">Total Applications</span>
                <span className="text-3xl font-serif text-brand-cream font-bold mt-2 block">{totalApps}</span>
              </div>
              {/* Stat 2 */}
              <div className="bg-[#120F0D] border border-brand-brown/30 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-zinc-555 font-mono text-[9px] uppercase tracking-wider block">Pending Requests</span>
                <span className="text-3xl font-serif text-amber-500 font-bold mt-2 block animate-pulse">{pendingApps}</span>
              </div>
              {/* Stat 3 */}
              <div className="bg-[#120F0D] border border-brand-brown/30 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-zinc-555 font-mono text-[9px] uppercase tracking-wider block">Approved Whitelists</span>
                <span className="text-3xl font-serif text-green-400 font-bold mt-2 block">{approvedWL}</span>
              </div>
              {/* Stat 4 */}
              <div className="bg-[#120F0D] border border-brand-brown/30 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-zinc-555 font-mono text-[9px] uppercase tracking-wider block">Rejected Entries</span>
                <span className="text-3xl font-serif text-red-400 font-bold mt-2 block">{rejectedApps}</span>
              </div>
              {/* Stat 5 */}
              <div className="bg-[#120F0D] border border-brand-brown/30 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-zinc-555 font-mono text-[9px] uppercase tracking-wider block">Today's Applicants</span>
                <span className="text-3xl font-serif text-[#C8A46A] font-bold mt-2 block">{todayCount}</span>
              </div>
              {/* Stat 6 */}
              <div className="bg-[#120F0D] border border-brand-brown/30 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-zinc-555 font-mono text-[9px] uppercase tracking-wider block">Unique Wallets Registered</span>
                <span className="text-3xl font-serif text-brand-cream block font-bold mt-2">{uniqueWalletsCount}</span>
              </div>
            </div>

            {/* Sidebar navigation and content workspace area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column navigation panel */}
              <div className="lg:col-span-2 space-y-2">
                {[
                  { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="w-4 h-4" /> },
                  { id: "applications", label: "Application Log Log", icon: <Users className="w-4 h-4" /> },
                  { id: "wallets", label: "Wallet Snapshot Database", icon: <Database className="w-4 h-4" /> },
                  { id: "tasks", label: "Quest Task Setup", icon: <SlidersHorizontal className="w-4 h-4" /> },
                  { id: "cms", label: "CMS Web Editor", icon: <Settings className="w-4 h-4" /> },
                  { id: "gallery", label: "Gallery Configuration", icon: <Image className="w-4 h-4" /> },
                  { id: "audit", label: "System Audit Logs", icon: <BookOpen className="w-4 h-4" /> }
                ].map((item) => (
                  <button
                    key={item.id}
                    id={`admin-nav-${item.id}`}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full py-3.5 px-4 rounded-lg font-serif text-xs tracking-wider uppercase border transition-all flex items-center gap-3 cursor-pointer text-left ${
                      activeTab === item.id
                        ? "bg-brand-brown/20 text-brand-gold border-brand-gold/60 shadow-lg font-bold"
                        : "bg-zinc-950/60 text-zinc-500 border-[#3D2B22]/15 hover:text-[#E8D5C4] hover:bg-[#120F0D] hover:border-brand-brown/30"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Right Column workspace layouts */}
              <div className="lg:col-span-10 bg-[#120F0D] border border-brand-brown/30 rounded-2xl p-6 md:p-8 min-h-[500px]">
                
                {/* 1. DASHBOARD BRIEF */}
                {activeTab === "dashboard" && (
                  <div className="space-y-6">
                    <div className="border-b border-brand-brown/20 pb-4">
                      <h3 className="font-serif text-2xl font-bold tracking-wide text-brand-cream">Sanctum Vibe Check</h3>
                      <p className="text-zinc-500 text-xs font-light mt-1">Real-time actions summary and system status monitor.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Active tasks status summary */}
                      <div className="border border-brand-brown/20 bg-zinc-950/30 p-6 rounded-xl text-left">
                        <h4 className="font-serif text-base text-brand-gold font-bold mb-4 flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4 text-brand-gold" />
                          Core Quest Task Channels
                        </h4>
                        <div className="space-y-3">
                          {tasks.map(t => (
                            <div key={t.id} className="flex justify-between items-center text-xs font-mono border-b border-brand-brown/10 pb-2">
                              <span className="text-[#E8D5C4]/90 truncate max-w-[190px]">{t.title}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                                t.active 
                                  ? "bg-green-950/60 text-green-400 border-green-500/30" 
                                  : "bg-zinc-900 text-zinc-550 border-zinc-its"
                              }`}>
                                {t.active ? "ENGAGED" : "SEALED"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Immediate Export buttons */}
                      <div className="border border-brand-brown/20 bg-zinc-950/30 p-6 rounded-xl text-left">
                        <h4 className="font-serif text-base text-brand-gold font-bold mb-4 flex items-center gap-2">
                          <Download className="w-4 h-4 text-brand-gold" />
                          Admissions Snapshot Exports
                        </h4>
                        <p className="text-xs text-zinc-500 font-light mb-4">Click to extract CSV spreadsheets aligned for smart contract checks.</p>
                        
                        <div className="grid grid-cols-2 gap-3.5">
                          <button 
                            onClick={() => handleDownloadCSV('approved')}
                            className="bg-[#1C2C1D]/65 hover:bg-[#1A331D] text-green-400 font-mono text-[10px] tracking-wider uppercase p-3 rounded border border-green-800/40 text-center cursor-pointer"
                          >
                            APPROVED WALLETS CSV
                          </button>
                          <button 
                            onClick={() => handleDownloadCSV('pending')}
                            className="bg-[#2B231D]/65 hover:bg-[#332414] text-amber-500 font-mono text-[10px] tracking-wider uppercase p-3 rounded border border-amber-800/40 text-center cursor-pointer"
                          >
                            PENDING APPS CSV
                          </button>
                          <button 
                            onClick={() => handleDownloadCSV('rejected')}
                            className="bg-red-950/25 hover:bg-red-950/50 text-red-400 font-mono text-[10px] tracking-wider uppercase p-3 rounded border border-red-900/35 text-center cursor-pointer"
                          >
                            REJECTED LOGS CSV
                          </button>
                          <button 
                            onClick={() => handleDownloadCSV('full')}
                            className="bg-[#181C26]/65 hover:bg-[#1A2033] text-blue-400 font-mono text-[10px] tracking-wider uppercase p-3 rounded border border-blue-900/35 text-center cursor-pointer"
                          >
                            FULL SYSTEM REGISTRY
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Fresh Audits */}
                    <div className="border border-brand-brown/20 bg-zinc-950/20 p-6 rounded-xl text-left mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-serif text-sm text-brand-cream font-bold">Recent Audit Event Transmissions</h4>
                        <button onClick={() => setActiveTab("audit")} className="text-[10px] font-mono text-[#C8A46A] tracking-wider hover:underline uppercase">View Full Logs</button>
                      </div>

                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-2">
                        {logs.slice(0, 4).map(l => (
                          <div key={l.id} className="text-[10.5px] font-mono border-b border-brand-brown/5 pb-2 flex justify-between gap-4">
                            <div className="truncate">
                              <span className="text-[#C8A46A] font-semibold">[{l.action}]</span> <span className="text-zinc-500">{l.details}</span>
                            </div>
                            <span className="text-zinc-650 tracking-wider shrink-0 font-medium">{new Date(l.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Core System Overrides / Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {/* Wallet Checker Status Panel */}
                      <div className="border border-brand-brown/20 bg-zinc-950/30 p-6 rounded-xl text-left flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif text-base text-brand-gold font-bold mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-brand-gold" />
                            Wallet Checker Controller
                          </h4>
                          <p className="text-xs text-zinc-500 font-light mb-4">
                            Configure access to the Whitelist Verification Radar. Toggling to OFF blurs the verification interface and shows a "Coming Soon" notification instantly.
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-brand-brown/10 pt-4 mt-2">
                          <span className="font-mono text-xs text-brand-cream uppercase tracking-wider">
                            Status: <span className={walletCheckerActive ? "text-green-400 font-bold" : "text-amber-500 font-bold"}>{walletCheckerActive ? "Active / Online" : "Coming Soon / Blurred"}</span>
                          </span>
                          <button
                            onClick={() => handleUpdateSettings({ walletCheckerActive: !walletCheckerActive })}
                            className={`px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-widest rounded border transition-all cursor-pointer ${
                              walletCheckerActive
                                ? "bg-red-950/30 text-red-400 border-red-900/35 hover:bg-red-900/25"
                                : "bg-green-950/30 text-green-400 border-green-800/40 hover:bg-green-900/25"
                            }`}
                          >
                            {walletCheckerActive ? "DEACTIVATE (OFF)" : "ACTIVATE (ON)"}
                          </button>
                        </div>
                      </div>

                      {/* Social Tasks Announcement Link Editor */}
                      <div className="border border-brand-brown/20 bg-zinc-950/30 p-6 rounded-xl text-left">
                        <h4 className="font-serif text-base text-brand-gold font-bold mb-2 flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4 text-brand-gold" />
                          Social Link Configurations
                        </h4>
                        <p className="text-xs text-zinc-500 font-light mb-4">
                          Customize the X/Twitter post links for Like & RT quest and Wallet Comment requirements. Changes propagate instantly to all public quest steps.
                        </p>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateSettings({ socialTaskLink, commentTaskLink });
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block font-mono text-[9px] uppercase text-[#C8A46A] mb-1 font-bold">X/Twitter Post URL (Like & Retweet Task - Task 2)</label>
                            <input
                              type="url"
                              value={socialTaskLink}
                              onChange={(e) => setSocialTaskLink(e.target.value)}
                              className="w-full bg-[#0A0A0A] text-xs border border-brand-brown/35 rounded-lg p-2 text-brand-cream focus:border-brand-gold focus:outline-none"
                              required
                              placeholder="https://x.com/..."
                            />
                          </div>

                          <div>
                            <label className="block font-mono text-[9px] uppercase text-[#C8A46A] mb-1 font-bold">X/Twitter Post URL (Wallet Comment Task - Task 3)</label>
                            <input
                              type="url"
                              value={commentTaskLink}
                              onChange={(e) => setCommentTaskLink(e.target.value)}
                              className="w-full bg-[#0A0A0A] text-xs border border-brand-brown/35 rounded-lg p-2 text-brand-cream focus:border-brand-gold focus:outline-none"
                              required
                              placeholder="https://x.com/..."
                            />
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="submit"
                              className="bg-[#1C1816] hover:bg-brand-gold hover:text-black text-brand-gold border border-brand-brown/40 px-6 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-all cursor-pointer font-bold"
                            >
                              SAVE SOCIAL LINKS
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* Whitelist Closing Timer Controller */}
                    <div className="border border-brand-brown/20 bg-zinc-950/30 p-6 rounded-xl text-left mt-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="space-y-2 max-w-xl">
                          <h4 className="font-serif text-base text-brand-gold font-bold flex items-center gap-2">
                            <Clock className="w-4 h-4 text-brand-gold" />
                            Whitelist Closing Countdown Chronometer
                          </h4>
                          <p className="text-xs text-zinc-500 font-light leading-relaxed">
                            Govern the official whitelist application submission window. When the chronometer reaches zero, the registration matrices will lock automatically, rejecting all subsequent public applications.
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-[#0A0A0A] border border-brand-brown/15 rounded-lg px-4 py-2 shrink-0">
                          <span className="font-mono text-[10px] uppercase text-[#C8A46A] tracking-widest font-bold">Chronometer State:</span>
                          {timerRemaining === 0 ? (
                            <span className="flex items-center gap-1.5 font-mono text-[10px] text-red-500 font-extrabold uppercase bg-red-950/45 px-2.5 py-1 rounded border border-red-900/35">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Closed / Expired
                            </span>
                          ) : timerActive ? (
                            <span className="flex items-center gap-1.5 font-mono text-[10px] text-green-400 font-extrabold uppercase bg-green-950/40 px-2.5 py-1 rounded border border-green-800/40 animate-pulse">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" />
                              Active Countdown
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 font-mono text-[10px] text-amber-500 font-extrabold uppercase bg-amber-950/35 px-2.5 py-1 rounded border border-amber-900/35">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Suspended / Paused
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Digital Timer Face */}
                      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto my-8">
                        {[
                          { val: (() => {
                            const d = Math.floor(timerRemaining / (3600 * 24));
                            return String(d).padStart(2, "0");
                          })(), label: "Days" },
                          { val: (() => {
                            const h = Math.floor((timerRemaining % (3600 * 24)) / 3600);
                            return String(h).padStart(2, "0");
                          })(), label: "Hours" },
                          { val: (() => {
                            const m = Math.floor((timerRemaining % 3600) / 60);
                            return String(m).padStart(2, "0");
                          })(), label: "Minutes" },
                          { val: (() => {
                            const s = timerRemaining % 60;
                            return String(s).padStart(2, "0");
                          })(), label: "Seconds" }
                        ].map((unit, idx) => (
                          <div key={idx} className="bg-[#050505] border border-brand-brown/10 rounded-xl p-4 text-center hover:border-brand-brown/25 transition-all">
                            <span className="block font-mono text-3xl md:text-4xl font-extrabold text-brand-cream tracking-widest">
                              {unit.val}
                            </span>
                            <span className="block font-mono text-[9px] uppercase tracking-widest text-[#C8A46A] mt-1 font-bold">
                              {unit.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Control Interface */}
                      <div className="border-t border-brand-brown/10 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Left: Start / Pause Controls */}
                        <div className="flex flex-wrap items-center gap-3">
                          {timerActive ? (
                            <button
                              onClick={handlePauseTimer}
                              className="flex items-center gap-2 bg-[#2B231D] hover:bg-[#382B22] text-amber-500 font-mono text-[11px] tracking-widest uppercase font-bold px-5 py-3 rounded-lg border border-amber-850 cursor-pointer transition-all hover:shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                            >
                              <Pause className="w-3.5 h-3.5" />
                              Pause Chronometer
                            </button>
                          ) : (
                            <button
                              onClick={handleStartTimer}
                              disabled={timerRemaining === 0}
                              className="flex items-center gap-2 bg-brand-gold hover:bg-[#E8D5C4] disabled:opacity-30 disabled:pointer-events-none text-brand-black font-mono text-[11px] tracking-widest uppercase font-black px-5 py-3 rounded-lg cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(200,164,106,0.3)]"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Start / Resume
                            </button>
                          )}

                          <button
                            onClick={() => handleResetTimer(259200)}
                            className="flex items-center gap-2 bg-[#141414] hover:bg-[#1E1E1E] text-zinc-400 font-mono text-[11px] tracking-widest uppercase font-bold px-5 py-3 rounded-lg border border-zinc-800 cursor-pointer transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset to 72H Preset
                          </button>
                        </div>

                        {/* Right: Custom Hours Calibration */}
                        <div className="flex items-center gap-2 bg-[#0A0A0A] border border-brand-brown/15 p-1.5 rounded-lg">
                          <input
                            type="number"
                            min="1"
                            max="1000"
                            value={timerInputHours}
                            onChange={(e) => setTimerInputHours(e.target.value)}
                            className="w-16 bg-transparent text-center font-mono text-xs text-brand-cream border-none focus:outline-none py-1.5 font-bold"
                            placeholder="72"
                          />
                          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold pr-2">Hours</span>
                          <button
                            onClick={() => {
                              const hrs = parseFloat(timerInputHours);
                              if (!isNaN(hrs) && hrs > 0) {
                                handleResetTimer(Math.round(hrs * 3600));
                              } else {
                                triggerToast("Please enter a valid duration");
                              }
                            }}
                            className="bg-brand-brown/20 hover:bg-brand-brown/40 text-brand-gold font-mono text-[10px] tracking-widest uppercase font-bold px-4 py-2 rounded transition-all cursor-pointer border border-brand-brown/30"
                          >
                            Calibrate
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. APPLICATION MANAGEMENT TABLE */}
                {activeTab === "applications" && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-brand-brown/20 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-serif text-2xl font-bold tracking-wide text-brand-cream">Application Log Index</h3>
                        <p className="text-zinc-500 text-xs font-light mt-1">Review application details, approve, waitlist or reject.</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Download CSV Button */}
                        <button
                          onClick={downloadCSV}
                          className="flex items-center gap-2 bg-[#1C1816] hover:bg-brand-gold hover:text-black text-brand-gold border border-brand-brown/40 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-bold shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download All CSV</span>
                        </button>

                        {/* Bulk control actions panel */}
                        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-brand-brown/20 shrink-0">
                          <span className="font-mono text-[10px] text-zinc-500 tracking-wider font-semibold mr-1">{selectedAppIds.length} Selected</span>
                          <button
                            onClick={() => handleBulkAction('approve')}
                            className="bg-green-950/40 hover:bg-green-900/40 text-green-400 text-[10px] font-mono uppercase px-2 py-1 rounded border border-green-800/40 cursor-pointer transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleBulkAction('reject')}
                            className="bg-red-950/45 hover:bg-red-900/40 text-red-400 text-[10px] font-mono uppercase px-2 py-1 rounded border border-red-900/35 cursor-pointer transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleBulkAction('delete')}
                            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-[10px] font-mono uppercase px-2 py-1 rounded border border-zinc-805 cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Filter, Search & Sort Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-950/40 p-4 border border-brand-brown/20 rounded-xl">
                      {/* Search */}
                      <form onSubmit={handleSearchSubmit} className="md:col-span-2">
                        <label className="block font-mono text-[9px] uppercase text-[#C8A46A] mb-1 font-semibold">Search Applicant Details</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Search by ID, Username, Wallet, Reason..."
                            value={appSearch}
                            onChange={(e) => setAppSearch(e.target.value)}
                            className="flex-1 bg-[#0A0A0A] text-xs border border-brand-brown/30 rounded-lg px-3 py-2 text-[#E8D5C4] focus:outline-none focus:border-brand-gold"
                          />
                          <button
                            type="submit"
                            className="bg-brand-brown/20 text-[#C8A46A] border border-brand-brown/40 hover:border-brand-gold hover:text-brand-cream px-3 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer uppercase"
                          >
                            SEARCH
                          </button>
                        </div>
                      </form>

                      {/* Status filter */}
                      <div>
                        <label className="block font-mono text-[9px] uppercase text-[#C8A46A] mb-1 font-semibold">Filter State</label>
                        <select
                          value={appStatus}
                          onChange={(e) => {
                            setAppStatus(e.target.value);
                            setAppPage(1);
                          }}
                          className="w-full bg-[#0A0A0A] text-xs border border-brand-brown/30 rounded-lg px-3 py-2 text-[#E8D5C4] focus:outline-none focus:border-brand-gold h-[38px] cursor-pointer"
                        >
                          <option value="All">All States</option>
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Waitlisted">Waitlisted</option>
                        </select>
                      </div>

                      {/* Sorting Column Selector */}
                      <div>
                        <label className="block font-mono text-[9px] uppercase text-[#C8A46A] mb-1 font-semibold">Sorting Preference</label>
                        <div className="flex gap-1">
                          <select
                            value={appSortBy}
                            onChange={(e) => setAppSortBy(e.target.value)}
                            className="flex-1 bg-[#0A0A0A] text-xs border border-brand-brown/30 rounded-lg px-3 py-2 text-[#E8D5C4] focus:outline-none focus:border-brand-gold h-[38px] cursor-pointer"
                          >
                            <option value="submissionDate">Submission Date</option>
                            <option value="xUsername">X Username</option>
                            <option value="walletAddress">Wallet Address</option>
                            <option value="status">Status</option>
                            <option value="id">Application ID</option>
                          </select>
                          <button
                            onClick={() => setAppSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                            title={appSortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
                            className="bg-zinc-900 border border-brand-brown/35 rounded-lg px-3 hover:border-brand-gold hover:text-brand-cream text-brand-gold transition-all text-xs font-mono h-[38px] flex items-center justify-center cursor-pointer"
                          >
                            {appSortOrder === "asc" ? "▲" : "▼"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Applications Table list */}
                    <div className="overflow-x-auto border border-brand-brown/25 rounded-xl bg-zinc-950/40">
                      <table className="w-full text-xs font-sans text-left border-collapse">
                        <thead>
                          <tr className="border-b border-brand-brown/25 bg-brand-black text-brand-gold/80 font-mono uppercase text-[9.5px] tracking-widest">
                            <th className="py-4 px-4 text-center">
                              <input 
                                type="checkbox"
                                checked={selectedAppIds.length === applications.length && applications.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedAppIds(applications.map(a => a.id));
                                  else setSelectedAppIds([]);
                                }}
                                className="w-3.5 h-3.5 align-middle select-none border-brand-brown"
                              />
                            </th>
                            <th className="py-4 px-3 font-semibold">APPLICATION ID</th>
                            <th className="py-4 px-3 font-semibold">X USERNAME</th>
                            <th className="py-4 px-3 font-semibold">WALLET REGISTER</th>
                            <th className="py-4 px-3 font-semibold">PROOFS</th>
                            <th className="py-4 px-3 font-semibold">DATE SUBMITTED</th>
                            <th className="py-4 px-3 font-semibold">STATE</th>
                            <th className="py-4 px-3 font-semibold text-right">CONTROLS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3D2B22]/15">
                          {applications.map((app) => {
                            const isChecked = selectedAppIds.includes(app.id);
                            return (
                              <tr 
                                key={app.id}
                                className={`transition-colors duration-200 ${isChecked ? "bg-brand-brown/10" : "hover:bg-zinc-950/40"}`}
                              >
                                <td className="py-4 px-4 text-center">
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedAppIds(prev => [...prev, app.id]);
                                      else setSelectedAppIds(prev => prev.filter(id => id !== app.id));
                                    }}
                                    className="w-3.5 h-3.5"
                                  />
                                </td>
                                <td className="py-4 px-3 font-mono text-brand-cream font-bold">{app.id}</td>
                                <td className="py-4 px-3 font-semibold text-[#E8D5C4]">{app.xUsername}</td>
                                <td className="py-4 px-3 font-mono text-zinc-400 select-all truncate max-w-[120px]">{app.walletAddress}</td>
                                <td className="py-4 px-3">
                                  <a href={app.commentLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1.5 font-mono text-[10px]">
                                    Link <ExternalLink className="w-3 h-3 text-blue-400" />
                                  </a>
                                </td>
                                <td className="py-4 px-3 font-mono text-zinc-500">{new Date(app.submissionDate).toLocaleDateString()}</td>
                                <td className="py-4 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                                    app.status === "Approved" 
                                      ? "bg-green-950/60 text-green-400 border border-green-500/30" 
                                      : app.status === "Rejected"
                                      ? "bg-red-950/40 text-red-400 border border-red-900/30"
                                      : "bg-amber-950/50 text-amber-500 border border-amber-500/30"
                                  }`}>
                                    {app.status}
                                  </span>
                                </td>
                                <td className="py-4 px-3 text-right">
                                  <div className="flex gap-1.5 justify-end">
                                    <button
                                      onClick={() => {
                                        setViewingApp(app);
                                        setAppNotes(app.adminNotes || "");
                                      }}
                                      title="Inspect detailed reason and append notes"
                                      className="p-1 px-2 border border-brand-brown/40 bg-zinc-900 hover:bg-brand-brown/20 text-[#C8A46A] rounded hover:border-[#C8A46A] flex items-center gap-1 cursor-pointer font-mono text-[10px]"
                                    >
                                      <Eye className="w-3 h-3" /> Inspect
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                          {applications.length === 0 && (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-zinc-500 font-mono text-xs">
                                APPLICATION REGISTRY REMAINS EMPTY OR NO RESULTS FOUND FOR TETHERED QUERIES.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination & Footer summary stats bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0A0A0A] p-4 rounded-xl border border-brand-brown/20 font-mono text-[11px] text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span>Show</span>
                        <select
                          value={appLimit}
                          onChange={(e) => {
                            setAppLimit(Number(e.target.value));
                            setAppPage(1);
                          }}
                          className="bg-zinc-900 border border-brand-brown/30 text-brand-cream rounded px-1.5 py-1 text-xs cursor-pointer focus:outline-none"
                        >
                          <option value={15}>15</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span>entries</span>
                        <span className="text-zinc-600 font-light ml-2 border-l border-zinc-800 pl-3">Matched: {appTotal} records</span>
                      </div>

                      {/* Paginated steps buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={appPage <= 1}
                          onClick={() => setAppPage(p => Math.max(1, p - 1))}
                          className="px-2.5 py-1.5 bg-[#120F0D] border border-brand-brown/30 text-brand-gold disabled:opacity-30 disabled:hover:text-brand-gold hover:text-brand-cream hover:border-brand-gold rounded transition-all cursor-pointer disabled:cursor-not-allowed font-bold"
                        >
                          Prev
                        </button>
                        <span className="px-3 py-1.5 bg-[#181513] text-brand-gold border border-brand-brown/15 rounded select-none">
                          Page {appPage} of {appPages}
                        </span>
                        <button
                          type="button"
                          disabled={appPage >= appPages}
                          onClick={() => setAppPage(p => Math.min(appPages, p + 1))}
                          className="px-2.5 py-1.5 bg-[#120F0D] border border-brand-brown/30 text-brand-gold disabled:opacity-30 disabled:hover:text-brand-gold hover:text-brand-cream hover:border-brand-gold rounded transition-all cursor-pointer disabled:cursor-not-allowed font-bold"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. WALLET Snapshot DATABASE MANAGEMENT */}
                {activeTab === "wallets" && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-brand-brown/20 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-serif text-2xl font-bold tracking-wide text-brand-cream">Whitelist Registry Database</h3>
                        <p className="text-zinc-500 text-xs font-light mt-1">Manual intake controls, CSV search tools, and eligibility snapshops.</p>
                      </div>

                      {/* Export snaps buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadCSV('full')}
                          className="bg-brand-brown/80 hover:bg-brand-gold hover:text-brand-black transition-all border border-brand-gold/60 text-brand-gold text-[10px] font-mono uppercase px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-2"
                        >
                          <Download className="w-3.5 h-3.5" /> Export Snapshot CSV
                        </button>
                      </div>
                    </div>

                    {/* Setup manual wallet additions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Block: Add manual form */}
                      <form onSubmit={handleSaveWalletManually} className="bg-zinc-950/40 border border-brand-brown/20 p-5 rounded-xl space-y-4">
                        <h4 className="font-serif text-sm font-bold text-brand-gold border-b border-brand-brown/10 pb-2 mb-3">
                          {editingWalletAddr ? "Edit Whitelist Credentials" : "Add Direct Admission Wallet"}
                        </h4>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1 font-semibold">Wallet Address</label>
                          <input
                            type="text"
                            value={newWalletAddr}
                            onChange={(e) => setNewWalletAddr(e.target.value)}
                            disabled={!!editingWalletAddr}
                            placeholder="0x..."
                            className="w-full bg-[#0A0A0A] placeholder-zinc-700 font-mono text-xs border border-brand-brown/30 rounded px-3 py-2.5 focus:outline-none focus:border-brand-gold"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1 font-semibold">Status Tier</label>
                            <select
                              value={newWalletStatus}
                              onChange={(e) => setNewWalletStatus(e.target.value as any)}
                              className="w-full bg-[#0A0A0A] text-xs border border-brand-brown/35 rounded px-3 py-2"
                            >
                              <option value="Approved WL">Approved WL</option>
                              <option value="Priority WL">Priority WL (OG)</option>
                              <option value="Waitlist">Waitlist</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1 font-semibold">Associated Username</label>
                            <input
                              type="text"
                              value={newWalletUser}
                              onChange={(e) => setNewWalletUser(e.target.value)}
                              placeholder="@handle / partners"
                              className="w-full bg-[#0A0A0A] placeholder-zinc-700 text-xs border border-brand-brown/35 rounded px-3 py-2 focus:outline-none focus:border-brand-gold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1 font-semibold">Internal Annotations</label>
                          <input
                            type="text"
                            value={newWalletNote}
                            onChange={(e) => setNewWalletNote(e.target.value)}
                            placeholder="e.g. Alliance reserve / raffle giveaway"
                            className="w-full bg-[#0A0A0A] placeholder-zinc-700 text-xs border border-brand-brown/35 rounded px-3 py-2 focus:outline-none focus:border-brand-gold"
                          />
                        </div>

                        <div className="flex gap-2.5 justify-end">
                          {editingWalletAddr && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingWalletAddr(null);
                                setNewWalletAddr("");
                                setNewWalletUser("");
                                setNewWalletNote("");
                              }}
                              className="px-3.5 py-2 text-xs font-mono uppercase text-zinc-500 hover:text-brand-cream bg-zinc-900 border border-zinc-800 rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="submit"
                            className="bg-brand-gold hover:bg-brand-cream text-brand-black font-serif font-black tracking-widest text-[10px] uppercase px-5 py-2 rounded-lg cursor-pointer transition-colors shadow-md flex items-center gap-1.5 border border-brand-gold"
                          >
                            <Plus className="w-3.5 h-3.5 text-brand-black" />
                            {editingWalletAddr ? "SAVE ENTRY" : "REGISTER WALLET"}
                          </button>
                        </div>
                      </form>

                      {/* Right Block: Dynamic Text CSV Importer */}
                      <div className="bg-zinc-950/40 border border-brand-brown/20 p-5 rounded-xl flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif text-sm font-bold text-brand-gold border-b border-brand-brown/10 pb-2 mb-3">
                            Direct CSV / Bulk TXT Intake
                          </h4>
                          <p className="text-[10.5px] text-zinc-400 font-light mb-3 leading-relaxed">
                            Enter addresses below. FORMAT: <code className="text-brand-gold">0xAddress,OptionalUsername,OptionalTier</code> (One address per line).
                          </p>

                          <textarea
                            value={csvImportText}
                            onChange={(e) => setCsvImportText(e.target.value)}
                            rows={4}
                            placeholder="0x71C7656EC7ab88b098defB751B...,@samurai,Priority WL&#10;0x3Db76920D27ab5DF6eFffB287796d...,@collector,Approved WL"
                            className="w-full bg-[#0A0A0A] placeholder-zinc-750 font-mono text-xs border border-brand-brown/30 rounded p-3 focus:outline-none focus:border-brand-gold"
                          />

                          {importNotice && (
                            <p className="text-[10px] font-mono text-brand-gold bg-brand-gold/10 border border-brand-gold/30 p-2.5 rounded mt-3">
                              ✦ {importNotice}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-end mt-4">
                          <button
                            type="button"
                            onClick={handleImportCSVText}
                            className="bg-[#1E1713] hover:bg-brand-brown text-brand-gold font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded.5 border border-brand-gold/35 cursor-pointer transition-colors"
                          >
                            RUN SCAN AND INGEST
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Integrated Search and Data table */}
                    <div className="space-y-4 pt-4 border-t border-brand-brown/15">
                      <div className="flex justify-between items-center gap-4">
                        <h4 className="font-serif text-sm font-bold text-brand-cream">Active Registry Ledger ({filteredWallets.length} visible)</h4>
                        
                        {/* Search input */}
                        <div className="relative max-w-xs w-full">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-555">
                            <Search className="w-3.5 h-3.5" />
                          </span>
                          <input
                            type="text"
                            value={walletSearchText}
                            onChange={(e) => setWalletSearchText(e.target.value)}
                            placeholder="Search active registry..."
                            className="w-full bg-zinc-950 font-mono text-[11px] border border-brand-brown/25 rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-brand-gold"
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-brand-brown/15 rounded-lg bg-zinc-950/25 max-h-[300px] overflow-y-auto">
                        <table className="w-full text-xs font-sans text-left border-collapse">
                          <thead>
                            <tr className="border-b border-brand-brown/20 bg-brand-black text-[#C8A46A]/80 font-mono uppercase text-[9.5px] tracking-widest sticky top-0 z-10 shadow-sm">
                              <th className="py-3.5 px-3">WALLET ADDRESS</th>
                              <th className="py-3.5 px-3">HANDLE / SOURCE</th>
                              <th className="py-3.5 px-3">TIER STATUS</th>
                              <th className="py-3.5 px-3">TIMESTAMP</th>
                              <th className="py-3.5 px-3">NOTES</th>
                              <th className="py-3.5 px-3 text-right">CONTROLS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#3D2B22]/10 font-mono text-[11px]">
                            {filteredWallets.map((w) => (
                              <tr key={w.address} className="hover:bg-zinc-950/40">
                                <td className="py-3 px-3 select-all tracking-tight font-medium text-brand-cream">{w.address}</td>
                                <td className="py-3 px-3 text-zinc-400 font-sans">{w.username}</td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold text-xxs ${
                                    w.status === "Priority WL" 
                                      ? "bg-amber-950/50 text-brand-gold border border-brand-gold/45" 
                                      : w.status === "Waitlist"
                                      ? "bg-indigo-950/50 text-indigo-400 border border-indigo-900/30"
                                      : "bg-green-950/50 text-green-400 border border-green-900/30"
                                  }`}>
                                    {w.status}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-zinc-555 text-xxs font-light">{new Date(w.addedAt).toLocaleDateString()}</td>
                                <td className="py-3 px-3 text-zinc-500 font-sans truncate max-w-[150px]" title={w.customNote}>{w.customNote}</td>
                                <td className="py-3 px-3 text-right font-sans">
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => {
                                        setEditingWalletAddr(w.address);
                                        setNewWalletAddr(w.address);
                                        setNewWalletStatus(w.status === 'Approved WL' ? 'Approved WL' : w.status === 'Priority WL' ? 'Priority WL' : 'Waitlist');
                                        setNewWalletUser(w.username);
                                        setNewWalletNote(w.customNote || "");
                                      }}
                                      title="Edit details"
                                      className="p-1 text-zinc-450 hover:text-[#C8A46A] transition-colors cursor-pointer"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteWallet(w.address)}
                                      title="Revoke access rights"
                                      className="p-1 text-zinc-450 hover:text-red-400 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}

                            {filteredWallets.length === 0 && (
                              <tr>
                                <td colSpan={6} className="py-12 text-center text-zinc-500">
                                  NO COINCIDENT REGISTRY ENTRIES MATCH SEARCH CRITERIA.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

                {/* 4. QUEST TASKS CHANNELS MANAGEMENTS */}
                {activeTab === "tasks" && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-brand-brown/20 pb-4">
                      <h3 className="font-serif text-2xl font-bold tracking-wide text-brand-cream">Quest task channel controls</h3>
                      <p className="text-zinc-500 text-xs font-light mt-1">Configure external post hyperlinks, customize text values, and toggles.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Block: List tasks and details */}
                      <div className="space-y-3">
                        {tasks.map(t => (
                          <div 
                            key={t.id}
                            className={`border p-4 rounded-xl flex items-center justify-between gap-4 transition-all ${
                              t.active 
                                ? "bg-zinc-950/40 border-brand-brown/30" 
                                : "bg-zinc-950/20 border-[#3D2B22]/10 opacity-60"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-mono text-[9px] text-[#C8A46A] uppercase tracking-widest">{t.type}</p>
                              <h4 className="font-serif text-sm font-semibold text-brand-cream mt-1 truncate">{t.title}</h4>
                              <p className="text-[10px] text-zinc-400 font-light truncate mt-0.5">{t.description}</p>
                              <span className="inline-block mt-2 font-mono text-[9.5px] text-zinc-600 truncate max-w-xs">{t.externalLink}</span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {/* Enable toggle */}
                              <button
                                onClick={() => handleToggleTaskStatus(t)}
                                title={t.active ? "Click to deactivate task" : "Click to activate task"}
                                className={`px-2 py-1 text-[9px] font-mono font-bold rounded uppercase transition-all cursor-pointer ${
                                  t.active 
                                    ? "bg-green-950/40 border border-green-500/30 text-green-400" 
                                    : "bg-zinc-900 border border-zinc-its text-zinc-500"
                                }`}
                              >
                                {t.active ? "Engaged" : "Sealed"}
                              </button>

                              {/* Edit details */}
                              <button
                                onClick={() => setEditingTask(t)}
                                className="p-1 border border-brand-brown/30 hover:border-brand-gold bg-[#0A0A0A] text-brand-gold hover:text-brand-black hover:bg-brand-gold rounded transition-colors cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right Block: Configure Task Form */}
                      <div>
                        {editingTask ? (
                          <form onSubmit={handleSaveTaskLink} className="bg-zinc-950/40 border border-brand-brown/20 p-5 rounded-xl space-y-4">
                            <h4 className="font-serif text-sm font-bold text-brand-gold border-b border-brand-brown/10 pb-2 mb-3 flex justify-between items-center">
                              <span>Reconfigure Quest Channels</span>
                              <button type="button" onClick={() => setEditingTask(null)} className="text-zinc-500 hover:text-brand-cream"><X className="w-4 h-4" /></button>
                            </h4>

                            <div>
                              <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1 font-semibold">Quest Channel Header</label>
                              <input
                                type="text"
                                value={editingTask.title}
                                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                className="w-full bg-[#0A0A0A] text-xs border border-brand-brown/35 rounded p-2.5 text-brand-cream"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1 font-semibold">Channel Description Brief</label>
                              <input
                                type="text"
                                value={editingTask.description}
                                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                className="w-full bg-[#0A0A0A] text-xs border border-brand-brown/35 rounded p-2.5 text-brand-cream"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1 font-semibold">Button Anchor Label</label>
                                <input
                                  type="text"
                                  value={editingTask.buttonLabel}
                                  onChange={(e) => setEditingTask({ ...editingTask, buttonLabel: e.target.value })}
                                  className="w-full bg-[#0A0A0A] text-xs border border-brand-brown/35 rounded p-2.5 text-brand-cream"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1 font-semibold">Subclass Channel</label>
                                <select 
                                  value={editingTask.type}
                                  onChange={(e) => setEditingTask({ ...editingTask, type: e.target.value as any })}
                                  className="w-full bg-[#0A0A0A] text-xs border border-brand-brown/35 rounded p-2.5 text-brand-cream"
                                >
                                  <option value="x-follow">X / Twitter Follow</option>
                                  <option value="x-repost">X Repost & Like</option>
                                  <option value="x-comment">X Comment Reply</option>
                                  <option value="discord-join">Discord sanctum sign</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1 font-semibold">Redirect Hyperlink URL</label>
                              <input
                                type="url"
                                value={editingTask.externalLink}
                                onChange={(e) => setEditingTask({ ...editingTask, externalLink: e.target.value })}
                                className="w-full bg-[#0A0A5B] font-mono text-xs border border-[#3D2B22]/35 rounded p-2.5 text-blue-400"
                                required
                              />
                            </div>

                            <div className="flex justify-end gap-2.5 pt-2">
                              <button 
                                type="button" 
                                onClick={() => setEditingTask(null)}
                                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-805 border border-[#3D2B22]/15 text-xs font-mono uppercase rounded text-zinc-400 cursor-pointer"
                              >
                                Discard
                              </button>
                              <button 
                                type="submit"
                                className="bg-brand-gold hover:bg-brand-cream text-brand-black hover:border-brand-cream shadow transition-all border border-brand-gold font-serif font-black tracking-widest text-[10.5px] uppercase px-5 py-2.5 rounded cursor-pointer"
                              >
                                SAVE TASK CONFIG
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="border border-dashed border-brand-brown/20 bg-[#120F0D] p-10 h-full rounded-xl flex flex-col items-center justify-center text-center">
                            <Plus className="w-8 h-8 text-brand-brown/50 mb-3" />
                            <p className="font-serif text-[#E8D5C4] text-sm">Task Selector Idle</p>
                            <p className="text-[10.5px] text-zinc-500 max-w-xs mt-1">Select any task icon configuration on the left to revise links or details without modifying source code directly.</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* 5. CMS EDIT PANEL */}
                {activeTab === "cms" && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-brand-brown/20 pb-4">
                      <h3 className="font-serif text-2xl font-bold tracking-wide text-brand-cream">Content Management System</h3>
                      <p className="text-zinc-500 text-xs font-light mt-1">Re-configure website titles, lore logs, supply figures, prices, and links.</p>
                    </div>

                    <form onSubmit={handleSaveCMS} className="space-y-6 max-h-[50vh] overflow-y-auto pr-3">
                      
                      {/* Section: Hero Parameters */}
                      <div className="border border-brand-brown/15 bg-zinc-950/20 p-5 rounded-xl space-y-4">
                        <p className="font-mono text-[9px] text-brand-gold uppercase tracking-widest font-semibold border-b border-brand-brown/10 pb-2">1. Hero Splash Variables</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1">Splash Brand Title</label>
                            <input
                              type="text"
                              value={cmsForm.heroTitle}
                              onChange={(e) => setCmsForm({ ...cmsForm, heroTitle: e.target.value })}
                              className="w-full bg-[#0A0A0A] text-sm border border-brand-brown/30 rounded p-2.5 text-brand-cream"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1">Cinematic Headline</label>
                            <input
                              type="text"
                              value={cmsForm.heroHeadline}
                              onChange={(e) => setCmsForm({ ...cmsForm, heroHeadline: e.target.value })}
                              className="w-full bg-[#0A0A0A] text-sm border border-brand-brown/30 rounded p-2.5 text-brand-cream"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1">Description Paragraph</label>
                          <textarea
                            value={cmsForm.heroDescription}
                            onChange={(e) => setCmsForm({ ...cmsForm, heroDescription: e.target.value })}
                            rows={2}
                            className="w-full bg-[#0A0A0A] text-xs border border-brand-brown/30 rounded p-2.5 text-brand-cream"
                            required
                          />
                        </div>
                      </div>

                      {/* Section: About Lore parameters */}
                      <div className="border border-brand-brown/15 bg-zinc-950/20 p-5 rounded-xl space-y-4">
                        <p className="font-mono text-[9px] text-brand-gold uppercase tracking-widest font-semibold border-b border-brand-brown/10 pb-2">2. About Section Chronicles</p>
                        
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1">Section Core Title</label>
                          <input
                            type="text"
                            value={cmsForm.aboutTitle}
                            onChange={(e) => setCmsForm({ ...cmsForm, aboutTitle: e.target.value })}
                            className="w-full bg-[#0A0A0A] text-sm border border-brand-brown/30 rounded p-2.5 text-brand-cream"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1">Mythological Lore Context</label>
                          <textarea
                            value={cmsForm.aboutContent}
                            onChange={(e) => setCmsForm({ ...cmsForm, aboutContent: e.target.value })}
                            rows={5}
                            className="w-full bg-[#0A0A0A] font-sans text-xs border border-brand-brown/30 rounded p-3 text-brand-cream-50 leading-relaxed"
                            required
                          />
                        </div>
                      </div>

                      {/* Section: Mint Release Figures */}
                      <div className="border border-brand-brown/15 bg-zinc-950/20 p-5 rounded-xl space-y-4">
                        <p className="font-mono text-[9px] text-brand-gold uppercase tracking-widest font-semibold border-b border-brand-brown/10 pb-2">3. Contract Release Values</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1">Whitelist Status</label>
                            <select
                              value={cmsForm.wlStatus}
                              onChange={(e) => setCmsForm({ ...cmsForm, wlStatus: e.target.value as any })}
                              className="w-full bg-[#0A0A0A] text-xs border border-brand-brown/30 rounded p-2.5"
                            >
                              <option value="Open">Whitelist Open</option>
                              <option value="Closed">Whitelist Closed</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1">Total Supply Count</label>
                            <input
                              type="number"
                              value={cmsForm.supply}
                              onChange={(e) => setCmsForm({ ...cmsForm, supply: Number(e.target.value) })}
                              className="w-full bg-[#0A0A0A] text-xs border border-brand-brown/30 rounded p-2.5"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1">Mint Price (ETH)</label>
                            <input
                              type="text"
                              value={cmsForm.mintPrice}
                              onChange={(e) => setCmsForm({ ...cmsForm, mintPrice: e.target.value })}
                              className="w-full bg-[#0A0A0A] text-xs border border-brand-brown/30 rounded p-2.5"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1">Mint Launch Date</label>
                            <input
                              type="text"
                              value={cmsForm.mintDate}
                              onChange={(e) => setCmsForm({ ...cmsForm, mintDate: e.target.value })}
                              className="w-full bg-[#0A0A0A] text-xs border border-brand-brown/30 rounded p-2.5"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section: Social Hyperlinks */}
                      <div className="border border-brand-brown/15 bg-zinc-950/20 p-5 rounded-xl space-y-4">
                        <p className="font-mono text-[9px] text-brand-gold uppercase tracking-widest font-semibold border-b border-brand-brown/10 pb-2">4. Official Media Links</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1">Twitter / X</label>
                            <input
                              type="url"
                              value={cmsForm.socials.twitter}
                              onChange={(e) => setCmsForm({ ...cmsForm, socials: { ...cmsForm.socials, twitter: e.target.value } })}
                              className="w-full bg-[#0A0A0A] border border-brand-brown/30 rounded p-2.5"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1">Discord Gate</label>
                            <input
                              type="url"
                              value={cmsForm.socials.discord}
                              onChange={(e) => setCmsForm({ ...cmsForm, socials: { ...cmsForm.socials, discord: e.target.value } })}
                              className="w-full bg-[#0A0A0A] border border-brand-brown/30 rounded p-2.5"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1">OpenSea Collection URL</label>
                            <input
                              type="url"
                              value={cmsForm.socials.opensea}
                              onChange={(e) => setCmsForm({ ...cmsForm, socials: { ...cmsForm.socials, opensea: e.target.value } })}
                              className="w-full bg-[#0A0A0A] border border-brand-brown/30 rounded p-2.5"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#C8A46A] mb-1">Off-chain website landing</label>
                            <input
                              type="url"
                              value={cmsForm.socials.website}
                              onChange={(e) => setCmsForm({ ...cmsForm, socials: { ...cmsForm.socials, website: e.target.value } })}
                              className="w-full bg-[#0A0A0A] border border-brand-brown/30 rounded p-2.5"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-brand-brown/10">
                        <button
                          type="submit"
                          className="bg-brand-gold hover:bg-brand-cream text-brand-black font-serif font-black tracking-widest text-[11px] uppercase px-8 py-3.5 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(200,164,106,0.25)] transition-all flex items-center gap-1.5 border border-brand-gold"
                        >
                          <Save className="w-4 h-4 text-brand-black" />
                          DEPLOY ALL PARAMETERS
                        </button>
                      </div>

                    </form>
                  </div>
                )}

                {/* 6. GALLERY MANAGEMENT */}
                {activeTab === "gallery" && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-brand-brown/20 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="font-serif text-2xl font-bold tracking-wide text-brand-cream">NFT Gallery Manager</h3>
                        <p className="text-zinc-500 text-xs font-light mt-1">Manage genesis catalog, edit unique NFT IDs, order appearance, toggle visibility, and configure featured items.</p>
                      </div>

                      <button
                        onClick={() => {
                          setEditingArt({
                            visible: true,
                            featured: false,
                            displayOrder: galleryTotal + 1
                          });
                          setEditingArtOriginalId(null);
                        }}
                        className="bg-brand-gold hover:bg-brand-cream text-brand-black font-serif font-black tracking-widest text-[10px] uppercase px-4 py-2.5 rounded-lg cursor-pointer flex items-center gap-1.5 border border-brand-gold"
                      >
                        <Plus className="w-3.5 h-3.5 text-brand-black" /> Add New NFT
                      </button>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="bg-zinc-950/60 p-4 rounded-xl border border-brand-brown/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                      <div className="relative w-full md:w-72">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                          <Search className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={gallerySearch}
                          onChange={(e) => {
                            setGallerySearch(e.target.value);
                            setGalleryPage(1);
                          }}
                          placeholder="Search NFT Name, ID, or description..."
                          className="w-full bg-[#050706] text-xs pl-9 pr-4 py-2 border border-brand-brown/30 rounded focus:outline-none focus:border-brand-gold text-brand-cream font-mono placeholder-zinc-650"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Status:</span>
                          <select
                            value={galleryFilter}
                            onChange={(e) => {
                              setGalleryFilter(e.target.value);
                              setGalleryPage(1);
                            }}
                            className="bg-[#050706] text-xs border border-brand-brown/30 rounded px-2.5 py-1.5 text-brand-cream font-mono focus:outline-none focus:border-brand-gold cursor-pointer"
                          >
                            <option value="All">All Items</option>
                            <option value="Visible">Visible Only</option>
                            <option value="Hidden">Hidden Only</option>
                            <option value="Featured">Featured Only</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Sort:</span>
                          <select
                            value={gallerySortBy}
                            onChange={(e) => {
                              setGallerySortBy(e.target.value);
                              setGalleryPage(1);
                            }}
                            className="bg-[#050706] text-xs border border-brand-brown/30 rounded px-2.5 py-1.5 text-brand-cream font-mono focus:outline-none focus:border-brand-gold cursor-pointer"
                          >
                            <option value="displayOrder">Display Order</option>
                            <option value="id">NFT ID</option>
                            <option value="name">Name</option>
                          </select>
                        </div>

                        <button
                          onClick={() => {
                            setGallerySortOrder(prev => prev === "asc" ? "desc" : "asc");
                            setGalleryPage(1);
                          }}
                          className="bg-[#050706] border border-brand-brown/30 rounded p-1.5 text-zinc-400 hover:text-brand-gold hover:border-brand-gold cursor-pointer"
                          title="Toggle Direction"
                        >
                          {gallerySortOrder === "asc" ? "▲ ASC" : "▼ DESC"}
                        </button>
                      </div>
                    </div>

                    {/* Bulk Action Controls */}
                    {selectedGalleryIds.length > 0 && (
                      <div className="bg-brand-gold/10 p-3 rounded-xl border border-brand-gold/30 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 bg-brand-gold rounded-full animate-ping" />
                          <p className="font-mono text-xs text-brand-gold tracking-wide">
                            <strong>{selectedGalleryIds.length}</strong> artwork{selectedGalleryIds.length > 1 ? "s" : ""} selected for bulk management
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleBulkGalleryAction("visible", true)}
                            className="bg-[#0D0907] border border-brand-gold/20 hover:bg-brand-gold hover:text-brand-black text-[#E8D5C4] font-mono text-[10px] uppercase px-3 py-1.5 rounded transition-colors cursor-pointer"
                          >
                            Mark Visible
                          </button>
                          <button
                            onClick={() => handleBulkGalleryAction("visible", false)}
                            className="bg-[#0D0907] border border-brand-gold/20 hover:bg-brand-gold hover:text-brand-black text-[#E8D5C4] font-mono text-[10px] uppercase px-3 py-1.5 rounded transition-colors cursor-pointer"
                          >
                            Hide Selected
                          </button>
                          <button
                            onClick={() => handleBulkGalleryAction("featured", true)}
                            className="bg-[#0D0907] border border-brand-gold/20 hover:bg-brand-gold hover:text-brand-black text-[#E8D5C4] font-mono text-[10px] uppercase px-3 py-1.5 rounded transition-colors cursor-pointer"
                          >
                            Feature Selected
                          </button>
                          <button
                            onClick={() => handleBulkGalleryAction("featured", false)}
                            className="bg-[#0D0907] border border-brand-gold/20 hover:bg-brand-gold hover:text-brand-black text-[#E8D5C4] font-mono text-[10px] uppercase px-3 py-1.5 rounded transition-colors cursor-pointer"
                          >
                            Unfeature Selected
                          </button>
                          <button
                            onClick={() => handleBulkGalleryAction("delete")}
                            className="bg-red-950/40 border border-red-500/35 text-red-300 hover:bg-red-500 hover:text-white font-mono text-[10px] uppercase px-3 py-1.5 rounded transition-colors cursor-pointer"
                          >
                            Delete Selected
                          </button>
                          <button
                            onClick={() => setSelectedGalleryIds([])}
                            className="text-zinc-500 hover:text-zinc-300 font-mono text-[10px] underline ml-2 cursor-pointer"
                          >
                            Cancel selection
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left: Paginated table listing */}
                      <div className="lg:col-span-7 space-y-4">
                        {gallery.length === 0 ? (
                          <div className="text-center py-24 border border-dashed border-brand-brown/20 rounded-2xl bg-[#050706]">
                            <Search className="w-10 h-10 text-brand-gold/35 mx-auto mb-3" />
                            <p className="font-serif text-base text-brand-cream">No matching artworks found</p>
                            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Adjust search filter, clear keywords, or create a brand new spirit NFT above.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-[#050706]/65 border border-brand-brown/15 rounded-xl overflow-hidden">
                              <div className="overflow-x-auto">
                                <table className="w-full text-left font-mono text-xs">
                                  <thead>
                                    <tr className="border-b border-brand-brown/15 bg-black/40 text-[10px] uppercase text-zinc-500 tracking-wider">
                                      <th className="p-3 w-10 text-center">
                                        <input
                                          type="checkbox"
                                          checked={gallery.length > 0 && gallery.every(g => selectedGalleryIds.includes(g.id))}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              const currentPageIds = gallery.map(g => g.id);
                                              setSelectedGalleryIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
                                            } else {
                                              const currentPageIds = gallery.map(g => g.id);
                                              setSelectedGalleryIds(prev => prev.filter(id => !currentPageIds.includes(id)));
                                            }
                                          }}
                                          className="rounded border-zinc-700 bg-zinc-900 text-brand-gold focus:ring-brand-gold focus:ring-opacity-25 cursor-pointer h-3.5 w-3.5"
                                        />
                                      </th>
                                      <th className="p-3 w-16">Artwork</th>
                                      <th className="p-3">Spirit Identity</th>
                                      <th className="p-3">Asset Path</th>
                                      <th className="p-3 w-12 text-center" title="Sort Order">Order</th>
                                      <th className="p-3 w-28 text-center">Flags</th>
                                      <th className="p-3 w-20 text-right">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-brand-brown/10">
                                    {gallery.map((art, index) => {
                                      const isSelected = selectedGalleryIds.includes(art.id);
                                      return (
                                        <tr
                                          key={art.id}
                                          className={`hover:bg-[#0A110D]/35 transition-colors ${isSelected ? "bg-brand-gold/[0.03]" : ""}`}
                                        >
                                          <td className="p-3 text-center">
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  setSelectedGalleryIds(prev => [...prev, art.id]);
                                                } else {
                                                  setSelectedGalleryIds(prev => prev.filter(id => id !== art.id));
                                                }
                                              }}
                                              className="rounded border-zinc-700 bg-zinc-900 text-brand-gold focus:ring-brand-gold focus:ring-opacity-25 cursor-pointer h-3.5 w-3.5"
                                            />
                                          </td>
                                          <td className="p-3">
                                            <img
                                              src={art.image}
                                              alt={art.name}
                                              referrerPolicy="no-referrer"
                                              className="w-10 h-10 rounded object-cover border border-[#C8A46A]/20 bg-black/40"
                                              onError={(e) => {
                                                // Fallback image source if missing
                                                (e.target as any).src = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5";
                                              }}
                                            />
                                          </td>
                                          <td className="p-3">
                                            <div className="font-serif font-bold text-brand-cream truncate max-w-[140px]" title={art.name}>
                                              {art.name}
                                            </div>
                                            <div className="text-[9.5px] text-[#C8A46A] tracking-wider mt-0.5 font-mono">
                                              YOKAIO #{String(art.id).padStart(3, '0')}
                                            </div>
                                          </td>
                                          <td className="p-3">
                                            <div className="font-mono text-[9.5px] text-zinc-500 max-w-[130px] truncate" title={art.image}>
                                              {art.image}
                                            </div>
                                          </td>
                                          <td className="p-3 text-center text-brand-cream font-bold">
                                            {art.displayOrder !== undefined ? art.displayOrder : art.id}
                                          </td>
                                          <td className="p-3">
                                            <div className="flex items-center justify-center gap-1.5">
                                              {/* Visibility badge */}
                                              <span
                                                className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold tracking-wider uppercase font-mono ${
                                                  art.visible !== false
                                                    ? "bg-green-950/40 text-green-400 border border-green-500/20"
                                                    : "bg-red-950/40 text-red-400 border border-red-500/20"
                                                }`}
                                                title={art.visible !== false ? "Visible to public" : "Hidden from public"}
                                              >
                                                {art.visible !== false ? "Visible" : "Hidden"}
                                              </span>

                                              {/* Featured badge */}
                                              {art.featured && (
                                                <span
                                                  className="bg-amber-950/40 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded text-[8.5px] font-bold tracking-wider uppercase font-mono"
                                                  title="Featured Showcase NFT"
                                                >
                                                  Featured
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="p-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                              {/* Move operations */}
                                              <button
                                                disabled={index === 0 && galleryPage === 1}
                                                onClick={() => handleMoveGalleryItem(index, "up")}
                                                className="p-1 border border-brand-brown/25 hover:border-brand-gold text-zinc-500 hover:text-brand-gold bg-black/30 rounded text-[9px] disabled:opacity-20 cursor-pointer"
                                                title="Reorder up"
                                              >
                                                ▲
                                              </button>
                                              <button
                                                disabled={index === gallery.length - 1 && galleryPage === galleryTotalPages}
                                                onClick={() => handleMoveGalleryItem(index, "down")}
                                                className="p-1 border border-brand-brown/25 hover:border-brand-gold text-zinc-500 hover:text-brand-gold bg-black/30 rounded text-[9px] disabled:opacity-20 cursor-pointer"
                                                title="Reorder down"
                                              >
                                                ▼
                                              </button>

                                              {/* Edit */}
                                              <button
                                                onClick={() => startEditingArt(art)}
                                                className="p-1.5 border border-brand-brown/30 text-brand-gold hover:text-brand-black hover:bg-brand-gold rounded transition-colors cursor-pointer"
                                                title="Edit artwork details"
                                              >
                                                <Edit className="w-3.5 h-3.5" />
                                              </button>

                                              {/* Delete */}
                                              <button
                                                onClick={() => handleDeleteGalleryArt(art.id)}
                                                className="p-1.5 border border-red-900/35 text-red-400 hover:text-white hover:bg-red-500 rounded transition-colors cursor-pointer"
                                                title="Permanently Delete"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Pagination controls */}
                            {galleryTotalPages > 1 && (
                              <div className="bg-[#050706] p-3 rounded-xl border border-brand-brown/15 flex items-center justify-between font-mono text-[10.5px]">
                                <button
                                  disabled={galleryPage <= 1}
                                  onClick={() => setGalleryPage(prev => Math.max(1, prev - 1))}
                                  className="px-3 py-1 bg-black/40 border border-brand-brown/25 text-brand-cream hover:border-brand-gold hover:text-brand-gold rounded cursor-pointer disabled:opacity-25"
                                >
                                  ← Back
                                </button>
                                <span className="text-zinc-500 uppercase tracking-widest text-[9.5px]">
                                  Page <strong className="text-brand-cream">{galleryPage}</strong> of <strong className="text-brand-cream">{galleryTotalPages}</strong>
                                  <span className="mx-2 text-brand-brown/35">|</span> Total Items: <strong className="text-brand-gold">{galleryTotal}</strong>
                                </span>
                                <button
                                  disabled={galleryPage >= galleryTotalPages}
                                  onClick={() => setGalleryPage(prev => Math.min(galleryTotalPages, prev + 1))}
                                  className="px-3 py-1 bg-black/40 border border-brand-brown/25 text-brand-cream hover:border-brand-gold hover:text-brand-gold rounded cursor-pointer disabled:opacity-25"
                                >
                                  Next →
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Add/Modify Form */}
                      <div className="lg:col-span-5 border-l border-brand-brown/15 lg:pl-6">
                        {editingArt ? (
                          <form onSubmit={handleSaveGalleryArt} className="bg-zinc-950/45 p-6 rounded-xl border border-brand-gold/25 space-y-4">
                            <h4 className="font-serif text-sm font-bold text-brand-gold border-b border-brand-brown/15 pb-2 flex justify-between items-center">
                              <span>{editingArtOriginalId !== null ? `Edit NFT details (Original ID: ${editingArtOriginalId})` : "Create New NFT Artwork"}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingArt(null);
                                  setEditingArtOriginalId(null);
                                }}
                                className="text-zinc-500 hover:text-brand-cream"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </h4>

                            <div className="grid grid-cols-2 gap-3.5">
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-brand-gold mb-1 font-semibold">NFT ID (Token Number)</label>
                                <input
                                  type="number"
                                  value={editingArt.id !== undefined ? editingArt.id : ""}
                                  onChange={(e) => setEditingArt({ ...editingArt, id: e.target.value ? Number(e.target.value) : undefined })}
                                  placeholder="e.g. 1"
                                  className="w-full bg-[#050706] text-xs border border-brand-brown/30 rounded p-2 focus:outline-none focus:border-brand-gold text-brand-cream font-mono"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono uppercase text-brand-gold mb-1 font-semibold">Display Order</label>
                                <input
                                  type="number"
                                  value={editingArt.displayOrder !== undefined ? editingArt.displayOrder : ""}
                                  onChange={(e) => setEditingArt({ ...editingArt, displayOrder: e.target.value ? Number(e.target.value) : undefined })}
                                  placeholder="e.g. 1"
                                  className="w-full bg-[#050706] text-xs border border-brand-brown/30 rounded p-2 focus:outline-none focus:border-brand-gold text-brand-cream font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase text-brand-gold mb-1 font-semibold">NFT Artwork Name</label>
                              <input
                                type="text"
                                value={editingArt.name || ""}
                                onChange={(e) => setEditingArt({ ...editingArt, name: e.target.value })}
                                placeholder="YOKAIO #001"
                                className="w-full bg-[#050706] text-xs border border-brand-brown/30 rounded p-2 focus:outline-none focus:border-brand-gold text-brand-cream"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-1">
                              <label className="flex items-center gap-2 bg-[#050706] border border-brand-brown/30 p-2.5 rounded cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={editingArt.visible !== false}
                                  onChange={(e) => setEditingArt({ ...editingArt, visible: e.target.checked })}
                                  className="rounded border-zinc-700 bg-zinc-900 text-brand-gold focus:ring-brand-gold cursor-pointer"
                                />
                                <div className="text-left">
                                  <p className="text-[10px] font-mono uppercase text-brand-cream font-bold">Publicly Visible</p>
                                  <p className="text-[8.5px] text-zinc-500">Show in art gallery</p>
                                </div>
                              </label>

                              <label className="flex items-center gap-2 bg-[#050706] border border-brand-brown/30 p-2.5 rounded cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={!!editingArt.featured}
                                  onChange={(e) => setEditingArt({ ...editingArt, featured: e.target.checked })}
                                  className="rounded border-zinc-700 bg-zinc-900 text-brand-gold focus:ring-brand-gold cursor-pointer"
                                />
                                <div className="text-left">
                                  <p className="text-[10px] font-mono uppercase text-brand-cream font-bold">Featured status</p>
                                  <p className="text-[8.5px] text-zinc-500">Mark as starred item</p>
                                </div>
                              </label>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase text-brand-gold mb-1 font-semibold">
                                Character Illustration Asset
                              </label>

                              {/* Drag and Drop Zone */}
                              <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={async (e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files?.[0];
                                  if (file) {
                                    setUploading(true);
                                    try {
                                      const ext = file.name.split('.').pop();
                                      const path = `gallery_${Date.now()}.${ext}`;
                                      const { error } = await supabase.storage
                                        .from('gallery')
                                        .upload(path, file);
                                      if (error) {
                                        triggerToast(`Upload error: ${error.message}`);
                                      } else {
                                        const { data: { publicUrl } } = supabase.storage
                                          .from('gallery')
                                          .getPublicUrl(path);
                                        setEditingArt({ ...editingArt, image: publicUrl });
                                        triggerToast("Dynamic asset uploaded straight to storage!");
                                      }
                                    } catch (err: any) {
                                      triggerToast(`Storage malfunction: ${err.message}`);
                                    } finally {
                                      setUploading(false);
                                    }
                                  }
                                }}
                                className="border border-dashed border-brand-brown/30 rounded-xl p-4 text-center cursor-pointer hover:border-brand-gold transition-colors bg-[#080505] flex flex-col items-center justify-center space-y-2 relative min-h-[90px]"
                              >
                                {uploading ? (
                                  <div className="flex flex-col items-center gap-1.5 py-4 bg-[#080505]">
                                    <div className="h-5 w-5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                                    <span className="font-mono text-[9px] text-[#C8A46A] uppercase animate-pulse">Syncing File Container...</span>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="w-5 h-5 text-brand-gold/60" />
                                    <div className="space-y-1 bg-[#080505]">
                                      <p className="font-mono text-[10.5px] text-[#E8D5C4]">Drag artwork here or click selection</p>
                                      <p className="font-mono text-[8.5px] text-zinc-500">Supports JPG, PNG, WEBP (Max 5MB)</p>
                                    </div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setUploading(true);
                                          try {
                                            const ext = file.name.split('.').pop();
                                            const path = `gallery_${Date.now()}.${ext}`;
                                            const { error } = await supabase.storage
                                              .from('gallery')
                                              .upload(path, file);
                                            if (error) {
                                              triggerToast(`Upload error: ${error.message}`);
                                            } else {
                                              const { data: { publicUrl } } = supabase.storage
                                                .from('gallery')
                                                .getPublicUrl(path);
                                              setEditingArt({ ...editingArt, image: publicUrl });
                                              triggerToast("Dynamic asset uploaded straight to storage!");
                                            }
                                          } catch (err: any) {
                                            triggerToast(`Storage malfunction: ${err.message}`);
                                          } finally {
                                            setUploading(false);
                                          }
                                        }
                                      }}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                  </>
                                )}
                              </div>

                              <div className="mt-3">
                                <label className="block text-[8.5px] font-mono uppercase text-zinc-500 mb-1">Backup Image Link / Dedicated Path</label>
                                <input
                                  type="text"
                                  value={editingArt.image || ""}
                                  onChange={(e) => setEditingArt({ ...editingArt, image: e.target.value })}
                                  placeholder="/gallery/001.png"
                                  className="w-full bg-[#050706] font-mono text-xs border border-brand-brown/30 rounded p-2 focus:outline-none focus:border-brand-gold text-brand-cream"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase text-brand-gold mb-1 font-semibold">Teaser Brief</label>
                              <input
                                type="text"
                                value={editingArt.description || ""}
                                onChange={(e) => setEditingArt({ ...editingArt, description: e.target.value })}
                                placeholder="Freshly awakened Yokaio collectible..."
                                className="w-full bg-[#050706] text-xs border border-brand-brown/30 rounded p-2 focus:outline-none focus:border-brand-gold text-brand-cream"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase text-brand-gold mb-1 font-semibold">Chronicles Mythology & Lore</label>
                              <textarea
                                value={editingArt.characterLore || ""}
                                onChange={(e) => setEditingArt({ ...editingArt, characterLore: e.target.value })}
                                rows={4}
                                placeholder="Enter detailed folkloric back-lore..."
                                className="w-full bg-[#050706] text-xs border border-brand-brown/30 rounded p-2 focus:outline-none focus:border-brand-gold text-brand-cream"
                              />
                            </div>

                            <div className="flex justify-end gap-2 pr-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingArt(null);
                                  setEditingArtOriginalId(null);
                                }}
                                className="px-3.5 py-1.5 text-xs font-mono uppercase text-zinc-500 hover:text-brand-cream bg-[#0A0A0A] border border-zinc-800 rounded"
                              >
                                Discard
                              </button>
                              <button
                                type="submit"
                                className="bg-brand-gold hover:bg-brand-cream text-brand-black font-serif font-black tracking-wider text-[10px] uppercase px-4 py-2 rounded shadow-md border border-brand-gold"
                              >
                                SAVE ART DETAILS
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="border border-dashed border-brand-brown/20 bg-[#050706] p-10 h-full rounded-xl flex flex-col items-center justify-center text-center">
                            <Plus className="w-8 h-8 text-brand-brown/40 mb-3" />
                            <p className="font-serif text-brand-cream text-sm">Artwork Editor Idle</p>
                            <p className="text-[10px] text-zinc-500 max-w-xs mt-1 mb-4">Select any edit icon or click the button below to expand the premium showcase catalog lineup.</p>
                            <button
                              onClick={() => {
                                setEditingArt({
                                  visible: true,
                                  featured: false,
                                  displayOrder: galleryTotal + 1
                                });
                                setEditingArtOriginalId(null);
                              }}
                              className="bg-brand-gold/10 hover:bg-brand-gold hover:text-brand-black text-brand-gold border border-brand-gold/30 font-serif font-black tracking-widest text-[9px] uppercase px-4 py-2 rounded-lg cursor-pointer"
                            >
                              Add New NFT
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* 7. SYSTEM AUDIT LOGS DISPLAY */}
                {activeTab === "audit" && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-brand-brown/20 pb-4">
                      <h3 className="font-serif text-2xl font-bold tracking-wide text-brand-cream">Sanctum System Audit Train</h3>
                      <p className="text-zinc-500 text-xs font-light mt-1">Immutable tracker tracking manual changes and applicant signoffs.</p>
                    </div>

                    <div className="border border-brand-brown/25 rounded-xl bg-zinc-950/40 p-4 font-mono text-[11px]">
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {logs.map((log) => (
                          <div key={log.id} className="border-b border-brand-brown/10 pb-3 flex flex-col sm:flex-row justify-between items-start gap-2 text-zinc-400">
                            <div>
                              <p className="text-xxs text-zinc-600 font-normal">
                                {new Date(log.timestamp).toLocaleString()} &bull; {log.id} &bull; OPERATOR: <span className="text-brand-gold">{log.user}</span>
                              </p>
                              <h5 className="text-xs font-bold text-brand-cream uppercase mt-1">✦ {log.action}</h5>
                              <p className="text-zinc-405 font-light leading-relaxed mt-0.5">{log.details}</p>
                            </div>
                          </div>
                        ))}

                        {logs.length === 0 && (
                          <div className="py-12 text-center text-zinc-500">
                            NO REGISTERED LOG ENTRIES LOGGED.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* APPLICATION DETAIL INSPECT MODEL OVERLAY */}
            <AnimatePresence>
              {viewingApp && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/95 backdrop-blur-md z-60 flex items-center justify-center p-4"
                  onClick={() => setViewingApp(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className="relative max-w-2xl w-full bg-[#16120E] border-2 border-brand-gold rounded-2xl shadow-[0_0_50px_rgba(200,164,106,0.35)] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center bg-brand-black py-4 px-6 border-b border-brand-brown/25">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-500 text-xs">RECORD ID:</span>
                        <span className="font-mono text-brand-gold font-bold text-sm">{viewingApp.id}</span>
                      </div>
                      <button 
                        onClick={() => setViewingApp(null)} 
                        className="text-zinc-500 hover:text-brand-cream border border-brand-brown/20 bg-black/50 p-1.5 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-6 md:p-8 space-y-5 text-left">
                      {/* Meta columns */}
                      <div className="grid grid-cols-2 gap-4 border-b border-[#3D2B22]/15 pb-4 font-mono text-xs">
                        <div>
                          <p className="text-zinc-555 text-xxs font-semibold">X USERNAME PROFILE</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[#E8D5C4] font-bold text-sm">{viewingApp.xUsername}</span>
                            <button onClick={() => copyText(viewingApp.xUsername, "X Profile Name")} className="text-zinc-500 hover:text-brand-gold p-0.5"><Copy className="w-3.5 h-3.5" /></button>
                            <a href={`https://x.com/${viewingApp.xUsername.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[#C8A46A] p-0.5"><ExternalLink className="w-3.5 h-3.5" /></a>
                          </div>
                        </div>

                        <div>
                          <p className="text-zinc-555 text-xxs font-semibold">ETHEREUM WALLET</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-brand-gold font-medium truncate max-w-[170px]">{viewingApp.walletAddress}</span>
                            <button onClick={() => copyText(viewingApp.walletAddress, "Wallet Address")} className="text-zinc-500 hover:text-brand-gold p-0.5"><Copy className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>

                      {/* Comment tweet Proof link */}
                      <div className="text-xs font-mono">
                        <p className="text-zinc-555 text-xxs font-semibold">TWEET ANCHOR PROOF LINK</p>
                        <div className="mt-1 flex items-center justify-between p-2 rounded bg-black/60 border border-brand-brown/10">
                          <span className="truncate pr-4 text-blue-400 max-w-[400px]">{viewingApp.commentLink}</span>
                          <a href={viewingApp.commentLink} target="_blank" rel="noopener noreferrer" className="bg-[#1C2033] text-blue-400 border border-blue-900/30 px-3 py-1 rounded text-xxs font-bold shrink-0 flex items-center gap-1">Open <ExternalLink className="w-3 h-3" /></a>
                        </div>
                      </div>

                      {/* Statement text */}
                      <div className="space-y-1.5 text-xs text-[#E8D5C4]">
                        <p className="font-mono text-zinc-555 text-xxs font-semibold">APPLICANT STATEMENT REASON</p>
                        <div className="bg-black/50 border border-brand-brown/10 p-4 rounded-xl leading-relaxed max-h-[140px] overflow-y-auto pr-1 text-sm font-light">
                          &ldquo;{viewingApp.reason}&rdquo;
                        </div>
                      </div>

                      {/* Admin Notes Section */}
                      <div className="space-y-1.5 text-xs">
                        <p className="font-mono text-zinc-555 text-xxs font-semibold">ADMINISTRATIVE HANDWRITTEN NOTES</p>
                        <textarea
                          value={appNotes}
                          onChange={(e) => setAppNotes(e.target.value)}
                          placeholder="Annotate details for partnership checks..."
                          className="w-full bg-[#0A0A0A] border rounded-xl p-3 focus:outline-none focus:border-brand-gold text-xs font-mono"
                          rows={2.5}
                        />
                      </div>

                      {/* Bottom Decision and Save buttons */}
                      <div className="border-t border-[#3D2B22]/15 pt-5 flex justify-between items-center">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAppStatusChange(viewingApp.id, "Approved")}
                            className="bg-green-600 hover:bg-green-500 font-serif font-black tracking-wider text-[10px] text-brand-black px-4 py-2.5 rounded-lg cursor-pointer flex items-center gap-1 border border-green-500/50"
                          >
                            <Check className="w-3.5 h-3.5" /> APPROVE WL
                          </button>
                          <button
                            onClick={() => handleAppStatusChange(viewingApp.id, "Waitlisted")}
                            className="bg-indigo-650 hover:bg-indigo-600 font-serif font-black tracking-wider text-[10px] text-brand-cream px-4 py-2.5 rounded-lg cursor-pointer flex items-center gap-1 border border-indigo-500/40"
                          >
                            WAITLIST
                          </button>
                          <button
                            onClick={() => handleAppStatusChange(viewingApp.id, "Rejected")}
                            className="bg-red-950/40 hover:bg-red-950/85 font-serif font-black tracking-wider text-[10px] text-red-400 px-4 py-2.5 rounded-lg cursor-pointer flex items-center gap-1 border border-red-900/30"
                          >
                            REJECT
                          </button>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={async () => {
                              try {
                                const res = await adminFetch(`/api/applications/${viewingApp.id}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({ status: viewingApp.status, adminNotes: appNotes })
                                });
                                if (res.ok) {
                                  triggerToast("Handwritten notes saved");
                                  fetchAllAdminData();
                                }
                              } catch (e) {
                                triggerToast("Notes saving error");
                              }
                            }}
                            className="p-2 bg-zinc-900 hover:bg-zinc-855 rounded border border-brand-brown/30 text-[#C8A46A] tracking-wider font-mono text-[10px] uppercase cursor-pointer"
                            title="Save Notes without altering status"
                          >
                            Save Note Only
                          </button>
                          <button
                            onClick={() => handleAppDelete(viewingApp.id)}
                            className="p-2 hover:bg-red-950/50 hover:text-red-400 text-zinc-500 rounded border border-brand-brown/15 cursor-pointer"
                            title="Remove Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

      </div>
    </div>
  );
}
