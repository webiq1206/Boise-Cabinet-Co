import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { StickyBottomNav } from "@/components/StickyBottomNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useEffect, lazy, Suspense } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Lazy-loaded pages for code splitting
const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Service Landing Pages
const LawnCare = lazy(() => import("@/pages/services/LawnCare"));
const Landscaping = lazy(() => import("@/pages/services/Landscaping"));
const ChristmasLights = lazy(() => import("@/pages/services/ChristmasLights"));
const FenceInstallation = lazy(() => import("@/pages/services/FenceInstallation"));
const PondInstallation = lazy(() => import("@/pages/services/PondInstallation"));
const IrrigationInstallation = lazy(() => import("@/pages/services/IrrigationInstallation"));

// Dynamic Service Route (handles all service pages automatically)
const DynamicServiceRoute = lazy(() => import("@/components/DynamicServiceRoute"));

// Commercial Pages
const HOAServices = lazy(() => import("@/pages/commercial/HOAServices"));
const Commercial = lazy(() => import("@/pages/commercial/Commercial"));
const MunicipalServices = lazy(() => import("@/pages/commercial/MunicipalServices"));

// Area Pages
const Kuna = lazy(() => import("@/pages/areas/Kuna"));
const Boise = lazy(() => import("@/pages/areas/Boise"));
const Meridian = lazy(() => import("@/pages/areas/Meridian"));
const Nampa = lazy(() => import("@/pages/areas/Nampa"));
const Caldwell = lazy(() => import("@/pages/areas/Caldwell"));
const Eagle = lazy(() => import("@/pages/areas/Eagle"));
const Star = lazy(() => import("@/pages/areas/Star"));
const Middleton = lazy(() => import("@/pages/areas/Middleton"));

// Additional Pages
const Pricing = lazy(() => import("@/pages/Pricing"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const GetQuote = lazy(() => import("@/pages/GetQuote"));
const Services = lazy(() => import("@/pages/Services"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const SubcontractorPortal = lazy(() => import("@/pages/SubcontractorPortal"));
const PurchaseHistory = lazy(() => import("@/pages/PurchaseHistory"));
const AnalyticsDashboard = lazy(() => import("@/pages/AnalyticsDashboard"));

function Router() {
  useAnalytics();
  
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navigation />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            {/* Core Pages */}
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route path="/services" component={Services} />

            {/* Service Landing Pages */}
            <Route path="/services/lawn-care" component={LawnCare} />
            <Route path="/services/landscaping" component={Landscaping} />
            <Route path="/services/christmas-lights" component={ChristmasLights} />
            <Route path="/services/fence-installation" component={FenceInstallation} />
            <Route path="/services/pond-installation" component={PondInstallation} />
            <Route path="/services/irrigation-installation" component={IrrigationInstallation} />

            {/* Dynamic Service Routes - Handles ALL services in contentData.ts automatically */}
            {/* Pattern: /services/:serviceSlug/:citySlug? */}
            {/* Examples: /services/aeration, /services/aeration/kuna, /services/lawn-mowing */}
            <Route path="/services/:serviceSlug/:citySlug?" component={DynamicServiceRoute} />

            {/* Commercial Pages */}
            <Route path="/commercial/hoa-services" component={HOAServices} />
            <Route path="/commercial/hoa-services/:city" component={HOAServices} />
            <Route path="/commercial" component={Commercial} />
            <Route path="/commercial/municipal-services" component={MunicipalServices} />
            <Route path="/commercial/commercial-lawn-care" component={HOAServices} />
            <Route path="/commercial/commercial-services" component={HOAServices} />

            {/* Service Areas */}
            <Route path="/areas/kuna" component={Kuna} />
            <Route path="/areas/boise" component={Boise} />
            <Route path="/areas/meridian" component={Meridian} />
            <Route path="/areas/nampa" component={Nampa} />
            <Route path="/areas/caldwell" component={Caldwell} />
            <Route path="/areas/eagle" component={Eagle} />
            <Route path="/areas/star" component={Star} />
            <Route path="/areas/middleton" component={Middleton} />

            {/* Additional Pages */}
            <Route path="/pricing" component={Pricing} />
            <Route path="/get-quote" component={GetQuote} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:slug" component={BlogPost} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/terms-of-service" component={TermsOfService} />

            {/* Lead Distribution System */}
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/analytics" component={AnalyticsDashboard} />
            <Route path="/subcontractor/portal" component={SubcontractorPortal} />
            <Route path="/subcontractor/purchases" component={PurchaseHistory} />

            {/* 404 */}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Footer />
      <StickyBottomNav />
    </div>
  );
}

function App() {
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
