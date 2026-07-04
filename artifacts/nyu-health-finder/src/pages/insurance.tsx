import { useListInsurancePlans } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, CheckCircle2, AlertCircle, HelpCircle, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Insurance() {
  const { data: plans, isLoading } = useListInsurancePlans();

  return (
    <div className="w-full bg-background min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">NYU Health Insurance Info</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about your student health plan, how to use it off-campus, and coverage details.
          </p>
        </div>

        {/* Quick Tips */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2 flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 text-green-300" /> Need to see someone today?
              </h3>
              <p className="text-primary-foreground/90">
                You do NOT need a referral from the NYU Student Health Center for urgent care visits. You can go straight to an in-network urgent care clinic.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-amber-500" /> Specialist Referrals
              </h3>
              <p className="text-muted-foreground">
                For non-urgent specialists (dermatology, orthopedics), you typically DO need a referral from the NYU Health Center first to get it covered.
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-6">Available Plans (2023-2024)</h2>
        
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-8 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6 mb-12">
            {plans?.map((plan) => (
              <Card key={plan.id} className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <div className={`h-2 w-full ${plan.name.includes("Comprehensive") ? "bg-primary" : "bg-muted-foreground/30"}`} />
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <CardTitle className="text-2xl mb-1">{plan.name}</CardTitle>
                      <CardDescription className="text-base">{plan.description}</CardDescription>
                    </div>
                    <div className="text-left md:text-right shrink-0">
                      <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Annual Premium</div>
                      <div className="text-3xl font-bold">${plan.annualPremium.toLocaleString()}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-secondary/30 rounded-xl p-5 mb-6">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-primary" /> Key Benefits
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {plan.keyBenefits.map((benefit, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Info className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                    <span className="text-muted-foreground">
                      {plan.waivable 
                        ? "This plan is automatically charged to your bursar bill, but can be waived if you have comparable coverage." 
                        : "This plan is optional and must be actively enrolled in."}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <h2 className="text-2xl font-bold mb-6">Common Questions</h2>
        <Card>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="px-6 border-b-border">
                <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary">
                  Do I have to go to the NYU Health Center first?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  For urgent care, emergency room visits, and general wellness walk-ins, no. You can go to any in-network provider. However, for specialized care (like seeing a dermatologist or neurologist), the Comprehensive Plan requires a referral from the NYU Student Health Center first.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="px-6 border-b-border">
                <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary">
                  How do I get my insurance card?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  NYU uses Wellcare/UnitedHealthcare. You will not be mailed a physical card. You must download the UnitedHealthcare StudentResources app and create an account using your NYU email to access your digital ID card.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="px-6 border-b-border">
                <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary">
                  What is a copay?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  A copay is a fixed amount you pay out-of-pocket at the time of your visit. For the NYU Comprehensive plan, standard office visits typically have a $20-30 copay, while urgent care visits might be $50. Always ask the clinic before your visit.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="px-6 border-b-0">
                <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary">
                  How do I waive the insurance?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  If you already have health insurance (like through your parents) that meets NYU's requirements, you can waive the NYU plan to avoid the annual charge. This must be done through the Student Health Insurance website before the semester's deadline (usually mid-September for Fall).
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
