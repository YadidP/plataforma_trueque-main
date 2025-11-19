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

// New report interfaces
export interface UserReport {
  totalUsers: number;
  newUsersInPeriod: number;
  activeUsersInPeriod: number;
  inactiveUsers: number;
}

export interface MonetizationReport {
  revenueInPeriod: number;
  exchangesInPeriod: number;
  creditsPurchasedInPeriod: number;
  creditsExchangedInPeriod: number;
}

export interface ImpactReport {
  impactByCategory: {
    categoryName: string;
    itemsExchanged: number;
  }[];
}

export interface ClaimsReport {
    claimsByStatus: {
        status: string;
        count: number;
    }[];
}