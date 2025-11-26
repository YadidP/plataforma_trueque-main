import http from './http';
import type { Wallet, CreditMovement, CreditPackage, Listing, Category, Material, Subcategory, ImpactMetricResult, ImpactMetrics, Exchange, UserReport, MonetizationReport, ImpactReport, ClaimsReport, AdvancedReport, SubscriptionPlan } from '../types';

// Helper to ensure full /uploads/ path and fallback
const getImageUrl = (path: string | undefined): string => {
  if (!path) return '/placeholder.jpg';
  // The path from the DB should already be correct, e.g., /uploads/filename.ext
  return path.startsWith('/') ? path : `/${path}`;
};

// --- AUTHENTICATION ---
export const register = async (name: string, email: string, password: string) => {
  const response = await http.post('/auth/register', { name, email, password });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await http.post('/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await http.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await http.get('/auth/me');
  return response.data;
};


// --- WALLET & CREDITS ---
export const getWallet = async (): Promise<Wallet> => {
  const response = await http.get('/wallet/saldo');
  return response.data;
};

export const getCreditMovements = async (): Promise<CreditMovement[]> => {
  const response = await http.get('/wallet/movimientos');
  return response.data;
};

export const getCreditPackages = async (): Promise<CreditPackage[]> => {
  const response = await http.get('/credits/packages');
  return response.data;
};

export const purchaseCredits = async (packageId: number, paymentRef: string): Promise<void> => {
  await http.post('/credits/purchase', { creditsPackageId: packageId, paymentRef });
};

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await http.get('/credits/plans');
  return response.data;
};

export const subscribeToPlan = async (planId: number): Promise<void> => {
  await http.post('/credits/subscribe', { planId });
};


// --- LISTINGS & CATEGORIES ---
export const getListings = async (): Promise<Listing[]> => {
  const response = await http.get('/listings');
  // CORRECCIÓN: Se usa `listing.imageUrl` (camelCase) en lugar de `listing.image_url`
  return response.data.map((listing: any) => ({
    ...listing,
    imageUrl: getImageUrl(listing.imageUrl || listing.images?.[0]?.imageUrl),
    images: listing.images?.map((img: any) => ({
      ...img,
      imageUrl: getImageUrl(img.imageUrl),
    })) || [],
  }));
};

export const getMyListings = async (): Promise<Listing[]> => {
  const response = await http.get('/listings/my-listings');
  // CORRECCIÓN: Se usa `listing.imageUrl` (camelCase) en lugar de `listing.image_url`
  return response.data.map((listing: any) => ({
    ...listing,
    imageUrl: getImageUrl(listing.imageUrl || listing.images?.[0]?.imageUrl),
    images: listing.images?.map((img: any) => ({
      ...img,
      imageUrl: getImageUrl(img.imageUrl),
    })) || [],
  }));
};

export const getListingById = async (id: number): Promise<Listing> => {
  const response = await http.get(`/listings/${id}`);
  const listing = response.data;
  // CORRECCIÓN: Se usa `listing.imageUrl` (camelCase) en lugar de `listing.image_url`
  return {
    ...listing,
    imageUrl: getImageUrl(listing.imageUrl || listing.images?.[0]?.imageUrl),
    images: listing.images?.map((img: any) => ({
      ...img,
      imageUrl: getImageUrl(img.imageUrl),
    })) || [],
  };
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await http.get('/categories');
  return response.data;
};

export const getSubcategoriesByCategoryId = async (categoryId: number): Promise<Subcategory[]> => {
  const response = await http.get(`/subcategories/by-category/${categoryId}`);
  return response.data;
};

export const getMaterials = async (): Promise<Material[]> => {
  const response = await http.get('/materials');
  return response.data;
};

export const getCategoryById = async (id: number): Promise<Category | undefined> => {
  const response = await http.get(`/categories/${id}`);
  return response.data;
}

export const createListing = async (formData: FormData): Promise<Listing> => {
  const response = await http.post('/listings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateListing = async (id: number, formData: FormData): Promise<Listing> => {
  const response = await http.patch(`/listings/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// --- EXCHANGES & IMPACT ---
export const createExchange = async (listingId: number, quantity: number): Promise<void> => {
  await http.post('/exchanges', { listingId, quantity });
};

export const getMyExchanges = async (): Promise<Exchange[]> => {
  const response = await http.get('/exchanges');
  return response.data;
};

export const getImpactMetrics = async (): Promise<ImpactMetrics> => {
  const response = await http.get('/reports/my-impact');
  return response.data;
};

export const postImpactPreview = async (data: { material_id: number; quantity: number; quantity_unit: string }): Promise<ImpactMetricResult[]> => {
  const response = await http.post('/impact/preview', data);
  return response.data;
};

// --- ADMIN MODULE 1 ---
export const getAdminKpiSummary = async (startDate: string, endDate: string) => {
  const response = await http.get('/admin/kpi-summary', { params: { startDate, endDate } });
  return response.data;
};

export const getAdminUsersList = async () => {
  const response = await http.get('/admin/list/users');
  return response.data;
};

export const getAdminFinanceList = async () => {
  const response = await http.get('/admin/list/finance');
  return response.data;
};

export const getAdminListingsList = async () => {
  const response = await http.get('/admin/list/listings');
  return response.data;
};

export const getAdminExchangesList = async () => {
  const response = await http.get('/admin/list/exchanges');
  return response.data;
};

export const getAdminUserDynamics = async (startDate: string, endDate: string, role: string = 'ALL') => {
  const response = await http.get('/admin/charts/user-dynamics', { params: { startDate, endDate, role } });
  return response.data;
};

export const getAdminEconomyData = async (startDate: string, endDate: string) => {
  const response = await http.get('/admin/charts/economy', { params: { startDate, endDate } });
  return response.data;
};

export const getAdminImpactData = async (startDate: string, endDate: string, metric: string = 'CO2') => {
  const response = await http.get('/admin/charts/impact', { params: { startDate, endDate, metric } });
  return response.data;
};

// --- CLAIMS (User) ---
export const createClaim = async (data: { exchangeId?: number; listingId?: number; reason: string }): Promise<void> => {
  await http.post('/claims', data);
};

// --- USER PROFILES & REVIEWS ---
export const getUserProfile = async (id: number): Promise<any> => {
  const response = await http.get(`/users/profile/${id}`);
  return response.data;
};

export const updateBio = async (bio: string): Promise<any> => {
  const response = await http.put('/users/profile', { bio });
  return response.data;
};

export const rateUser = async (data: { targetId: number, exchangeId: number, rating: number, comment: string }): Promise<any> => {
  const response = await http.post('/users/rate', data);
  return response.data;
};

// Agregar al final o donde están las de créditos
export const getMySubscription = async (): Promise<any> => {
  const response = await http.get('/credits/my-subscription');
  return response.data;
};