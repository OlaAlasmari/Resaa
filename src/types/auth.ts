export type UserRole = "bidder" | "seller" | "admin";

export type RegisterFormData = {
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  email: string;
  address: string;
  password: string;
  role?: UserRole;
  companyName?: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  national_id: string;
  phone: string;
  email: string;
  address: string | null;
  role: UserRole;
  company_name: string | null;
  created_at: string;
};