import { z } from 'zod';

export const menuItemVariantSchema = z.object({
	name: z.string().min(1),
	price: z.number().nonnegative(),
	isDefault: z.boolean()
});

export const createMenuItemSchema = z.object({
	menuId: z.string().min(1),
	name: z.string().min(1),
	description: z.string().optional().nullable(),
	category: z.string().optional().nullable(),
	foodType: z.enum(['VEG', 'NON_VEG', 'HALAL']).optional(),
	image: z.string().url().optional().nullable(),
	variants: z.array(menuItemVariantSchema).min(1).refine(arr => arr.some(v => v.isDefault), {
		message: 'At least one variant must be default'
	})
});

export const registerSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	phone: z.string().optional().nullable(),
	university: z.string().min(1),
	password: z.string().min(8)
});

export const updateOrderStatusSchema = z.object({
	orderId: z.string().min(1),
	status: z.enum(['PENDING', 'APPROVED', 'PREPARING', 'READY_TO_COLLECT', 'DELIVERED', 'CANCELLED'])
});


