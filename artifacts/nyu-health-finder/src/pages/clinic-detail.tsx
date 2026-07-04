import { useRoute, Link } from "wouter";
import { useState } from "react";
import { useGetClinic, useListClinicDoctors, useListClinicReviews, useCreateClinicReview, getListClinicReviewsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MapPin, Clock, Star, Phone, ShieldCheck, DoorOpen, Navigation, ArrowLeft, AlertCircle, Calendar, User, MessageSquare, Plus } from "lucide-react";
import { format, isToday, isTomorrow, isThisYear, parseISO, differenceInDays } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const reviewSchema = z.object({
  authorName: z.string().min(1, "Name is required"),
  rating: z.number().min(1, "Rating is required").max(5),
  reportedWaitDays: z.coerce.number().min(0).optional(),
  comment: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

function formatNextAvailable(dateString: string) {
  const date = parseISO(dateString);
  if (isToday(date)) {
    return `Today, ${format(date, "h:mm a")}`;
  }
  if (isTomorrow(date)) {
    return `Tomorrow, ${format(date, "h:mm a")}`;
  }
  if (isThisYear(date)) {
    return format(date, "EEE, MMM d · h:mm a");
  }
  return format(date, "MMM d, yyyy · h:mm a");
}

function formatRelativeTime(dateString: string) {
  const date = parseISO(dateString);
  const days = differenceInDays(new Date(), date);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return format(date, "MMM d, yyyy");
}

export default function ClinicDetail() {
  const [, params] = useRoute("/clinics/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const queryClient = useQueryClient();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  
  const { data: clinic, isLoading: isLoadingClinic, isError: isErrorClinic } = useGetClinic(id);
  const { data: doctors, isLoading: isLoadingDoctors } = useListClinicDoctors(id);
  const { data: reviews, isLoading: isLoadingReviews } = useListClinicReviews(id);
  
  const createReviewMutation = useCreateClinicReview({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListClinicReviewsQueryKey(id) });
        toast.success("Review submitted successfully!");
        setIsReviewDialogOpen(false);
        form.reset();
      },
      onError: () => {
        toast.error("Failed to submit review. Please try again.");
      }
    }
  });

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      authorName: "",
      rating: 5,
      reportedWaitDays: undefined,
      comment: "",
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    createReviewMutation.mutate({ id, data });
  };

  if (isLoadingClinic) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-24 mb-8" />
        <Skeleton className="h-40 w-full rounded-2xl mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isErrorClinic || !clinic) {
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

  const avgCommunityWait = reviews?.filter(r => r.reportedWaitDays !== null).length 
    ? (reviews.reduce((acc, r) => acc + (r.reportedWaitDays || 0), 0) / reviews.filter(r => r.reportedWaitDays !== null).length).toFixed(1)
    : null;

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
                <p>{clinic.notes || "A reliable, highly-rated clinic specializing in urgent and primary care needs for students."}</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Available Doctors</h2>
              <div className="grid gap-4">
                {isLoadingDoctors ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="bg-card">
                      <CardContent className="p-4 flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </CardContent>
                    </Card>
                  ))
                ) : doctors?.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No doctors listed for this clinic.
                    </CardContent>
                  </Card>
                ) : (
                  doctors?.map((doctor, index) => (
                    <Card key={doctor.id} className="group hover:border-primary/50 transition-colors">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{doctor.name}</h3>
                            {index === 0 && (
                              <Badge className="bg-primary text-white hover:bg-primary/90">Soonest</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">{doctor.title}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium bg-primary/5 text-primary px-3 py-1.5 rounded-lg border border-primary/10">
                          <Calendar className="h-4 w-4" />
                          <span>Next: {formatNextAvailable(doctor.nextAvailableAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Reviews & Wait Time Reports</h2>
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full shadow-sm">
                      <Plus className="mr-2 h-4 w-4" /> Write a review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Write a review</DialogTitle>
                      <DialogDescription>
                        Share your experience to help other NYU students.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                          control={form.control}
                          name="authorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rating</FormLabel>
                              <FormControl>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      className="p-1 transition-transform active:scale-95"
                                      onClick={() => field.onChange(star)}
                                    >
                                      <Star
                                        className={cn(
                                          "h-8 w-8",
                                          star <= field.value
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-muted-foreground"
                                        )}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="reportedWaitDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Days you waited for appointment (optional)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g. 2" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="comment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Comment (optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="What was your experience like?" 
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter className="pt-4">
                          <Button 
                            type="submit" 
                            className="w-full sm:w-auto" 
                            disabled={createReviewMutation.isPending}
                          >
                            {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {isLoadingReviews ? (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex gap-8">
                        <Skeleton className="h-20 w-24" />
                        <Skeleton className="h-20 w-40" />
                      </div>
                    </CardContent>
                  </Card>
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                  </div>
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  <Card className="bg-primary/5 border-primary/10 overflow-hidden relative">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-8 sm:items-center">
                        <div className="flex flex-col items-center sm:border-r border-primary/10 sm:pr-8">
                          <div className="text-4xl font-bold text-primary mb-1">
                            {clinic.rating}
                          </div>
                          <div className="flex gap-0.5 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "h-4 w-4",
                                  star <= Math.round(clinic.rating)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-muted-foreground"
                                )}
                              />
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                            {reviews.length} Reviews
                          </div>
                        </div>
                        {avgCommunityWait && (
                          <div className="flex flex-col items-center sm:items-start">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Community Reported Wait</div>
                            <div className="flex items-baseline gap-1 text-primary">
                              <span className="text-3xl font-bold">{avgCommunityWait}</span>
                              <span className="font-medium">days avg</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="border-border/50">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                                {review.authorName[0].toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold">{review.authorName}</h4>
                                <p className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "h-3.5 w-3.5",
                                    star <= review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-muted-foreground"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          {review.reportedWaitDays !== null && (
                            <Badge variant="outline" className="mb-3 bg-primary/5 text-primary border-primary/20 font-normal">
                              Waited {review.reportedWaitDays} {review.reportedWaitDays === 1 ? 'day' : 'days'}
                            </Badge>
                          )}
                          {review.comment && (
                            <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4 text-muted-foreground">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No reviews yet</h3>
                    <p className="text-muted-foreground mb-6">Be the first to share your experience with this clinic.</p>
                  </CardContent>
                </Card>
              )}
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
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-muted-foreground" /> Location
                </h3>
                <p className="mb-4 text-muted-foreground">{clinic.address}</p>
                <Button variant="outline" className="w-full rounded-xl">
                  <Navigation className="mr-2 h-4 w-4" /> Get Directions
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-muted-foreground" /> Hours
                </h3>
                <p className="text-muted-foreground whitespace-pre-line">{clinic.hours}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
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

