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

// Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";

// Service Landing Pages
import LawnCare from "@/pages/services/LawnCare";
import Landscaping from "@/pages/services/Landscaping";
import ChristmasLights from "@/pages/services/ChristmasLights";
import FenceInstallation from "@/pages/services/FenceInstallation";
import PondInstallation from "@/pages/services/PondInstallation";
import IrrigationInstallation from "@/pages/services/IrrigationInstallation";

// Dynamic Service Route (handles all service pages automatically)
import DynamicServiceRoute from "@/components/DynamicServiceRoute";

// Commercial Pages
import HOAServices from "@/pages/commercial/HOAServices";
import Commercial from "@/pages/commercial/Commercial";
import MunicipalServices from "@/pages/commercial/MunicipalServices";

// Area Pages
import Kuna from "@/pages/areas/Kuna";
import Boise from "@/pages/areas/Boise";
import Meridian from "@/pages/areas/Meridian";
import Nampa from "@/pages/areas/Nampa";
import Caldwell from "@/pages/areas/Caldwell";
import Eagle from "@/pages/areas/Eagle";
import Star from "@/pages/areas/Star";
import Middleton from "@/pages/areas/Middleton";

// Additional Pages
import Pricing from "@/pages/Pricing";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import GetQuote from "@/pages/GetQuote";
import Services from "@/pages/Services";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import AdminDashboard from "@/pages/AdminDashboard";
import SubcontractorPortal from "@/pages/SubcontractorPortal";
import PurchaseHistory from "@/pages/PurchaseHistory";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navigation />
      <main className="flex-1">
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
      </main>
      <Footer />
      <StickyBottomNav />
    </div>
  );
}

function App() {
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
