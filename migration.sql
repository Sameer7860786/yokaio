-- YOKAIO Supabase Table & Security Provisioning Migration
-- This script configures the database schema, RLS rules, and storage buckets for the production application.

-- -------------------------------------------------------------
-- 1. DROP EXISTING TO PREVENT CONFLICTS
-- -------------------------------------------------------------
DROP TABLE IF EXISTS "activity_logs" CASCADE;
DROP TABLE IF EXISTS "tasks" CASCADE;
DROP TABLE IF EXISTS "gallery_items" CASCADE;
DROP TABLE IF EXISTS "wallets" CASCADE;
DROP TABLE IF EXISTS "applications" CASCADE;
DROP TABLE IF EXISTS "cms_content" CASCADE;

-- -------------------------------------------------------------
-- 2. CREATE SCHEMA TABLES
-- -------------------------------------------------------------

-- CMS Content (Holds editable website strings and configuration)
CREATE TABLE "cms_content" (
  "id" INTEGER PRIMARY KEY CHECK ("id" = 1),
  "heroTitle" TEXT NOT NULL DEFAULT 'YOKAIO',
  "heroHeadline" TEXT NOT NULL DEFAULT 'YOKAIO 👹⚔️',
  "heroDescription" TEXT NOT NULL,
  "aboutTitle" TEXT NOT NULL DEFAULT 'WHAT IS YOKAIO?',
  "aboutContent" TEXT NOT NULL,
  "wlStatus" TEXT NOT NULL DEFAULT 'Open',
  "mintPrice" TEXT NOT NULL DEFAULT 'TBA',
  "mintDate" TEXT NOT NULL DEFAULT 'TBA',
  "supply" INTEGER NOT NULL DEFAULT 100,
  "socials" JSONB NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Whitelist Applications (Public submissions)
CREATE TABLE "applications" (
  "id" TEXT PRIMARY KEY,
  "xUsername" TEXT UNIQUE NOT NULL,
  "walletAddress" TEXT UNIQUE NOT NULL,
  "commentLink" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "submissionDate" TIMESTAMPTZ DEFAULT NOW(),
  "status" TEXT NOT NULL DEFAULT 'Pending' CHECK ("status" IN ('Pending', 'Approved', 'Rejected', 'Waitlisted')),
  "adminNotes" TEXT DEFAULT '',
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets Database (Manual whitelist and synchronized approvals)
CREATE TABLE "wallets" (
  "address" TEXT PRIMARY KEY,
  "status" TEXT NOT NULL DEFAULT 'Approved WL' CHECK ("status" IN ('Approved WL', 'Priority WL', 'Waitlist')),
  "username" TEXT NOT NULL DEFAULT 'Manual Intake',
  "addedAt" TIMESTAMPTZ DEFAULT NOW(),
  "customNote" TEXT DEFAULT 'Added manually by overseer'
);

-- Gallery Items (NFT characters roster)
CREATE TABLE "gallery_items" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "rarity" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "description" TEXT,
  "characterLore" TEXT,
  "displayOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Activity/Audit Logs (Action history)
CREATE TABLE "activity_logs" (
  "id" SERIAL PRIMARY KEY,
  "action" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "username" TEXT NOT NULL DEFAULT 'System',
  "timestamp" TIMESTAMPTZ DEFAULT NOW()
);

-- Interactive Tasks setup
CREATE TABLE "tasks" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "buttonLabel" TEXT,
  "externalLink" TEXT,
  "active" BOOLEAN DEFAULT TRUE,
  "type" TEXT,
  "displayOrder" INTEGER DEFAULT 0
);

-- -------------------------------------------------------------
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- -------------------------------------------------------------
ALTER TABLE "cms_content" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wallets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gallery_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activity_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- 4. CREATE RLS POLICIES
-- -------------------------------------------------------------

-- A. CMS Content: Public can read, authenticated admin full control
CREATE POLICY "Allow public read-only of CMS" 
ON "cms_content" FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full control of CMS" 
ON "cms_content" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- B. Tasks: Public can read, authenticated admin full control
CREATE POLICY "Allow public read-only of Tasks" 
ON "tasks" FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full control of Tasks" 
ON "tasks" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- C. Gallery Items: Public can read, authenticated admin full control
CREATE POLICY "Allow public read-only of Gallery" 
ON "gallery_items" FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full control of Gallery" 
ON "gallery_items" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- D. Applications: Public can insert/read, authenticated admin full control
CREATE POLICY "Allow public inserts of Applications" 
ON "applications" FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public reads of Applications" 
ON "applications" FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full control of Applications" 
ON "applications" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- E. Wallets: Public can read to verify status, authenticated admin full control
CREATE POLICY "Allow public select of Wallets" 
ON "wallets" FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full control of Wallets" 
ON "wallets" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- F. Activity Logs: Public/authenticated can write logs, authenticated admin read all logs
CREATE POLICY "Allow log creation" 
ON "activity_logs" FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated view of activity logs" 
ON "activity_logs" FOR SELECT TO authenticated USING (true);


-- -------------------------------------------------------------
-- 5. STORAGE BUCKET & STORAGE POLICIES
-- -------------------------------------------------------------
-- Instructions: Create a bucket named 'gallery' in Supabase Storage with public access enabled.
-- Run the following SQL if writing rules programmatically for the 'gallery' bucket:

-- Allow public access to read files from gallery bucket
CREATE POLICY "Allow public select on gallery storage"
ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

-- Allow authenticated admins to fully manage items in the gallery bucket
CREATE POLICY "Allow authenticated admin to fully manage gallery storage"
ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'gallery')
WITH CHECK (bucket_id = 'gallery');
