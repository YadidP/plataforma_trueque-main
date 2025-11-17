export enum UserRole {
  USER = 'usuario',
  ENTREPRENEUR = 'emprendedor',
  NGO = 'ong',
  ADMIN = 'admin',
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface Wallet {
  userId: number;
  balance: number;
}

export interface CreditMovement {
  id: number;
  date: string;
  description: string;
  delta: number;
  balanceAfter: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

export interface Material {
  id: number;
  name: string;
}

export interface ImpactMetricResult {
  code: string;
  value: number;
  unit: string;
}

export enum ListingStatus {
  ACTIVE = 'activa',
  EXCHANGED = 'intercambiada',
  PAUSED = 'pausada',
}

export interface QuantityRange {
  label: string;
  min: number;
  max: number | null; // null means "más de"
}

export interface ListingImage {
  id: number;
  listingId: number;
  imageUrl: string;
  displayOrder: number;
  createdAt: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  authorId: number;
  authorName: string;
  categoryId: number;
  subcategoryId?: number;
  materialId?: number;
  quantity?: number;
  quantityRange?: string; // e.g., "1-5"
  unitCredits: number;
  unitLabel: string;
  status: ListingStatus;
  imageUrl: string;
  images?: ListingImage[];
  createdAt: string;
}

export interface Exchange {
  id: number;
  listingId: number;
  listingTitle: string;
  buyerId: number;
  buyerName: string;
  sellerId: number;
  sellerName: string;
  quantity: number;
  totalCredits: number;
  date: string;
}

export interface CreditPackage {
  id: number;
  credits: number;
  priceBs: number;
}

export interface ImpactMetrics {
    reusedItems: number;
    co2Saved: number;
    co2Unit: string;
    waterSaved: number;
    waterUnit: string;
    energySaved: number;
    energyUnit: string;
    wastePrevented: number;
    wasteUnit: string;
    serviceHours: number;
}

export interface ImpactEquivalence {
  metric: string;
  equivalence: string;
  value: number;
}

// types.ts (AÑADIR AL FINAL)

export interface UserReport {
  totalUsers: number;
  activeUsers: { role: string; count: number }[];
  top10UsersByExchanges: { user_id: number; name: string; email: string; total_exchanges: number }[];
  churnUsersCount: number;
}

export interface MonetizationReport {
  totalRevenue: number;
  revenueLast30Days: number;
  creditSource: { source: string; amount: number }[];
  activePremiumUsers: number;
}

export interface ImpactReport {
  totalItemsExchanged: number;
  exchangesByCategory: { categoryName: string; totalExchanges: number }[];
  listingToExchangeRatioByCategory: { categoryName: string; ratio: number }[];
}