export interface WhitelistApplication {
  id: string;
  xUsername: string; // e.g. @nickname
  walletAddress: string; // 0x...
  commentLink: string;
  reason: string;
  submissionDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Waitlisted';
  adminNotes: string;
}

export type SpiritCategory = string;
export type SpiritRarity = string;

export interface CollectibleNFT {
  id: number;
  name: string;
  category: SpiritCategory;
  rarity: SpiritRarity;
  image: string;
  description: string;
  characterLore: string;
  displayOrder: number;
  visible: boolean;
  featured: boolean;
}

export interface WhitelistTask {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  externalLink: string;
  active: boolean;
  type: 'x-follow' | 'x-repost' | 'x-comment' | 'discord-join';
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  description: string;
  items: string[];
  status: 'Completed' | 'Active' | 'Next' | 'Locked';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface CMSContent {
  heroTitle: string;
  heroHeadline: string;
  heroDescription: string;
  aboutTitle: string;
  aboutContent: string;
  wlStatus: 'Open' | 'Closed';
  mintPrice: string;
  mintDate: string;
  supply: number;
  socials: {
    twitter: string;
    discord: string;
    website: string;
    opensea: string;
  };
}

export interface WalletCheckState {
  address: string;
  status: 'Approved WL' | 'Priority WL' | 'Waitlist' | 'Not Eligible';
  note?: string;
  checkedAt?: string;
}

export interface WalletRecord {
  address: string;
  status: 'Approved WL' | 'Priority WL' | 'Waitlist';
  username: string; // X user
  addedAt: string;
  customNote?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
}
