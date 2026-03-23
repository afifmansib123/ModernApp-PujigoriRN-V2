// src/types/index.ts

/**
 * ENUMS - Match server exactly
 */
export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  FUNDED = 'funded',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum ProjectCategory {
  TECHNOLOGY = 'technology',
  ARTS = 'arts',
  HEALTH = 'health',
  EDUCATION = 'education',
  ENVIRONMENT = 'environment',
  COMMUNITY = 'community',
  BUSINESS = 'business',
  CHARITY = 'charity',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

export enum RewardRedemptionStatus {
  PENDING = 'pending',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
}

/**
 * USER & AUTH TYPES
 */
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * REWARD TIER TYPES
 */
export interface IRewardTier {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  minimumAmount: number;
  maxBackers?: number;
  currentBackers: number;
  estimatedDelivery: Date;
  isActive: boolean;
  items: string[];
}

/**
 * PROJECT TYPES
 */
export interface IProject {
  _id: string;
  creator: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: ProjectCategory;
  targetAmount: number;
  currentAmount: number;
  adminFeeAmount: number;
  backerCount: number;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  images: string[];
  videoUrl?: string;
  location: {
    district: string;
    division: string;
  };
  rewardTiers: IRewardTier[];
  story: string;
  risks: string;
  updates?: IProjectUpdate[];
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectUpdate {
  _id?: string;
  title: string;
  content: string;
  images?: string[];
  createdAt: Date;
}

/**
 * DONATION TYPES
 */
export interface IDonation {
  _id: string;
  donor: string;
  project: string | IProject;
  projectCreator: string;
  amount: number;
  adminFee: number;
  netAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  transactionId?: string;
  bankTransactionId?: string;
  sessionKey?: string;
  rewardTier?: string;
  rewardValue: number;
  rewardStatus: RewardRedemptionStatus;
  qrCodeData?: string;
  qrCodeUrl?: string;
  isAnonymous: boolean;
  message?: string;
  donorDisplayName?: string;
  donorInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * PAYMENT REQUEST TYPES (Creator Withdrawals)
 */
export interface IPaymentRequest {
  _id: string;
  creator: string;
  project: string;
  requestedAmount: number;
  adminFeeDeducted: number;
  netAmount: number;
  status: PaymentRequestStatus;
  bankDetails: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    branchName: string;
  };
  adminNotes?: string;
  processedBy?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SSLCOMMERZ TYPES
 */
export interface ISSLCommerzPayment {
  store_id: string;
  store_passwd: string;
  total_amount: number;
  currency: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_city: string;
  cus_country: string;
  cus_phone: string;
  shipping_method: string;
  product_name: string;
  product_category: string;
  product_profile: string;
}

export interface ISSLCommerzResponse {
  status: string;
  failedreason?: string;
  sessionkey: string;
  gw?: Array<{
    gateway: string;
    r_flag: string;
    logo: string;
    name: string;
    redirect_url: string;
  }>;
  redirectGatewayURL?: string;
  GatewayPageURL?: string;
}

export interface ISSLCommerzIPN {
  val_id: string;
  store_id: string;
  store_passwd: string;
  v1: string;
  v2: string;
  amount: number;
  currency: string;
  store_amount: number;
  verify_sign: string;
  verify_key: string;
  verify_sign_sha2: string;
  tran_date: string;
  tran_id: string;
  card_type: string;
  card_no: string;
  card_issuer: string;
  card_brand: string;
  card_issuer_country: string;
  card_issuer_country_code: string;
  status: string;
  reason: string;
  bank_tran_id: string;
  currency_type: string;
  currency_amount: number;
  currency_rate: number;
  base_fair: number;
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;
  risk_level: string;
  risk_title: string;
}

/**
 * QR CODE TYPES
 */
export interface IQRCodeData {
  donationId: string;
  projectId: string;
  amount: number;
  rewardTier?: string;
  rewardValue: number;
  donorName: string;
  createdAt: string;
  expiresAt?: string;
  donorEmail?: string;
}

/**
 * API RESPONSE TYPES
 */
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

/**
 * PAGINATION TYPES
 */
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

/**
 * ADMIN STATS TYPES
 */
export interface IAdminStats {
  totalProjects: number;
  activeProjects: number;
  totalRaised: number;
  totalAdminFees: number;
  totalDonations: number;
  totalUsers: number;
  pendingPaymentRequests: number;
  thisMonthStats: {
    newProjects: number;
    totalRaised: number;
    totalDonations: number;
    adminFees: number;
  };
}

/**
 * AUTHENTICATION TYPES
 */
export interface IAuthResponse {
  token: string;
  user: IUser;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ISignupRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

/**
 * FORM TYPES
 */
export interface ILoginForm {
  email: string;
  password: string;
}

export interface ISignupForm {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface IDonationForm {
  projectId: string;
  amount: number;
  rewardTierId?: string;
  message?: string;
  isAnonymous: boolean;
}

/**
 * FILTER TYPES
 */
export interface IProjectFilters {
  search?: string;
  category?: ProjectCategory;
  status?: ProjectStatus;
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * STORE STATE TYPES
 */
export interface IAuthStore {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  error: string | null;

  setUser: (user: IUser) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export interface IProjectsStore {
  projects: IProject[];
  selectedProject: IProject | null;
  isLoading: boolean;
  error: string | null;
  pagination: IPagination;
  filters: IProjectFilters;

  setProjects: (projects: IProject[]) => void;
  setSelectedProject: (project: IProject | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: IPagination) => void;
  setFilters: (filters: IProjectFilters) => void;
}

export interface IDonationsStore {
  donations: IDonation[];
  userDonations: IDonation[];
  isLoading: boolean;
  error: string | null;
  pagination: IPagination;

  setDonations: (donations: IDonation[]) => void;
  setUserDonations: (donations: IDonation[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: IPagination) => void;
}

/**
 * TYPE ALIASES
 */
export type Category = ProjectCategory;
export type PaymentStatusType = PaymentStatus;
export type ProjectStatusType = ProjectStatus;