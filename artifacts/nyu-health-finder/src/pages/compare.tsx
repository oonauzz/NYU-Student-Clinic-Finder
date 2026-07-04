import { useMemo } from "react";
import { Link, useSearch } from "wouter";
import { useGetClinic } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, MapPin, Clock, ShieldCheck, DoorOpen, GraduationCap, Phone, Check, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function ClinicColumn({ id }: { id: number }) {
  const { data: clinic, isLoading } = useGetClinic(id);

  if (isLoading || !clinic) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "h-full flex flex-col",
        clinic.isNyuHealthCenter && "border-2 border-primary ring-2 ring-primary/10",
      )}
    >
      {clinic.isNyuHealthCenter && (
        <div className="bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider px-4 py-1.5 flex items-center gap-1.5">
          <GraduationCap className="h-3.5 w-3.5" /> NYU Student Health Center
        </div>
      )}
      <CardContent className="p-6 flex-1 flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-bold mb-1 line-clamp-2">{clinic.name}</h2>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {clinic.neighborhood}, {clinic.borough}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-3 text-center">
            <div className="text-2xl font-bold text-primary">{clinic.averageWaitDays}</div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Wait Days</div>
          </div>
          <div className="rounded-lg border border-border p-3 text-center">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              {clinic.rating}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Rating</div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Specialty</span>
            <Badge variant="outline" className="font-normal">{clinic.specialty}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Walk-ins</span>
            {clinic.walkInAvailable ? (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                <DoorOpen className="h-4 w-4" /> Yes
              </span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <XIcon className="h-4 w-4" /> No
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Takes NYU Plan</span>
            {clinic.acceptsNyuInsurance ? (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                <ShieldCheck className="h-4 w-4" /> Yes
              </span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <XIcon className="h-4 w-4" /> No
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Distance</span>
            <span className="font-medium">{clinic.distanceFromCampusMiles} mi</span>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Accepted Insurance</div>
          {clinic.acceptedInsurancePlans.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not specified</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {clinic.acceptedInsurancePlans.map((plan) => (
                <Badge key={plan.id} variant="secondary" className="font-normal text-xs">
                  {plan.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 space-y-2 text-sm text-muted-foreground border-t border-border">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{clinic.hours}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0" />
            {clinic.phone}
          </div>
        </div>

        <Button asChild className="w-full rounded-lg">
          <Link href={`/clinics/${clinic.id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Compare() {
  const searchString = useSearch();

  const ids = useMemo(() => {
    const params = new URLSearchParams(searchString);
    const raw = params.get("ids") ?? "";
    return Array.from(
      new Set(
        raw
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !Number.isNaN(n)),
      ),
    );
  }, [searchString]);

  return (
    <div className="w-full bg-background min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/clinics" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to clinics
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <Check className="h-7 w-7 text-primary" /> Compare Clinics
          </h1>
          <p className="text-muted-foreground text-lg">Side-by-side comparison to help you pick the right option.</p>
        </div>

        {ids.length < 2 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium mb-2">Select at least 2 clinics to compare</h3>
              <p className="text-muted-foreground mb-6">Go back to the directory and check the "Compare" box on a few clinics.</p>
              <Button asChild>
                <Link href="/clinics">Browse Clinics</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={cn(
            "grid gap-6",
            ids.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3",
          )}>
            {ids.map((id) => (
              <ClinicColumn key={id} id={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
