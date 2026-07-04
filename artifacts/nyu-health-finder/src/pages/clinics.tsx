import { useState } from "react";
import { Link } from "wouter";
import { useListClinics, useListSpecialties, useListNeighborhoods } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Star, Search, ShieldCheck, ArrowRight, DoorOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Clinics() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState<string>("all");
  const [neighborhood, setNeighborhood] = useState<string>("all");
  const [acceptsInsurance, setAcceptsInsurance] = useState(false);

  const { data: specialties = [], isLoading: isLoadingSpecialties } = useListSpecialties();
  const { data: neighborhoods = [], isLoading: isLoadingNeighborhoods } = useListNeighborhoods();
  
  const { data: clinics = [], isLoading: isLoadingClinics } = useListClinics({
    search: search || undefined,
    specialty: specialty !== "all" ? specialty : undefined,
    neighborhood: neighborhood !== "all" ? neighborhood : undefined,
    acceptsNyuInsurance: acceptsInsurance ? true : undefined,
  });

  return (
    <div className="w-full bg-background min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Find a Clinic</h1>
          <p className="text-muted-foreground text-lg">Browse faster alternatives to the NYU Student Health Center.</p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
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
              <Label htmlFor="neighborhood">Neighborhood</Label>
              <Select value={neighborhood} onValueChange={setNeighborhood}>
                <SelectTrigger id="neighborhood">
                  <SelectValue placeholder="Any Neighborhood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Neighborhood</SelectItem>
                  {neighborhoods.map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
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
            clinics.map((clinic, i) => (
              <Link key={clinic.id} href={`/clinics/${clinic.id}`}>
                <Card className="h-full overflow-hidden hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}>
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
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 border-none">
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

                    <div className="space-y-2 mt-auto pt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-1">{clinic.neighborhood} • {clinic.distanceFromCampusMiles} mi from campus</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-1">{clinic.hours}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
