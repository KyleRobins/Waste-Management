export interface Profile {
  id: string;
  email: string;
  role: "admin" | "customer" | "employee" | "supplier";
  auth0_id: string | null;
  picture: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}
