import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Clinics from "@/pages/clinics";
import ClinicDetail from "@/pages/clinic-detail";
import Compare from "@/pages/compare";
import Insurance from "@/pages/insurance";
import MyAppointments from "@/pages/my-appointments";
import { Layout } from "@/components/layout/Layout";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/clinics" component={Clinics} />
        <Route path="/compare" component={Compare} />
        <Route path="/clinics/:id" component={ClinicDetail} />
        <Route path="/insurance" component={Insurance} />
        <Route path="/my-appointments" component={MyAppointments} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
