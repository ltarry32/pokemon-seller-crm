// =============================================================
// ZOD VALIDATION SCHEMAS
// All data written to the database is validated here first.
// These schemas run in Server Actions (server-side) so they cannot
// be bypassed by client-side manipulation.
// =============================================================

import { z } from 'zod'

// ─── Shared field definitions ─────────────────────────────────

const usdAmount = z.number().nonnegative('Must be 0 or greater').max(999999, 'Amount too large')
const optionalUsd = usdAmount.optional().nullable()
const safeString = (max = 500) => z.string().max(max, `Max ${max} characters`)
const optionalString = (max = 500) => safeString(max).optional().nullable()

// ─── Inventory Item ───────────────────────────────────────────

const VALID_CONDITIONS = [
  'Mint', 'Near Mint', 'Lightly Played', 'Moderately Played',
  'Heavily Played', 'Damaged',
] as const

const VALID_LANGUAGES = [
  'English', 'Japanese', 'Korean', 'Chinese',
  'German', 'French', 'Spanish', 'Italian', 'Portuguese',
] as const

const VALID_RARITIES = [
  'Common', 'Uncommon', 'Rare', 'Holo Rare', 'Reverse Holo',
  'Ultra Rare', 'Secret Rare', 'Rainbow Rare', 'Gold Rare',
  'Promo', 'Illustration Rare', 'Special Illustration Rare', 'Hyper Rare',
] as const

const VALID_GRADING_COS = ['PSA', 'BGS', 'CGC', 'SGC', 'ACE', 'HGA', 'Other'] as const

const VALID_STATUSES = ['in_inventory', 'listed', 'sold', 'pending', 'damaged'] as const

const inventoryItemBaseSchema = z.object({
  card_name:            safeString(200).min(1, 'Card name is required'),
  set_name:             safeString(200).min(1, 'Set name is required'),
  card_number:          optionalString(50),
  rarity:               z.enum(VALID_RARITIES).optional().nullable(),
  language:             z.enum(VALID_LANGUAGES).default('English'),
  condition:            z.enum(VALID_CONDITIONS),
  is_graded:            z.boolean().default(false),
  grade:                optionalString(20),
  grading_company:      z.enum(VALID_GRADING_COS).optional().nullable(),
  quantity:             z.number().int().min(1).max(9999).default(1),
  cost_basis:           usdAmount,
  current_market_price: usdAmount.default(0),
  list_price:           optionalUsd,
  min_price:            optionalUsd,
  storage_location:     optionalString(200),
  status:               z.enum(VALID_STATUSES).default('in_inventory'),
  source:               optionalString(200),
  purchase_date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
  notes:                optionalString(2000),
  image_url:            z.string().url('Invalid URL').optional().nullable(),
})

export const inventoryItemSchema = inventoryItemBaseSchema.superRefine((data, ctx) => {
  if (data.is_graded && !data.grading_company) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Grading company is required for graded cards',
      path: ['grading_company'],
    })
  }

  if (
    data.min_price != null &&
    data.list_price != null &&
    data.min_price > data.list_price
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Min price cannot exceed list price',
      path: ['min_price'],
    })
  }
})

export type InventoryItemInput = z.infer<typeof inventoryItemSchema>

export const inventoryItemUpdateSchema = inventoryItemBaseSchema.partial().superRefine((data, ctx) => {
  if (data.is_graded === true && !data.grading_company) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Grading company is required for graded cards',
      path: ['grading_company'],
    })
  }

  if (
    data.min_price != null &&
    data.list_price != null &&
    data.min_price > data.list_price
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Min price cannot exceed list price',
      path: ['min_price'],
    })
  }
})
export type InventoryItemUpdateInput = z.infer<typeof inventoryItemUpdateSchema>

// ─── Sold Transaction ─────────────────────────────────────────

const VALID_PLATFORMS = [
  'eBay', 'TCGPlayer', 'Facebook Marketplace', 'Card Show',
  'Local', 'Whatnot', 'Instagram', 'Mercari', 'Other',
] as const

const VALID_PAYMENT_METHODS = [
  'PayPal', 'Venmo', 'Cash', 'Credit Card',
  'Zelle', 'Bank Transfer', 'Other',
] as const

export const soldTransactionSchema = z.object({
  inventory_item_id: z.string().uuid().optional().nullable(),
  card_name:         safeString(200).min(1, 'Card name is required'),
  set_name:          optionalString(200),
  card_number:       optionalString(50),
  condition:         z.enum(VALID_CONDITIONS).optional().nullable(),
  is_graded:         z.boolean().default(false),
  grade:             optionalString(20),
  image_url:         z.string().url('Invalid URL').optional().nullable(),
  sold_price:        usdAmount.refine(v => v > 0, 'Sold price must be greater than 0'),
  platform:          z.enum(VALID_PLATFORMS).optional().nullable(),
  buyer_name:        optionalString(200),
  fees:              usdAmount.default(0),
  shipping_cost:     usdAmount.default(0),
  packaging_cost:    usdAmount.default(0),
  cost_basis:        usdAmount.default(0),
  payment_method:    z.enum(VALID_PAYMENT_METHODS).optional().nullable(),
  tracking_number:   optionalString(100),
  date_sold:         z.string().datetime({ offset: true }),
  notes:             optionalString(2000),
})

export type SoldTransactionInput = z.infer<typeof soldTransactionSchema>

// ─── Fee Profile ──────────────────────────────────────────────

export const feeProfileSchema = z.object({
  name:               safeString(100).min(1, 'Profile name is required'),
  platform:           safeString(50).optional().nullable(),
  fee_percent:        z.number().min(0).max(100).default(0),
  processing_percent: z.number().min(0).max(100).default(0),
  fixed_fee:          usdAmount.default(0),
})

export type FeeProfileInput = z.infer<typeof feeProfileSchema>

// ─── Auth schemas ─────────────────────────────────────────────

export const signUpSchema = z.object({
  email:         z.string().email('Invalid email address'),
  password:      z.string().min(8, 'Password must be at least 8 characters'),
  full_name:     safeString(100).min(1, 'Full name is required'),
  business_name: optionalString(200),
})

export const signInSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>

// ─── Server action response type ──────────────────────────────

export type ActionResult<T = void> =
  | { success: true;  data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

// Used only by signUp — carries the extra email-confirmation flag
export type SignUpResult =
  | { success: true;  data: undefined; requiresEmailConfirmation?: boolean }
  | { success: false; error: string;   fieldErrors?: Record<string, string[]> }
