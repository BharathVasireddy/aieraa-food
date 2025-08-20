-- CreateEnum
CREATE TYPE "public"."FoodType" AS ENUM ('VEG', 'NON_VEG', 'HALAL');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."OrderStatus_new" AS ENUM ('PENDING', 'APPROVED', 'PREPARING', 'READY_TO_COLLECT', 'DELIVERED', 'CANCELLED');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."orders" ALTER COLUMN "status" TYPE "public"."OrderStatus_new" USING ("status"::text::"public"."OrderStatus_new");
ALTER TYPE "public"."OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "public"."OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "public"."orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex
DROP INDEX "public"."cart_items_userId_menuItemId_variantId_key";

-- AlterTable
ALTER TABLE "public"."cart_items" ADD COLUMN     "scheduledForDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."menu_items" ADD COLUMN     "foodType" "public"."FoodType" NOT NULL DEFAULT 'VEG',
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "scheduledForDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."universities" ADD COLUMN     "maxAdvanceDays" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "orderCutoffTime" TEXT NOT NULL DEFAULT '20:00',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "resetTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "resetTokenHash" TEXT;

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "universityId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."menu_item_availability" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_item_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_universityId_key" ON "public"."categories"("name", "universityId");

-- CreateIndex
CREATE INDEX "menu_item_availability_date_idx" ON "public"."menu_item_availability"("date");

-- CreateIndex
CREATE UNIQUE INDEX "menu_item_availability_menuItemId_date_key" ON "public"."menu_item_availability"("menuItemId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_userId_menuItemId_variantId_scheduledForDate_key" ON "public"."cart_items"("userId", "menuItemId", "variantId", "scheduledForDate");

-- CreateIndex
CREATE UNIQUE INDEX "menu_items_slug_menuId_key" ON "public"."menu_items"("slug", "menuId");

-- CreateIndex
CREATE INDEX "orders_universityId_idx" ON "public"."orders"("universityId");

-- CreateIndex
CREATE INDEX "orders_scheduledForDate_idx" ON "public"."orders"("scheduledForDate");

-- CreateIndex
CREATE UNIQUE INDEX "universities_code_key" ON "public"."universities"("code");

-- CreateIndex
CREATE INDEX "university_managers_managerId_idx" ON "public"."university_managers"("managerId");

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "public"."universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."menu_item_availability" ADD CONSTRAINT "menu_item_availability_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "public"."menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

