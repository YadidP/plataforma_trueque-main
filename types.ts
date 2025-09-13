
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
  co2Factor: number;
}

export enum ListingStatus {
  ACTIVE = 'activa',
  EXCHANGED = 'intercambiada',
  PAUSED = 'pausada',
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  authorId: number;
  authorName: string;
  categoryId: number;
  unitCredits: number;
  unitLabel: string;
  status: ListingStatus;
  imageUrl: string;
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
    serviceHours: number;
}
