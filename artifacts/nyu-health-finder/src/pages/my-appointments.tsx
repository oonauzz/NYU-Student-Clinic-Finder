import { useState } from "react";
import { Link } from "wouter";
import { useListAppointmentsByEmail } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck, MapPin, User, Mail, Phone, MessageSquare, Search, AlertCircle } from "lucide-react";
import { format, isToday, isTomorrow, isThisYear, parseISO } from "date-fns";

function formatAppointmentTime(dateString: string) {
  const date = parseISO(dateString);
  if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, "h:mm a")}`;
  if (isThisYear(date)) return format(date, "EEE, MMM d · h:mm a");
  return format(date, "MMM d, yyyy · h:mm a");
}

export default function MyAppointments() {
  const [emailInput, setEmailInput] = useState("");
  const [searchedEmail, setSearchedEmail] = useState<string | null>(null);

  const { data: appointments, isLoading, isFetched } = useListAppointmentsByEmail(
    { email: searchedEmail ?? "" },
    { query: { enabled: !!searchedEmail, queryKey: ["listAppointmentsByEmail", searchedEmail] } },
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim();
    if (trimmed) {
      setSearchedEmail(trimmed);
    }
  };

  return (
    <div className="w-full bg-background min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <CalendarCheck className="h-7 w-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">My Appointments</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Enter the email you used when booking to see your upcoming and past appointments.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="flex-1">
            <Label htmlFor="lookup-email" className="sr-only">
              Email address
            </Label>
            <Input
              id="lookup-email"
              type="email"
              required
              placeholder="you@nyu.edu"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="h-12"
            />
          </div>
          <Button type="submit" className="h-12 px-8" disabled={!emailInput.trim()}>
            <Search className="h-4 w-4 mr-2" />
            Find Appointments
          </Button>
        </form>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        )}

        {!isLoading && isFetched && appointments && appointments.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any bookings for <span className="font-medium text-foreground">{searchedEmail}</span>.
            </p>
            <Button asChild variant="outline">
              <Link href="/clinics">Find a Clinic</Link>
            </Button>
          </div>
        )}

        {!isLoading && appointments && appointments.length > 0 && (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <Card key={appt.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className="capitalize font-normal bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800"
                        >
                          {appt.status}
                        </Badge>
                      </div>
                      <Link
                        href={`/clinics/${appt.clinicId}`}
                        className="text-lg font-bold hover:text-primary transition-colors"
                      >
                        {appt.clinicName}
                      </Link>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1.5" />
                        {appt.clinicNeighborhood}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <User className="h-3.5 w-3.5 mr-1.5" />
                        {appt.doctorName}
                      </div>
                    </div>

                    <div className="md:text-right">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                        Appointment
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {formatAppointmentTime(appt.appointmentAt as unknown as string)}
                      </p>
                    </div>
                  </div>

                  {(appt.patientPhone || appt.notes) && (
                    <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                        {appt.patientEmail}
                      </div>
                      {appt.patientPhone && (
                        <div className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                          {appt.patientPhone}
                        </div>
                      )}
                      {appt.notes && (
                        <div className="flex items-center sm:col-span-2">
                          <MessageSquare className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                          {appt.notes}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
