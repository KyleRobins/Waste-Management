import { useAuth } from "@/contexts/AuthContext";

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();

  if (profile?.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
