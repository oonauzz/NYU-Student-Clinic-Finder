import { Link } from "wouter";
import { ArrowRight, Clock, MapPin, ShieldCheck, Activity, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetClinicsSummary } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: summary, isLoading } = useGetClinicsSummary();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary px-4 py-20 md:py-32 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto relative z-10 max-w-4xl text-center">
          <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-md mb-6 border border-white/20">
            <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
            Sick right now? Don't wait.
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Skip the 3-week wait for the NYU Student Health Center.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Find trusted, fast-booking clinics near Washington Square Park that accept the NYU student health insurance plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full h-14 px-8 text-lg">
              <Link href="/clinics">
                Find a Clinic <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full h-14 px-8 text-lg bg-transparent">
              <Link href="/insurance">
                Check Insurance Plan
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* The Problem / Solution Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Why we built this</h2>
              <p className="text-muted-foreground text-lg">
                The NYU Student Health Center is great, but getting an appointment can take up to 21 days. When you have strep throat, a sprained ankle, or a mystery rash, you don't have 3 weeks to wait.
              </p>
              <p className="text-muted-foreground text-lg">
                We've compiled a directory of vetted clinics near campus that take the NYU Wellcare plan, offer walk-ins, and have average wait times measured in days—not weeks.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
              <Card className="relative border-border shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
                    <div className="p-6 text-center">
                      <p className="text-sm font-medium text-muted-foreground mb-2">NYU Clinic Wait</p>
                      <p className="text-4xl font-bold text-destructive">~21 <span className="text-xl font-medium">days</span></p>
                    </div>
                    <div className="p-6 text-center bg-secondary/30">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Alternative Clinics</p>
                      {isLoading ? (
                        <Skeleton className="h-10 w-24 mx-auto" />
                      ) : (
                        <p className="text-4xl font-bold text-primary">{summary?.averageWaitDays.toFixed(1)} <span className="text-xl font-medium">days</span></p>
                      )}
                    </div>
                  </div>
                  <div className="p-6 bg-card text-center">
                    <div className="flex justify-center mb-4">
                      {isLoading ? (
                        <Skeleton className="h-16 w-16 rounded-full" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
                          <Activity className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    {isLoading ? (
                      <Skeleton className="h-6 w-48 mx-auto" />
                    ) : (
                      <p className="text-lg font-medium">Tracking {summary?.totalClinics} nearby clinics</p>
                    )}
                    {isLoading ? (
                      <Skeleton className="h-4 w-32 mx-auto mt-2" />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{summary?.walkInCount} accept walk-ins</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to get seen fast</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Wait times upfront</h3>
                <p className="text-muted-foreground">We show the average days until the next available appointment right on the clinic card.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Insurance filtered</h3>
                <p className="text-muted-foreground">Toggle "Accepts NYU Insurance" to only see clinics where your student plan is guaranteed to work.</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Proximity to campus</h3>
                <p className="text-muted-foreground">Find clinics in Greenwich Village, SoHo, and Union Square. Easily walk or take a quick train.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 md:py-32 bg-background border-t border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Stop waiting. Start feeling better.</h2>
          <p className="text-lg text-muted-foreground mb-10">Find a doctor and book an appointment today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full h-14 px-8 text-lg">
              <Link href="/clinics">
                Browse Directory
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
