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

      {/* Hero Section */}
      <section className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Smart Waste Management for a{" "}
                <span className="text-primary">Sustainable Future</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Streamline your waste collection, recycling, and management processes
                with our comprehensive platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8">
                <img
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=60"
                  alt="Waste Management"
                  className="rounded-xl object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground">
              Everything you need to manage waste efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-white dark:bg-slate-800 shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Recycle className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">WasteWise</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 WasteWise. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Real-time Tracking",
    description:
      "Monitor waste collection and recycling activities in real-time with detailed analytics and reporting.",
  },
  {
    title: "Supplier Management",
    description:
      "Efficiently manage relationships with waste suppliers and track their performance over time.",
  },
  {
    title: "Smart Analytics",
    description:
      "Make data-driven decisions with comprehensive analytics and insights about your waste management.",
  },
];