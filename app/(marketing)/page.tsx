import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Recycle } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Recycle className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">WasteWise</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Rest of the landing page content remains the same */}
      {/* ... */}
    </div>
  );
}