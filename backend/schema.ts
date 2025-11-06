import { z } from 'zod';

/*
==================================================
===================== USERS ======================
==================================================
*/
// Entity schema
export const userSchema = z.object({
  user_uid: z.string(),
  email: z.string().email(),
  password_hash: z.string().nullable(),
  user_type: z.enum(['guest', 'host', 'admin']),
  is_email_verified: z.boolean(),
  created_at: z.number(),
  updated_at: z.number(),
  is_deleted: z.boolean(),
});

// Input schema for creation
export const createUserInputSchema = z.object({
  email: z.string().email().max(255),
  password_hash: z.string().max(255).nullable(),
  user_type: z.enum(['guest', 'host', 'admin']),
  is_email_verified: z.boolean().default(false),
});

// Input schema for updates
export const updateUserInputSchema = z.object({
  user_uid: z.string(),
  email: z.string().email().max(255).optional(),
  password_hash: z.string().max(255).nullable().optional(),
  user_type: z.enum(['guest', 'host', 'admin']).optional(),
  is_email_verified: z.boolean().optional(),
  is_deleted: z.boolean().optional(),
});

// Query/search schema
export const searchUserInputSchema = z.object({
  query: z.string().optional(),
  user_type: z.enum(['guest', 'host', 'admin']).optional(),
  is_deleted: z.boolean().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'email']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type SearchUserInput = z.infer<typeof searchUserInputSchema>;

/*
==================================================
=============== USER PROFILES ====================
==================================================
*/
export const userProfileSchema = z.object({
  user_profile_uid: z.string(),
  user_uid: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  phone_number: z.string().nullable(),
  address_line1: z.string().nullable(),
  address_line2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  bio: z.string().nullable(),
  payout_info_json: z.string().nullable(),
  created_at: z.number(),
  updated_at: z.number(),
});

export const createUserProfileInputSchema = z.object({
  user_uid: z.string(),
  first_name: z.string().max(64).nullable(),
  last_name: z.string().max(64).nullable(),
  avatar_url: z.string().url().max(512).nullable(),
  phone_number: z.string().max(32).nullable(),
  address_line1: z.string().max(128).nullable(),
  address_line2: z.string().max(128).nullable(),
  city: z.string().max(64).nullable(),
  state: z.string().max(64).nullable(),
  country: z.string().max(64).nullable(),
  bio: z.string().nullable(),
  payout_info_json: z.string().nullable(),
});

export const updateUserProfileInputSchema = z.object({
  user_profile_uid: z.string(),
  first_name: z.string().max(64).nullable().optional(),
  last_name: z.string().max(64).nullable().optional(),
  avatar_url: z.string().url().max(512).nullable().optional(),
  phone_number: z.string().max(32).nullable().optional(),
  address_line1: z.string().max(128).nullable().optional(),
  address_line2: z.string().max(128).nullable().optional(),
  city: z.string().max(64).nullable().optional(),
  state: z.string().max(64).nullable().optional(),
  country: z.string().max(64).nullable().optional(),
  bio: z.string().nullable().optional(),
  payout_info_json: z.string().nullable().optional(),
});

export const searchUserProfileInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'first_name', 'last_name']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type CreateUserProfileInput = z.infer<typeof createUserProfileInputSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileInputSchema>;
export type SearchUserProfileInput = z.infer<typeof searchUserProfileInputSchema>;

/*
==================================================
=============== AUTH PROVIDERS ===================
==================================================
*/
export const authProviderSchema = z.object({
  auth_provider_uid: z.string(),
  user_uid: z.string(),
  provider: z.enum(['email', 'google', 'facebook']),
  provider_id: z.string(),
  created_at: z.number(),
});

export const createAuthProviderInputSchema = z.object({
  user_uid: z.string(),
  provider: z.enum(['email', 'google', 'facebook']),
  provider_id: z.string().max(128),
});

export const updateAuthProviderInputSchema = z.object({
  auth_provider_uid: z.string(),
  provider: z.enum(['email', 'google', 'facebook']).optional(),
  provider_id: z.string().max(128).optional(),
});

export const searchAuthProviderInputSchema = z.object({
  user_uid: z.string().optional(),
  provider: z.enum(['email', 'google', 'facebook']).optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'provider']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type AuthProvider = z.infer<typeof authProviderSchema>;
export type CreateAuthProviderInput = z.infer<typeof createAuthProviderInputSchema>;
export type UpdateAuthProviderInput = z.infer<typeof updateAuthProviderInputSchema>;
export type SearchAuthProviderInput = z.infer<typeof searchAuthProviderInputSchema>;

/*
==================================================
=================== VILLAS =======================
==================================================
*/
export const villaSchema = z.object({
  villa_uid: z.string(),
  host_uid: z.string(),
  status: z.string().max(32),
  name: z.string().max(255),
  description: z.string(),
  street_address: z.string().max(255),
  city: z.string().max(64),
  state: z.string().max(64),
  country: z.string().max(64),
  latitude: z.number(),
  longitude: z.number(),
  beach_access_type: z.string().max(64),
  min_stay_nights: z.number().int(),
  max_stay_nights: z.number().int(),
  guest_count: z.number().int(),
  bedrooms: z.number().int(),
  bathrooms: z.number().int(),
  nightly_rate: z.number(),
  cleaning_fee: z.number(),
  instant_book: z.boolean(),
  house_rules: z.string().nullable(),
  amenities: z.string().nullable(),
  policies_json: z.string().nullable(),
  approval_comment: z.string().nullable(),
  created_at: z.number(),
  updated_at: z.number(),
  is_deleted: z.boolean(),
});

export const createVillaInputSchema = z.object({
  host_uid: z.string(),
  status: z.string().max(32),
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  street_address: z.string().min(1).max(255),
  city: z.string().min(1).max(64),
  state: z.string().min(1).max(64),
  country: z.string().min(1).max(64),
  latitude: z.number(),
  longitude: z.number(),
  beach_access_type: z.string().max(64),
  min_stay_nights: z.number().int().min(1),
  max_stay_nights: z.number().int().min(1),
  guest_count: z.number().int().min(1),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  nightly_rate: z.number().min(0),
  cleaning_fee: z.number().min(0),
  instant_book: z.boolean().default(false),
  house_rules: z.string().nullable(),
  amenities: z.string().nullable(),
  policies_json: z.string().nullable(),
  approval_comment: z.string().nullable(),
  is_deleted: z.boolean().default(false),
});

export const updateVillaInputSchema = z.object({
  villa_uid: z.string(),
  status: z.string().max(32).optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  street_address: z.string().min(1).max(255).optional(),
  city: z.string().min(1).max(64).optional(),
  state: z.string().min(1).max(64).optional(),
  country: z.string().min(1).max(64).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  beach_access_type: z.string().max(64).optional(),
  min_stay_nights: z.number().int().min(1).optional(),
  max_stay_nights: z.number().int().min(1).optional(),
  guest_count: z.number().int().min(1).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  nightly_rate: z.number().min(0).optional(),
  cleaning_fee: z.number().min(0).optional(),
  instant_book: z.boolean().optional(),
  house_rules: z.string().nullable().optional(),
  amenities: z.string().nullable().optional(),
  policies_json: z.string().nullable().optional(),
  approval_comment: z.string().nullable().optional(),
  is_deleted: z.boolean().optional(),
});

export const searchVillaInputSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  guest_count: z.number().int().optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  min_stay_nights: z.number().int().optional(),
  max_stay_nights: z.number().int().optional(),
  status: z.string().optional(),
  instant_book: z.boolean().optional(),
  host_uid: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'name', 'nightly_rate']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Villa = z.infer<typeof villaSchema>;
export type CreateVillaInput = z.infer<typeof createVillaInputSchema>;
export type UpdateVillaInput = z.infer<typeof updateVillaInputSchema>;
export type SearchVillaInput = z.infer<typeof searchVillaInputSchema>;

/*
==================================================
============= VILLA AMENITIES ====================
==================================================
*/
export const villaAmenitySchema = z.object({
  amenity_uid: z.string(),
  name: z.string().max(64),
  icon_url: z.string().nullable(),
  sort_order: z.number().int().nullable(),
});

export const createVillaAmenityInputSchema = z.object({
  name: z.string().min(1).max(64),
  icon_url: z.string().url().max(512).nullable(),
  sort_order: z.number().int().nullable(),
});

export const updateVillaAmenityInputSchema = z.object({
  amenity_uid: z.string(),
  name: z.string().min(1).max(64).optional(),
  icon_url: z.string().url().max(512).nullable().optional(),
  sort_order: z.number().int().nullable().optional(),
});

export const searchVillaAmenityInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['name', 'sort_order']).default('sort_order'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export type VillaAmenity = z.infer<typeof villaAmenitySchema>;
export type CreateVillaAmenityInput = z.infer<typeof createVillaAmenityInputSchema>;
export type UpdateVillaAmenityInput = z.infer<typeof updateVillaAmenityInputSchema>;
export type SearchVillaAmenityInput = z.infer<typeof searchVillaAmenityInputSchema>;

/*
==================================================
============ VILLA AMENITY MAP ===================
==================================================
*/
export const villaAmenityMapSchema = z.object({
  villa_amenity_map_uid: z.string(),
  villa_uid: z.string(),
  amenity_uid: z.string(),
});

export const createVillaAmenityMapInputSchema = z.object({
  villa_uid: z.string(),
  amenity_uid: z.string(),
});

export const updateVillaAmenityMapInputSchema = z.object({
  villa_amenity_map_uid: z.string(),
  villa_uid: z.string().optional(),
  amenity_uid: z.string().optional(),
});

export const searchVillaAmenityMapInputSchema = z.object({
  villa_uid: z.string().optional(),
  amenity_uid: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['villa_uid', 'amenity_uid']).default('villa_uid'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export type VillaAmenityMap = z.infer<typeof villaAmenityMapSchema>;
export type CreateVillaAmenityMapInput = z.infer<typeof createVillaAmenityMapInputSchema>;
export type UpdateVillaAmenityMapInput = z.infer<typeof updateVillaAmenityMapInputSchema>;
export type SearchVillaAmenityMapInput = z.infer<typeof searchVillaAmenityMapInputSchema>;

/*
==================================================
============== VILLA PHOTOS ======================
==================================================
*/
export const villaPhotoSchema = z.object({
  villa_photo_uid: z.string(),
  villa_uid: z.string(),
  url: z.string(),
  is_cover: z.boolean(),
  sort_order: z.number().int(),
  uploaded_at: z.number(),
});

export const createVillaPhotoInputSchema = z.object({
  villa_uid: z.string(),
  url: z.string().url().max(512),
  is_cover: z.boolean().default(false),
  sort_order: z.number().int(),
});

export const updateVillaPhotoInputSchema = z.object({
  villa_photo_uid: z.string(),
  url: z.string().url().max(512).optional(),
  is_cover: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const searchVillaPhotoInputSchema = z.object({
  villa_uid: z.string().optional(),
  is_cover: z.boolean().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['uploaded_at', 'sort_order']).default('sort_order'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export type VillaPhoto = z.infer<typeof villaPhotoSchema>;
export type CreateVillaPhotoInput = z.infer<typeof createVillaPhotoInputSchema>;
export type UpdateVillaPhotoInput = z.infer<typeof updateVillaPhotoInputSchema>;
export type SearchVillaPhotoInput = z.infer<typeof searchVillaPhotoInputSchema>;

/*
==================================================
========== VILLA PRICING RULES ===================
==================================================
*/
export const villaPricingRuleSchema = z.object({
  villa_pricing_rule_uid: z.string(),
  villa_uid: z.string(),
  start_date: z.number(),
  end_date: z.number(),
  nightly_rate: z.number(),
  notes: z.string().nullable(),
});

export const createVillaPricingRuleInputSchema = z.object({
  villa_uid: z.string(),
  start_date: z.number(),
  end_date: z.number(),
  nightly_rate: z.number().min(0),
  notes: z.string().nullable(),
});

export const updateVillaPricingRuleInputSchema = z.object({
  villa_pricing_rule_uid: z.string(),
  start_date: z.number().optional(),
  end_date: z.number().optional(),
  nightly_rate: z.number().min(0).optional(),
  notes: z.string().nullable().optional(),
});

export const searchVillaPricingRuleInputSchema = z.object({
  villa_uid: z.string().optional(),
  start_date: z.number().optional(),
  end_date: z.number().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['start_date', 'end_date']).default('start_date'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export type VillaPricingRule = z.infer<typeof villaPricingRuleSchema>;
export type CreateVillaPricingRuleInput = z.infer<typeof createVillaPricingRuleInputSchema>;
export type UpdateVillaPricingRuleInput = z.infer<typeof updateVillaPricingRuleInputSchema>;
export type SearchVillaPricingRuleInput = z.infer<typeof searchVillaPricingRuleInputSchema>;

/*
==================================================
============= VILLA CALENDARS ====================
==================================================
*/
export const villaCalendarSchema = z.object({
  villa_calendar_uid: z.string(),
  villa_uid: z.string(),
  date: z.number(),
  is_available: z.boolean(),
  source: z.string().max(32),
  created_at: z.number(),
  updated_at: z.number(),
});

export const createVillaCalendarInputSchema = z.object({
  villa_uid: z.string(),
  date: z.number(),
  is_available: z.boolean().default(true),
  source: z.string().max(32),
});

export const updateVillaCalendarInputSchema = z.object({
  villa_calendar_uid: z.string(),
  date: z.number().optional(),
  is_available: z.boolean().optional(),
  source: z.string().max(32).optional(),
});

export const searchVillaCalendarInputSchema = z.object({
  villa_uid: z.string().optional(),
  date: z.number().optional(),
  is_available: z.boolean().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['date', 'created_at']).default('date'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export type VillaCalendar = z.infer<typeof villaCalendarSchema>;
export type CreateVillaCalendarInput = z.infer<typeof createVillaCalendarInputSchema>;
export type UpdateVillaCalendarInput = z.infer<typeof updateVillaCalendarInputSchema>;
export type SearchVillaCalendarInput = z.infer<typeof searchVillaCalendarInputSchema>;

/*
==================================================
============= VILLA ICAL SYNCS ===================
==================================================
*/
export const villaIcalSyncSchema = z.object({
  villa_ical_sync_uid: z.string(),
  villa_uid: z.string(),
  ical_url: z.string(),
  last_sync_at: z.number().nullable(),
});

export const createVillaIcalSyncInputSchema = z.object({
  villa_uid: z.string(),
  ical_url: z.string().url().max(512),
});

export const updateVillaIcalSyncInputSchema = z.object({
  villa_ical_sync_uid: z.string(),
  ical_url: z.string().url().max(512).optional(),
  last_sync_at: z.number().optional().nullable(),
});

export const searchVillaIcalSyncInputSchema = z.object({
  villa_uid: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['last_sync_at']).default('last_sync_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type VillaIcalSync = z.infer<typeof villaIcalSyncSchema>;
export type CreateVillaIcalSyncInput = z.infer<typeof createVillaIcalSyncInputSchema>;
export type UpdateVillaIcalSyncInput = z.infer<typeof updateVillaIcalSyncInputSchema>;
export type SearchVillaIcalSyncInput = z.infer<typeof searchVillaIcalSyncInputSchema>;

/*
==================================================
================== BOOKINGS ======================
==================================================
*/
export const bookingSchema = z.object({
  booking_uid: z.string(),
  villa_uid: z.string(),
  guest_uid: z.string(),
  host_uid: z.string(),
  check_in: z.number(),
  check_out: z.number(),
  guest_count: z.number().int(),
  status: z.string().max(32),
  instant_book: z.boolean(),
  price_nightly: z.number(),
  cleaning_fee: z.number(),
  service_fee: z.number(),
  tax_fee: z.number(),
  payout_amount: z.number(),
  currency: z.string().max(16),
  created_at: z.number(),
  updated_at: z.number(),
  cancelled_at: z.number().nullable(),
  cancellation_reason: z.string().nullable(),
  review_prompted: z.boolean(),
});

export const createBookingInputSchema = z.object({
  villa_uid: z.string(),
  guest_uid: z.string(),
  host_uid: z.string(),
  check_in: z.number(),
  check_out: z.number(),
  guest_count: z.number().int().min(1),
  status: z.string().max(32),
  instant_book: z.boolean(),
  price_nightly: z.number().min(0),
  cleaning_fee: z.number().min(0),
  service_fee: z.number().min(0),
  tax_fee: z.number().min(0),
  payout_amount: z.number().min(0),
  currency: z.string().max(16),
  cancelled_at: z.number().nullable().optional(),
  cancellation_reason: z.string().nullable().optional(),
  review_prompted: z.boolean().default(false),
});

export const updateBookingInputSchema = z.object({
  booking_uid: z.string(),
  villa_uid: z.string().optional(),
  guest_uid: z.string().optional(),
  host_uid: z.string().optional(),
  check_in: z.number().optional(),
  check_out: z.number().optional(),
  guest_count: z.number().int().min(1).optional(),
  status: z.string().max(32).optional(),
  instant_book: z.boolean().optional(),
  price_nightly: z.number().min(0).optional(),
  cleaning_fee: z.number().min(0).optional(),
  service_fee: z.number().min(0).optional(),
  tax_fee: z.number().min(0).optional(),
  payout_amount: z.number().min(0).optional(),
  currency: z.string().max(16).optional(),
  cancelled_at: z.number().nullable().optional(),
  cancellation_reason: z.string().nullable().optional(),
  review_prompted: z.boolean().optional(),
});

export const searchBookingInputSchema = z.object({
  guest_uid: z.string().optional(),
  host_uid: z.string().optional(),
  villa_uid: z.string().optional(),
  status: z.string().optional(),
  instant_book: z.boolean().optional(),
  date_from: z.number().optional(),
  date_to: z.number().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'check_in', 'check_out']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Booking = z.infer<typeof bookingSchema>;
export type CreateBookingInput = z.infer<typeof createBookingInputSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingInputSchema>;
export type SearchBookingInput = z.infer<typeof searchBookingInputSchema>;

/*
==================================================
============= BOOKING PAYMENTS ===================
==================================================
*/
export const bookingPaymentSchema = z.object({
  booking_payment_uid: z.string(),
  booking_uid: z.string(),
  payment_method: z.string().max(32),
  payment_status: z.string().max(32),
  total_amount: z.number(),
  transaction_id: z.string().nullable(),
  paid_at: z.number().nullable(),
  refunded_at: z.number().nullable(),
});

export const createBookingPaymentInputSchema = z.object({
  booking_uid: z.string(),
  payment_method: z.string().max(32),
  payment_status: z.string().max(32),
  total_amount: z.number().min(0),
  transaction_id: z.string().max(128).nullable(),
  paid_at: z.number().nullable(),
  refunded_at: z.number().nullable(),
});

export const updateBookingPaymentInputSchema = z.object({
  booking_payment_uid: z.string(),
  payment_method: z.string().max(32).optional(),
  payment_status: z.string().max(32).optional(),
  total_amount: z.number().min(0).optional(),
  transaction_id: z.string().max(128).nullable().optional(),
  paid_at: z.number().nullable().optional(),
  refunded_at: z.number().nullable().optional(),
});

export const searchBookingPaymentInputSchema = z.object({
  booking_uid: z.string().optional(),
  payment_status: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['paid_at', 'refunded_at']).default('paid_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type BookingPayment = z.infer<typeof bookingPaymentSchema>;
export type CreateBookingPaymentInput = z.infer<typeof createBookingPaymentInputSchema>;
export type UpdateBookingPaymentInput = z.infer<typeof updateBookingPaymentInputSchema>;
export type SearchBookingPaymentInput = z.infer<typeof searchBookingPaymentInputSchema>;

/*
==================================================
=============== BOOKING GUESTS ===================
==================================================
*/
export const bookingGuestSchema = z.object({
  booking_guest_uid: z.string(),
  booking_uid: z.string(),
  user_uid: z.string(),
  is_primary: z.boolean(),
});

export const createBookingGuestInputSchema = z.object({
  booking_uid: z.string(),
  user_uid: z.string(),
  is_primary: z.boolean().default(false),
});

export const updateBookingGuestInputSchema = z.object({
  booking_guest_uid: z.string(),
  is_primary: z.boolean().optional(),
});

export const searchBookingGuestInputSchema = z.object({
  booking_uid: z.string().optional(),
  user_uid: z.string().optional(),
  is_primary: z.boolean().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['booking_uid', 'user_uid']).default('booking_uid'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export type BookingGuest = z.infer<typeof bookingGuestSchema>;
export type CreateBookingGuestInput = z.infer<typeof createBookingGuestInputSchema>;
export type UpdateBookingGuestInput = z.infer<typeof updateBookingGuestInputSchema>;
export type SearchBookingGuestInput = z.infer<typeof searchBookingGuestInputSchema>;

/*
==================================================
=============== VILLA REVIEWS ====================
==================================================
*/
export const villaReviewSchema = z.object({
  villa_review_uid: z.string(),
  villa_uid: z.string(),
  booking_uid: z.string(),
  guest_uid: z.string(),
  host_uid: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string().nullable(),
  photo_url: z.string().nullable(),
  created_at: z.number(),
  is_deleted: z.boolean(),
});

export const createVillaReviewInputSchema = z.object({
  villa_uid: z.string(),
  booking_uid: z.string(),
  guest_uid: z.string(),
  host_uid: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string().nullable(),
  photo_url: z.string().url().max(512).nullable(),
  is_deleted: z.boolean().default(false),
});

export const updateVillaReviewInputSchema = z.object({
  villa_review_uid: z.string(),
  rating: z.number().int().min(1).max(5).optional(),
  text: z.string().nullable().optional(),
  photo_url: z.string().url().max(512).nullable().optional(),
  is_deleted: z.boolean().optional(),
});

export const searchVillaReviewInputSchema = z.object({
  villa_uid: z.string().optional(),
  booking_uid: z.string().optional(),
  guest_uid: z.string().optional(),
  host_uid: z.string().optional(),
  rating: z.number().int().optional(),
  is_deleted: z.boolean().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'rating']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type VillaReview = z.infer<typeof villaReviewSchema>;
export type CreateVillaReviewInput = z.infer<typeof createVillaReviewInputSchema>;
export type UpdateVillaReviewInput = z.infer<typeof updateVillaReviewInputSchema>;
export type SearchVillaReviewInput = z.infer<typeof searchVillaReviewInputSchema>;

/*
==================================================
=============== HOST REVIEWS =====================
==================================================
*/
export const hostReviewSchema = z.object({
  host_review_uid: z.string(),
  booking_uid: z.string(),
  host_uid: z.string(),
  guest_uid: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string().nullable(),
  created_at: z.number(),
  is_deleted: z.boolean(),
});

export const createHostReviewInputSchema = z.object({
  booking_uid: z.string(),
  host_uid: z.string(),
  guest_uid: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string().nullable(),
  is_deleted: z.boolean().default(false),
});

export const updateHostReviewInputSchema = z.object({
  host_review_uid: z.string(),
  rating: z.number().int().min(1).max(5).optional(),
  text: z.string().nullable().optional(),
  is_deleted: z.boolean().optional(),
});

export const searchHostReviewInputSchema = z.object({
  booking_uid: z.string().optional(),
  host_uid: z.string().optional(),
  guest_uid: z.string().optional(),
  rating: z.number().int().optional(),
  is_deleted: z.boolean().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'rating']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type HostReview = z.infer<typeof hostReviewSchema>;
export type CreateHostReviewInput = z.infer<typeof createHostReviewInputSchema>;
export type UpdateHostReviewInput = z.infer<typeof updateHostReviewInputSchema>;
export type SearchHostReviewInput = z.infer<typeof searchHostReviewInputSchema>;

/*
==================================================
================= MESSAGES =======================
==================================================
*/
export const messageSchema = z.object({
  message_uid: z.string(),
  booking_uid: z.string().nullable(),
  villa_uid: z.string().nullable(),
  sender_uid: z.string(),
  receiver_uid: z.string(),
  body: z.string(),
  sent_at: z.number(),
  is_read: z.boolean(),
  thread_uid: z.string().nullable(),
});

export const createMessageInputSchema = z.object({
  booking_uid: z.string().nullable().optional(),
  villa_uid: z.string().nullable().optional(),
  sender_uid: z.string(),
  receiver_uid: z.string(),
  body: z.string().min(1),
  sent_at: z.number(),
  is_read: z.boolean().default(false),
  thread_uid: z.string().nullable().optional(),
});

export const updateMessageInputSchema = z.object({
  message_uid: z.string(),
  is_read: z.boolean().optional(),
  body: z.string().optional(),
});

export const searchMessageInputSchema = z.object({
  sender_uid: z.string().optional(),
  receiver_uid: z.string().optional(),
  booking_uid: z.string().optional(),
  villa_uid: z.string().optional(),
  thread_uid: z.string().optional(),
  is_read: z.boolean().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['sent_at']).default('sent_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Message = z.infer<typeof messageSchema>;
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
export type SearchMessageInput = z.infer<typeof searchMessageInputSchema>;

/*
==================================================
================== PAYOUTS =======================
==================================================
*/
export const payoutSchema = z.object({
  payout_uid: z.string(),
  host_uid: z.string(),
  booking_uid: z.string(),
  amount: z.number(),
  payout_status: z.string().max(32),
  transfer_method: z.string().max(32),
  transfer_reference: z.string().nullable(),
  transfer_date: z.number().nullable(),
});

export const createPayoutInputSchema = z.object({
  host_uid: z.string(),
  booking_uid: z.string(),
  amount: z.number().min(0),
  payout_status: z.string().max(32),
  transfer_method: z.string().max(32),
  transfer_reference: z.string().max(128).nullable(),
  transfer_date: z.number().nullable(),
});

export const updatePayoutInputSchema = z.object({
  payout_uid: z.string(),
  payout_status: z.string().max(32).optional(),
  transfer_method: z.string().max(32).optional(),
  transfer_reference: z.string().max(128).nullable().optional(),
  transfer_date: z.number().nullable().optional(),
});

export const searchPayoutInputSchema = z.object({
  host_uid: z.string().optional(),
  booking_uid: z.string().optional(),
  payout_status: z.string().optional(),
  transfer_method: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['transfer_date', 'amount']).default('transfer_date'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Payout = z.infer<typeof payoutSchema>;
export type CreatePayoutInput = z.infer<typeof createPayoutInputSchema>;
export type UpdatePayoutInput = z.infer<typeof updatePayoutInputSchema>;
export type SearchPayoutInput = z.infer<typeof searchPayoutInputSchema>;

/*
==================================================
=========== ADMIN LISTING REVIEWS ================
==================================================
*/
export const adminListingReviewSchema = z.object({
  admin_listing_review_uid: z.string(),
  villa_uid: z.string(),
  admin_uid: z.string(),
  action: z.enum(['approved', 'rejected']),
  comment: z.string().nullable(),
  reviewed_at: z.number(),
});

export const createAdminListingReviewInputSchema = z.object({
  villa_uid: z.string(),
  admin_uid: z.string(),
  action: z.enum(['approved', 'rejected']),
  comment: z.string().nullable(),
  reviewed_at: z.number(),
});

export const updateAdminListingReviewInputSchema = z.object({
  admin_listing_review_uid: z.string(),
  action: z.enum(['approved', 'rejected']).optional(),
  comment: z.string().nullable().optional(),
});

export const searchAdminListingReviewInputSchema = z.object({
  villa_uid: z.string().optional(),
  admin_uid: z.string().optional(),
  action: z.enum(['approved', 'rejected']).optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['reviewed_at']).default('reviewed_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type AdminListingReview = z.infer<typeof adminListingReviewSchema>;
export type CreateAdminListingReviewInput = z.infer<typeof createAdminListingReviewInputSchema>;
export type UpdateAdminListingReviewInput = z.infer<typeof updateAdminListingReviewInputSchema>;
export type SearchAdminListingReviewInput = z.infer<typeof searchAdminListingReviewInputSchema>;

/*
==================================================
================== REPORTS =======================
==================================================
*/
export const reportSchema = z.object({
  report_uid: z.string(),
  reporter_uid: z.string(),
  reported_type: z.enum(['user', 'villa', 'review']),
  reported_uid: z.string(),
  reason: z.string(),
  created_at: z.number(),
  resolved_at: z.number().nullable(),
  resolved_comment: z.string().nullable(),
});

export const createReportInputSchema = z.object({
  reporter_uid: z.string(),
  reported_type: z.enum(['user', 'villa', 'review']),
  reported_uid: z.string(),
  reason: z.string().min(1),
  resolved_at: z.number().nullable().optional(),
  resolved_comment: z.string().nullable().optional(),
});

export const updateReportInputSchema = z.object({
  report_uid: z.string(),
  resolved_at: z.number().nullable().optional(),
  resolved_comment: z.string().nullable().optional(),
});

export const searchReportInputSchema = z.object({
  reporter_uid: z.string().optional(),
  reported_type: z.enum(['user', 'villa', 'review']).optional(),
  reported_uid: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'resolved_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Report = z.infer<typeof reportSchema>;
export type CreateReportInput = z.infer<typeof createReportInputSchema>;
export type UpdateReportInput = z.infer<typeof updateReportInputSchema>;
export type SearchReportInput = z.infer<typeof searchReportInputSchema>;

/*
==================================================
=============== APP CONFIGS ======================
==================================================
*/
export const appConfigSchema = z.object({
  app_config_uid: z.string(),
  config_type: z.string().max(32),
  key: z.string().max(128),
  value_json: z.string(),
});

export const createAppConfigInputSchema = z.object({
  config_type: z.string().max(32),
  key: z.string().max(128),
  value_json: z.string(),
});

export const updateAppConfigInputSchema = z.object({
  app_config_uid: z.string(),
  config_type: z.string().max(32).optional(),
  key: z.string().max(128).optional(),
  value_json: z.string().optional(),
});

export const searchAppConfigInputSchema = z.object({
  config_type: z.string().optional(),
  key: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['config_type', 'key']).default('config_type'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export type AppConfig = z.infer<typeof appConfigSchema>;
export type CreateAppConfigInput = z.infer<typeof createAppConfigInputSchema>;
export type UpdateAppConfigInput = z.infer<typeof updateAppConfigInputSchema>;
export type SearchAppConfigInput = z.infer<typeof searchAppConfigInputSchema>;