export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
 
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  sentAt: string;
}

export interface SavingsAnalytics {
  totalBalance: number;
  totalAccounts: number;
  depositsCount: number;
  withdrawalsCount: number;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  sessionsActive: number;
}

export interface AdminCreditSummary {
  pending: number;
  approved: number;
  rejected: number;
  repaid: number;
}

export interface AdminCreditRequest {
  id: string;
  amount: number;
  purpose: string;
  durationMonths: number;
  interestRate: number;
  status: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  repayments?: { id: string; amount: number; paymentDate: string }[];
}

export interface AdminUserDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
  savingsAccount: { id: string; balance: number; currency: string; status: string; createdAt: string } | null;
  credit: {
    counts: AdminCreditSummary;
    requests: AdminCreditRequest[];
  };
  activity: {
    sessionsActive: number;
    recentLogins: { createdAt: string; deviceInfo: string | null; ipAddress: string | null; revokedAt: string | null; expiresAt: string }[];
    devices: { deviceInfo: string | null; lastSeenAt: string; ipAddress: string | null }[];
  };
}

