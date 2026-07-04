import { useRoute, Link } from "wouter";
import { useGetClinic } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Star, Phone, ShieldCheck, DoorOpen, Navigation, ArrowLeft, AlertCircle } from "lucide-react";

export default function ClinicDetail() {
  const [, params] = useRoute("/clinics/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: clinic, isLoading, isError } = useGetClinic(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-24 mb-8" />
        <Skeleton className="h-40 w-full rounded-2xl mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !clinic) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Clinic not found</h2>
        <p className="text-muted-foreground mb-8">The clinic you're looking for doesn't exist or has been removed from our directory.</p>
        <Button asChild>
          <Link href="/clinics">Back to Directory</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-background min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <Link href="/clinics" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to clinics
          </Link>
        </div>

        {/* Hero Section */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-10 mb-8 shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="flex-1 z-10">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="font-normal">{clinic.specialty}</Badge>
              {clinic.acceptsNyuInsurance && (
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-normal">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Accepts NYU Plan
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{clinic.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1.5" />
                <span className="font-medium text-foreground">{clinic.rating}</span>
                <span className="mx-1">/</span>
                <span>5.0</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1.5" />
                {clinic.neighborhood} ({clinic.distanceFromCampusMiles} mi)
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto z-10">
            <Card className="border-primary/20 bg-primary/5 shadow-none w-full md:w-64">
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Wait Time</p>
                <div className="flex items-baseline justify-center gap-1 mb-2 text-primary">
                  <span className="text-6xl font-bold tracking-tighter">{clinic.averageWaitDays}</span>
                  <span className="text-xl font-medium">days</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">Compared to ~21 days at NYU Health Center</p>
                <Button className="w-full h-12 text-md rounded-xl shadow-sm">
                  Book Appointment
                </Button>
                {clinic.walkInAvailable && (
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-4 flex items-center justify-center">
                    <DoorOpen className="h-4 w-4 mr-1" /> Walk-ins accepted
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                <p>{clinic.notes || "A reliable, highly-rated clinic located near the NYU campus, specializing in urgent and primary care needs for students."}</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Insurance Info</h2>
              <Card className="bg-card">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className={`p-3 rounded-full shrink-0 ${clinic.acceptsNyuInsurance ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {clinic.acceptsNyuInsurance ? "NYU Student Health Insurance Accepted" : "NYU Plan Not Guaranteed"}
                    </h3>
                    <p className="text-muted-foreground">
                      {clinic.acceptsNyuInsurance 
                        ? "This clinic officially accepts the Wellcare NYU student health insurance plan. You should only be responsible for your standard copay."
                        : "You may need to call ahead to verify if they accept your specific plan, or you might need to submit a claim for out-of-network reimbursement."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-muted-foreground" /> Location
                </h3>
                <p className="mb-4 text-muted-foreground">{clinic.address}</p>
                <Button variant="outline" className="w-full">
                  <Navigation className="mr-2 h-4 w-4" /> Get Directions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-muted-foreground" /> Hours
                </h3>
                <p className="text-muted-foreground">{clinic.hours}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-muted-foreground" /> Contact
                </h3>
                <p className="text-lg font-medium">{clinic.phone}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
