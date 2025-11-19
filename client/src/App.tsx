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

// Dynamic Service Route (handles all service pages automatically)
import DynamicServiceRoute from "@/components/DynamicServiceRoute";

// Legacy manual service pages (will be migrated to dynamic routing)
import LawnMowing from "@/pages/services/LawnMowing";
import PatioInstallation from "@/pages/services/PatioInstallation";
import PondInstallation from "@/pages/services/PondInstallation";
import FenceInstallation from "@/pages/services/FenceInstallation";

// Commercial Pages
import HOAServices from "@/pages/commercial/HOAServices";
import PropertyManagement from "@/pages/commercial/PropertyManagement";
import MunicipalServices from "@/pages/commercial/MunicipalServices";

// Area Pages
import Kuna from "@/pages/areas/Kuna";
import Boise from "@/pages/areas/Boise";
import Meridian from "@/pages/areas/Meridian";
import Nampa from "@/pages/areas/Nampa";
import Caldwell from "@/pages/areas/Caldwell";
import Eagle from "@/pages/areas/Eagle";

// Additional Pages
import Pricing from "@/pages/Pricing";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import GetQuote from "@/pages/GetQuote";

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

          {/* Service Landing Pages */}
          <Route path="/services/lawn-care" component={LawnCare} />
          <Route path="/services/landscaping" component={Landscaping} />
          <Route path="/services/christmas-lights" component={ChristmasLights} />

          {/* Legacy Manual Service Pages (keeping for backward compatibility) */}
          <Route path="/services/lawn-mowing" component={LawnMowing} />
          <Route path="/services/lawn-maintenance" component={LawnMowing} />
          <Route path="/services/patio-installation" component={PatioInstallation} />
          <Route path="/services/paver-patio" component={PatioInstallation} />
          <Route path="/services/pond-installation" component={PondInstallation} />
          <Route path="/services/koi-pond" component={PondInstallation} />
          <Route path="/services/fountain-installation" component={PondInstallation} />
          <Route path="/services/waterfall-installation" component={PondInstallation} />
          <Route path="/services/fence-installation" component={FenceInstallation} />
          <Route path="/services/wood-fence" component={FenceInstallation} />
          <Route path="/services/vinyl-fence" component={FenceInstallation} />

          {/* Dynamic Service Routes - Handles ALL services in contentData.ts automatically */}
          {/* Pattern: /services/:serviceSlug/:citySlug? */}
          {/* Examples: /services/aeration, /services/aeration/kuna */}
          <Route path="/services/:serviceSlug/:citySlug?" component={DynamicServiceRoute} />

          {/* Commercial Pages */}
          <Route path="/commercial/hoa-services" component={HOAServices} />
          <Route path="/commercial/hoa-services/:city" component={HOAServices} />
          <Route path="/commercial/property-management" component={PropertyManagement} />
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

          {/* Additional Pages */}
          <Route path="/pricing" component={Pricing} />
          <Route path="/get-quote" component={GetQuote} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />

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
