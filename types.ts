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
  name: string;
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
  potentialImpact?: ImpactMetricResult[];
  // Propiedades adicionales retornadas por el backend en algunos endpoints
  author?: { id: number; name: string; isPremium?: boolean }; // Añadir isPremium
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
  impacts?: ImpactMetricResult[]; // Impacto ambiental generado
}


export interface CreditPackage {
  id: number;
  credits: number;
  priceBs: number;
}

export interface ImpactMetricDetail {
  code: string;
  name: string;
  unit: string;
  value: number;
}

export interface ImpactMetrics {
  reusedItems: number;
  serviceHours: number;
  co2Saved: number;
  detailedMetrics: ImpactMetricDetail[];
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

export interface MonthlyTrend {
  monthLabel: string;
  revenue: number;
  newUsers: number;
  churnedUsers: number;
  activeUsers: number;
}

export interface TopUser {
  userName: string;
  score: number;
  exchangesCount: number;
  creditsGenerated: number;
}

export interface AdvancedReport {
  trends: MonthlyTrend[];
  topUsers: TopUser[];
}

// Claims management interfaces
export interface ClaimDetail {
  id: number;
  exchangeId: number | null;
  listingId: number | null;
  claimantId: number;
  claimantName: string;
  reason: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  exchangeDetails?: {
    id: number;
    listingTitle: string;
    buyerName: string;
    sellerName: string;
  };
  listingDetails?: {
    id: number;
    title: string;
    authorName: string;
  };
}

// Publications statistics interfaces
export interface PublicationsStats {
  total: number;
}

export interface PublicationsVsExchangesData {
  monthLabel: string;
  listingsCount: number;
  exchangesCount: number;
}

// Añadir
export interface SubscriptionPlan {
  id: number;
  name: string;
  price_bs: number; // Usaremos esto como costo en créditos para el ejemplo
  duration_days: number;
  description: string;
}