ALTER TABLE "public"."menu_items" ALTER COLUMN "foodType" SET DEFAULT 'VEG';
CREATE UNIQUE INDEX IF NOT EXISTS "universities_code_key" ON "public"."universities"("code");
