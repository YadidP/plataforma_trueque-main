import http from './http';
import {
  User, Wallet, ImpactMetrics, Exchange, Listing, Category, CreditMovement, CreditPackage, Subcategory, Material, ImpactMetricResult
} from '../types';

// --- AUTH ---
export const login = async (email: string, password: string): Promise<{ accessToken: string }> => {
  const response = await http.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string): Promise<{ accessToken: string }> => {
    const response = await http.post('/auth/register', { name, email, password });
    return response.data;
};

export const getMe = async (): Promise<User> => {
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


// --- LISTINGS & CATEGORIES ---
export const getListings = async (): Promise<Listing[]> => {
  const response = await http.get('/listings');
  // Construct full image URL
  return response.data.map(listing => ({
    ...listing,
    imageUrl: `${http.defaults.baseURL}${listing.imageUrl}`
  }));
};

export const getMyListings = async (): Promise<Listing[]> => {
    const response = await http.get('/listings/my-listings');
    return response.data.map(listing => ({
        ...listing,
        imageUrl: `${http.defaults.baseURL}${listing.imageUrl}`
    }));
};

export const getListingById = async (id: number): Promise<Listing> => {
    const response = await http.get(`/listings/${id}`);
    return {
        ...response.data,
        imageUrl: `${http.defaults.baseURL}${response.data.imageUrl}`
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
  const response = await http.get('/materials'); // Assuming a /materials endpoint
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
