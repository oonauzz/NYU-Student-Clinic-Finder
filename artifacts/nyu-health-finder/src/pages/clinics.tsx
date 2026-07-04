import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useListClinics, useListSpecialties, useListBoroughs, useListInsurancePlans } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Star, Search, ShieldCheck, DoorOpen, GraduationCap, ChevronRight, Building2, X, Scale } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const MAX_COMPARE = 3;

export default function Clinics() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState<string>("all");
  const [insurancePlanId, setInsurancePlanId] = useState<string>("all");
  const [borough, setBorough] = useState<string | null>(null);
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const [acceptsInsurance, setAcceptsInsurance] = useState(false);
  const [compareIds, setCompareIds] = useState<number[]>([]);

  const { data: specialties = [], isLoading: isLoadingSpecialties } = useListSpecialties();
  const { data: boroughs = [], isLoading: isLoadingBoroughs } = useListBoroughs();
  const { data: insurancePlans = [] } = useListInsurancePlans();

  const { data: allClinics = [] } = useListClinics({});
  const nyuHealthCenter = useMemo(
    () => allClinics.find((c) => c.isNyuHealthCenter),
    [allClinics],
  );

  const { data: rawClinics = [], isLoading: isLoadingClinics } = useListClinics({
    search: search || undefined,
    specialty: specialty !== "all" ? specialty : undefined,
    borough: borough ?? undefined,
    neighborhood: neighborhood ?? undefined,
    acceptsNyuInsurance: acceptsInsurance ? true : undefined,
    insurancePlanId: insurancePlanId !== "all" ? parseInt(insurancePlanId, 10) : undefined,
  });

  const clinics = useMemo(
    () => rawClinics.filter((c) => !c.isNyuHealthCenter),
    [rawClinics],
  );

  const activeBoroughGroup = useMemo(
    () => boroughs.find((b) => b.borough === borough),
    [boroughs, borough],
  );

  const locationLabel = neighborhood
    ? `${neighborhood}, ${borough}`
    : borough
      ? borough
      : "Any Location";

  const clearLocation = () => {
    setBorough(null);
    setNeighborhood(null);
  };

  const toggleCompare = (id: number) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((c) => c !== id);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const goToCompare = () => {
    navigate(`/compare?ids=${compareIds.join(",")}`);
  };

  return (
    <div className="w-full bg-background min-h-screen py-8">
      <div className="container mx-auto px-4 pb-28">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Find a Clinic</h1>
          <p className="text-muted-foreground text-lg">Browse faster alternatives to the NYU Student Health Center across NYC.</p>
        </div>

        {/* NYU Student Health Center: pinned as the reference point, not a filterable alternative */}
        {nyuHealthCenter && (
          <Link href={`/clinics/${nyuHealthCenter.id}`} className="block mb-8">
            <Card className="border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">Your Current Option</span>
                  </div>
                  <h3 className="text-lg font-bold">{nyuHealthCenter.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    The baseline everything below is measured against — ~{nyuHealthCenter.averageWaitDays} day wait, always covered by your student plan.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-primary shrink-0">
                  View details <ChevronRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="search"
                  placeholder="Clinic name..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger id="specialty">
                  <SelectValue placeholder="Any Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Specialty</SelectItem>
                  {specialties.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance-plan">Insurance</Label>
              <Select value={insurancePlanId} onValueChange={setInsurancePlanId}>
                <SelectTrigger id="insurance-plan">
                  <SelectValue placeholder="Any Insurance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Insurance</SelectItem>
                  {insurancePlans.map(plan => (
                    <SelectItem key={plan.id} value={String(plan.id)}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 h-10 px-2">
              <Switch 
                id="insurance" 
                checked={acceptsInsurance} 
                onCheckedChange={setAcceptsInsurance}
              />
              <Label htmlFor="insurance" className="cursor-pointer">Takes NYU Insurance</Label>
            </div>
          </div>

          {/* StreetEasy-style borough -> neighborhood drill down */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> Location
              </Label>
              {(borough || neighborhood) && (
                <button
                  onClick={clearLocation}
                  className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            {isLoadingBoroughs ? (
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-28 rounded-lg" />
                ))}
              </div>
            ) : !borough ? (
              <div className="flex flex-wrap gap-2">
                {boroughs.map((b) => (
                  <button
                    key={b.borough}
                    onClick={() => setBorough(b.borough)}
                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {b.borough}
                    <Badge variant="secondary" className="ml-1 font-normal">{b.clinicCount}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => { setBorough(null); setNeighborhood(null); }}
                    className="text-muted-foreground hover:text-primary font-medium"
                  >
                    All Boroughs
                  </button>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-semibold">{borough}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setNeighborhood(null)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      !neighborhood
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-background hover:border-primary/50",
                    )}
                  >
                    All of {borough}
                  </button>
                  {activeBoroughGroup?.neighborhoods.map((n) => (
                    <button
                      key={n}
                      onClick={() => setNeighborhood(n)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                        neighborhood === n
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border bg-background hover:border-primary/50",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(borough || neighborhood) && (
              <p className="text-xs text-muted-foreground">Showing clinics in {locationLabel}</p>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoadingClinics ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : clinics.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-border rounded-xl bg-muted/30">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4 text-muted-foreground">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">No clinics found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            clinics.map((clinic, i) => {
              const isSelected = compareIds.includes(clinic.id);
              const compareDisabled = !isSelected && compareIds.length >= MAX_COMPARE;
              return (
                <Card
                  key={clinic.id}
                  className={cn(
                    "h-full overflow-hidden hover:shadow-md transition-all flex flex-col animate-in fade-in slide-in-from-bottom-4 relative",
                    clinic.isNyuHealthCenter
                      ? "border-2 border-primary shadow-md ring-2 ring-primary/10"
                      : "hover:border-primary/50",
                    isSelected && "ring-2 ring-primary",
                  )}
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
                >
                  <label
                    className={cn(
                      "absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-background/95 border border-border px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur",
                      compareDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50",
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={compareDisabled}
                      onCheckedChange={() => toggleCompare(clinic.id)}
                    />
                    Compare
                  </label>
                  <Link href={`/clinics/${clinic.id}`} className="flex flex-col flex-1">
                    {clinic.isNyuHealthCenter && (
                      <div className="bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider px-4 py-1.5 flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5" /> NYU Student Health Center
                      </div>
                    )}
                    <div className="bg-secondary/30 p-4 border-b border-border flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border ${clinic.averageWaitDays <= 2 ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' : 'bg-background border-border'} shadow-sm`}>
                          <span className="text-2xl font-bold leading-none">{clinic.averageWaitDays}</span>
                          <span className="text-[10px] font-medium uppercase">Days</span>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Wait Time</div>
                          <Badge variant="outline" className="bg-background text-xs font-normal">vs. 21 at NYU</Badge>
                        </div>
                      </div>
                      {clinic.walkInAvailable && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 border-none mr-14">
                          <DoorOpen className="h-3 w-3" /> Walk-in
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">{clinic.name}</h3>
                        <div className="flex items-center text-sm font-medium">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                          {clinic.rating}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="font-normal text-muted-foreground">{clinic.specialty}</Badge>
                        {clinic.acceptsNyuInsurance && (
                          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-normal">
                            <ShieldCheck className="h-3 w-3 mr-1" /> Takes NYU Plan
                          </Badge>
                        )}
                      </div>

                      {clinic.acceptedInsurancePlans.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {clinic.acceptedInsurancePlans.map((plan) => (
                            <Badge key={plan.id} variant="secondary" className="font-normal text-xs">
                              {plan.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2 mt-auto pt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="line-clamp-1">{clinic.neighborhood}, {clinic.borough} • {clinic.distanceFromCampusMiles} mi from campus</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 shrink-0" />
                          <span className="line-clamp-1">{clinic.hours}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {compareIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card/95 backdrop-blur shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Scale className="h-4 w-4 text-primary" />
              {compareIds.length} of {MAX_COMPARE} selected to compare
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCompareIds([])}>
                Clear
              </Button>
              <Button
                size="sm"
                className="rounded-lg"
                disabled={compareIds.length < 2}
                onClick={goToCompare}
              >
                Compare {compareIds.length > 1 ? `(${compareIds.length})` : ""}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
