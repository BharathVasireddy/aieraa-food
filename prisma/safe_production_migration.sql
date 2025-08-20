-- Ensure enum has READY_TO_COLLECT
ALTER TYPE "public"."OrderStatus" ADD VALUE IF NOT EXISTS 'READY_TO_COLLECT';

BEGIN;
-- Universities settings
ALTER TABLE "public"."universities" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh';
ALTER TABLE "public"."universities" ADD COLUMN IF NOT EXISTS "orderCutoffTime" TEXT NOT NULL DEFAULT '20:00';
ALTER TABLE "public"."universities" ADD COLUMN IF NOT EXISTS "maxAdvanceDays" INTEGER NOT NULL DEFAULT 7;
CREATE UNIQUE INDEX IF NOT EXISTS "universities_code_key" ON "public"."universities"("code");

-- Users reset token fields
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "resetTokenHash" TEXT;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "resetTokenExpiresAt" TIMESTAMP(3);

-- Orders scheduledForDate
ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "scheduledForDate" TIMESTAMP(3);
UPDATE "public"."orders" SET "scheduledForDate" = DATE_TRUNC('day', "createdAt") WHERE "scheduledForDate" IS NULL;
ALTER TABLE "public"."orders" ALTER COLUMN "scheduledForDate" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "orders_universityId_idx" ON "public"."orders"("universityId");
CREATE INDEX IF NOT EXISTS "orders_scheduledForDate_idx" ON "public"."orders"("scheduledForDate");

-- Cart items scheduledForDate
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='cart_items_userId_menuItemId_variantId_key') THEN
    DROP INDEX "public"."cart_items_userId_menuItemId_variantId_key";
  END IF;
END $$;
ALTER TABLE "public"."cart_items" ADD COLUMN IF NOT EXISTS "scheduledForDate" TIMESTAMP(3);
UPDATE "public"."cart_items" SET "scheduledForDate" = DATE_TRUNC('day', "createdAt") WHERE "scheduledForDate" IS NULL;
ALTER TABLE "public"."cart_items" ALTER COLUMN "scheduledForDate" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_userId_menuItemId_variantId_scheduledForDate_key" ON "public"."cart_items"("userId", "menuItemId", "variantId", "scheduledForDate");

-- Menu items fields
ALTER TABLE "public"."menu_items" ADD COLUMN IF NOT EXISTS "foodType" "public"."FoodType";
UPDATE "public"."menu_items" SET "foodType" = 'VEG' WHERE "foodType" IS NULL;
ALTER TABLE "public"."menu_items" ALTER COLUMN "foodType" SET NOT NULL;
ALTER TABLE "public"."menu_items" ADD COLUMN IF NOT EXISTS "slug" TEXT;
-- Backfill slugs for existing rows where null
WITH base AS (
  SELECT id,
         LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s_-]', '', 'g')) AS cleaned,
         "menuId"
  FROM "public"."menu_items"
  WHERE slug IS NULL
),
slugged AS (
  SELECT id, "menuId",
         REGEXP_REPLACE(TRIM(BOTH '-' FROM REGEXP_REPLACE(cleaned, '[\s_]+', '-', 'g')), '-{2,}', '-', 'g') AS base_slug
  FROM base
),
ranked AS (
  SELECT id, "menuId", base_slug,
         ROW_NUMBER() OVER (PARTITION BY "menuId", base_slug ORDER BY id) AS rn
  FROM slugged
)
UPDATE "public"."menu_items" mi
SET slug = CASE WHEN r.rn = 1 THEN r.base_slug ELSE r.base_slug || '-' || (r.rn - 1)::text END
FROM ranked r
WHERE mi.id = r.id AND mi.slug IS NULL;

-- Ensure no null slugs remain, if so, fallback to id suffix
UPDATE "public"."menu_items" SET slug = 'item-' || SUBSTRING(id FROM LENGTH(id)-7 FOR 8) WHERE slug IS NULL;

-- Now enforce constraints
ALTER TABLE "public"."menu_items" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "menu_items_slug_menuId_key" ON "public"."menu_items"("slug", "menuId");

-- Category table (if not existing)
CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "universityId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_universityId_key" ON "public"."categories"("name", "universityId");
ALTER TABLE "public"."categories" ADD CONSTRAINT IF NOT EXISTS "categories_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "public"."universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Menu item availability table
CREATE TABLE IF NOT EXISTS "public"."menu_item_availability" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "menu_item_availability_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "menu_item_availability_date_idx" ON "public"."menu_item_availability"("date");
CREATE UNIQUE INDEX IF NOT EXISTS "menu_item_availability_menuItemId_date_key" ON "public"."menu_item_availability"("menuItemId", "date");
ALTER TABLE "public"."menu_item_availability" ADD CONSTRAINT IF NOT EXISTS "menu_item_availability_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "public"."menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- University managers index
CREATE INDEX IF NOT EXISTS "university_managers_managerId_idx" ON "public"."university_managers"("managerId");

COMMIT;
