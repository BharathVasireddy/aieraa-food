import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateMenuItemSlug, generateSlug, generateUniqueSlug } from '@/lib/slug-utils';
import { apiError, apiSuccess } from '@/lib/api-response';
import { createMenuItemSchema, menuItemVariantSchema } from '@/lib/validation';
import type { z } from 'zod';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'MANAGER') {
      return apiError('Unauthorized', { status: 403 });
    }

    const body = await request.json();
    const parsed = createMenuItemSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Invalid request', { status: 400, details: parsed.error.flatten().fieldErrors });
    }
    const { menuId, name, description, category, foodType, image, variants } = parsed.data;

    // Check if manager has access to this menu
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { university: true }
    });

    if (!menu) {
      return apiError('Menu not found', { status: 404 });
    }

    const hasAccess = await prisma.universityManager.findFirst({
      where: {
        managerId: session.user.id,
        universityId: menu.universityId
      }
    });

    if (!hasAccess) {
      return apiError('No access to this menu', { status: 403 });
    }

    // Generate unique slug for the menu item
    const baseSlug = generateMenuItemSlug(name);
    let uniqueSlug = baseSlug;
    const existingItems = await prisma.menuItem.findMany({
      where: { menuId },
      select: { name: true, slug: true }
    });
    const existingSlugs = existingItems.map(item => item.slug ?? generateSlug(item.name));
    uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

    // Create menu item with variants and slug
    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        category,
        foodType: foodType || 'VEG',
        image,
        menuId,
        slug: uniqueSlug,
        variants: {
          create: variants.map((variant: z.infer<typeof menuItemVariantSchema>) => ({
            name: variant.name,
            price: variant.price,
            isDefault: variant.isDefault
          }))
        }
      },
      include: {
        variants: true
      }
    });

    return apiSuccess({ menuItem });

  } catch (error) {
    console.error('Menu item creation error:', error);
    return apiError('Failed to create menu item', { status: 500 });
  }
}