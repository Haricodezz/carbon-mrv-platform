export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  country?: string | null;
  organization_name?: string | null;
  is_verified?: boolean;
  wallet_address?: string | null;
  wallet_type?: string | null;
  wallet_verified?: boolean;
  created_at?: string;
}
