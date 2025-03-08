import { headers } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const supabase = createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="h-screen relative flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}