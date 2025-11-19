import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

// Individual Service Pages
import LawnMowing from "@/pages/services/LawnMowing";
import PatioInstallation from "@/pages/services/PatioInstallation";
import PondInstallation from "@/pages/services/PondInstallation";
import FenceInstallation from "@/pages/services/FenceInstallation";

// Generated Service Pages (using templates)
import AerationPage from "@/pages/services/generated/AerationPage";
import FertilizationPage from "@/pages/services/generated/FertilizationPage";
import WeedControlPage from "@/pages/services/generated/WeedControlPage";
import SodInstallationPage from "@/pages/services/generated/SodInstallationPage";

// Kuna Service Pages
import LawnMowingKuna from "@/pages/services/kuna/LawnMowingKuna";
import AerationKuna from "@/pages/services/kuna/AerationKuna";
import FertilizationKuna from "@/pages/services/kuna/FertilizationKuna";
import WeedControlKuna from "@/pages/services/kuna/WeedControlKuna";
import SodInstallationKuna from "@/pages/services/kuna/SodInstallationKuna";
import PatioInstallationKuna from "@/pages/services/kuna/PatioInstallationKuna";

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

          {/* Individual Service Pages - Lawn Care */}
          <Route path="/services/lawn-mowing" component={LawnMowing} />
          <Route path="/services/lawn-maintenance" component={LawnMowing} />
          <Route path="/services/aeration" component={AerationPage} />
          <Route path="/services/fertilization" component={FertilizationPage} />
          <Route path="/services/weed-control" component={WeedControlPage} />
          <Route path="/services/hedge-trimming" component={LawnMowing} />
          <Route path="/services/seasonal-cleanup" component={LawnMowing} />
          <Route path="/services/sprinkler-blowout" component={LawnMowing} />
          <Route path="/services/dethatching" component={LawnMowing} />
          <Route path="/services/irrigation-repair" component={LawnMowing} />

          {/* Individual Service Pages - Landscaping */}
          <Route path="/services/patio-installation" component={PatioInstallation} />
          <Route path="/services/paver-patio" component={PatioInstallation} />
          <Route path="/services/sod-installation" component={SodInstallationPage} />
          <Route path="/services/retaining-walls" component={PatioInstallation} />
          <Route path="/services/retaining-wall-construction" component={PatioInstallation} />
          <Route path="/services/pond-installation" component={PondInstallation} />
          <Route path="/services/koi-pond" component={PondInstallation} />
          <Route path="/services/fountain-installation" component={PondInstallation} />
          <Route path="/services/waterfall-installation" component={PondInstallation} />
          <Route path="/services/fence-installation" component={FenceInstallation} />
          <Route path="/services/wood-fence" component={FenceInstallation} />
          <Route path="/services/vinyl-fence" component={FenceInstallation} />
          <Route path="/services/fire-pit-installation" component={PatioInstallation} />
          <Route path="/services/outdoor-fireplace" component={PatioInstallation} />
          <Route path="/services/landscape-lighting" component={PatioInstallation} />
          <Route path="/services/pathway-lighting" component={PatioInstallation} />
          <Route path="/services/sprinkler-system-installation" component={PatioInstallation} />
          <Route path="/services/irrigation-installation" component={PatioInstallation} />
          <Route path="/services/drip-irrigation" component={PatioInstallation} />
          <Route path="/services/smart-irrigation" component={PatioInstallation} />
          <Route path="/services/irrigation-maintenance" component={PatioInstallation} />

          {/* Kuna-specific service pages */}
          <Route path="/services/lawn-mowing/kuna" component={LawnMowingKuna} />
          <Route path="/services/aeration/kuna" component={AerationKuna} />
          <Route path="/services/fertilization/kuna" component={FertilizationKuna} />
          <Route path="/services/weed-control/kuna" component={WeedControlKuna} />
          <Route path="/services/sod-installation/kuna" component={SodInstallationKuna} />
          <Route path="/services/patio-installation/kuna" component={PatioInstallationKuna} />
          
          {/* Geo-targeted examples (using same components with different URLs) */}
          <Route path="/services/lawn-mowing/:city" component={LawnMowing} />
          <Route path="/services/patio-installation/:city" component={PatioInstallation} />
          <Route path="/services/pond-installation/:city" component={PondInstallation} />
          <Route path="/services/fence-installation/:city" component={FenceInstallation} />
          <Route path="/services/christmas-lights/:city" component={ChristmasLights} />

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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
