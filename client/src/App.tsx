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
import HedgeTrimmingPage from "@/pages/services/generated/HedgeTrimmingPage";
import SeasonalCleanupPage from "@/pages/services/generated/SeasonalCleanupPage";
import SprinklerBlowoutPage from "@/pages/services/generated/SprinklerBlowoutPage";
import DethatchingPage from "@/pages/services/generated/DethatchingPage";
import OverseedingPage from "@/pages/services/generated/OverseedingPage";
import MulchInstallationPage from "@/pages/services/generated/MulchInstallationPage";
import RetainingWallsPage from "@/pages/services/generated/RetainingWallsPage";
import FirePitInstallationPage from "@/pages/services/generated/FirePitInstallationPage";
import LandscapeLightingPage from "@/pages/services/generated/LandscapeLightingPage";
import SprinklerSystemInstallationPage from "@/pages/services/generated/SprinklerSystemInstallationPage";
import IrrigationRepairPage from "@/pages/services/generated/IrrigationRepairPage";
import IrrigationMaintenancePage from "@/pages/services/generated/IrrigationMaintenancePage";
import TreeTrimmingPage from "@/pages/services/generated/TreeTrimmingPage";
import LawnEdgingPage from "@/pages/services/generated/LawnEdgingPage";

// Kuna Service Pages
import LawnMowingKuna from "@/pages/services/kuna/LawnMowingKuna";
import AerationKuna from "@/pages/services/kuna/AerationKuna";
import FertilizationKuna from "@/pages/services/kuna/FertilizationKuna";
import WeedControlKuna from "@/pages/services/kuna/WeedControlKuna";
import SodInstallationKuna from "@/pages/services/kuna/SodInstallationKuna";
import PatioInstallationKuna from "@/pages/services/kuna/PatioInstallationKuna";
import HedgeTrimmingKuna from "@/pages/services/kuna/HedgeTrimmingKuna";
import SeasonalCleanupKuna from "@/pages/services/kuna/SeasonalCleanupKuna";
import SprinklerBlowoutKuna from "@/pages/services/kuna/SprinklerBlowoutKuna";
import DethatchingKuna from "@/pages/services/kuna/DethatchingKuna";
import OverseedingKuna from "@/pages/services/kuna/OverseedingKuna";
import MulchInstallationKuna from "@/pages/services/kuna/MulchInstallationKuna";
import RetainingWallsKuna from "@/pages/services/kuna/RetainingWallsKuna";
import FirePitInstallationKuna from "@/pages/services/kuna/FirePitInstallationKuna";
import LandscapeLightingKuna from "@/pages/services/kuna/LandscapeLightingKuna";
import SprinklerSystemInstallationKuna from "@/pages/services/kuna/SprinklerSystemInstallationKuna";
import IrrigationRepairKuna from "@/pages/services/kuna/IrrigationRepairKuna";
import IrrigationMaintenanceKuna from "@/pages/services/kuna/IrrigationMaintenanceKuna";
import TreeTrimmingKuna from "@/pages/services/kuna/TreeTrimmingKuna";
import LawnEdgingKuna from "@/pages/services/kuna/LawnEdgingKuna";

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
          <Route path="/services/hedge-trimming" component={HedgeTrimmingPage} />
          <Route path="/services/seasonal-cleanup" component={SeasonalCleanupPage} />
          <Route path="/services/sprinkler-blowout" component={SprinklerBlowoutPage} />
          <Route path="/services/dethatching" component={DethatchingPage} />
          <Route path="/services/overseeding" component={OverseedingPage} />
          <Route path="/services/lawn-edging" component={LawnEdgingPage} />

          {/* Individual Service Pages - Landscaping */}
          <Route path="/services/patio-installation" component={PatioInstallation} />
          <Route path="/services/paver-patio" component={PatioInstallation} />
          <Route path="/services/sod-installation" component={SodInstallationPage} />
          <Route path="/services/mulch-installation" component={MulchInstallationPage} />
          <Route path="/services/retaining-walls" component={RetainingWallsPage} />
          <Route path="/services/retaining-wall-construction" component={RetainingWallsPage} />
          <Route path="/services/pond-installation" component={PondInstallation} />
          <Route path="/services/koi-pond" component={PondInstallation} />
          <Route path="/services/fountain-installation" component={PondInstallation} />
          <Route path="/services/waterfall-installation" component={PondInstallation} />
          <Route path="/services/fence-installation" component={FenceInstallation} />
          <Route path="/services/wood-fence" component={FenceInstallation} />
          <Route path="/services/vinyl-fence" component={FenceInstallation} />
          <Route path="/services/fire-pit-installation" component={FirePitInstallationPage} />
          <Route path="/services/outdoor-fireplace" component={FirePitInstallationPage} />
          <Route path="/services/landscape-lighting" component={LandscapeLightingPage} />
          <Route path="/services/pathway-lighting" component={LandscapeLightingPage} />
          <Route path="/services/tree-trimming" component={TreeTrimmingPage} />
          <Route path="/services/tree-pruning" component={TreeTrimmingPage} />
          <Route path="/services/sprinkler-system-installation" component={SprinklerSystemInstallationPage} />
          <Route path="/services/irrigation-installation" component={SprinklerSystemInstallationPage} />
          <Route path="/services/irrigation-repair" component={IrrigationRepairPage} />
          <Route path="/services/drip-irrigation" component={SprinklerSystemInstallationPage} />
          <Route path="/services/smart-irrigation" component={SprinklerSystemInstallationPage} />
          <Route path="/services/irrigation-maintenance" component={IrrigationMaintenancePage} />

          {/* Kuna-specific service pages */}
          <Route path="/services/lawn-mowing/kuna" component={LawnMowingKuna} />
          <Route path="/services/aeration/kuna" component={AerationKuna} />
          <Route path="/services/fertilization/kuna" component={FertilizationKuna} />
          <Route path="/services/weed-control/kuna" component={WeedControlKuna} />
          <Route path="/services/sod-installation/kuna" component={SodInstallationKuna} />
          <Route path="/services/patio-installation/kuna" component={PatioInstallationKuna} />
          <Route path="/services/hedge-trimming/kuna" component={HedgeTrimmingKuna} />
          <Route path="/services/seasonal-cleanup/kuna" component={SeasonalCleanupKuna} />
          <Route path="/services/sprinkler-blowout/kuna" component={SprinklerBlowoutKuna} />
          <Route path="/services/dethatching/kuna" component={DethatchingKuna} />
          <Route path="/services/overseeding/kuna" component={OverseedingKuna} />
          <Route path="/services/mulch-installation/kuna" component={MulchInstallationKuna} />
          <Route path="/services/retaining-walls/kuna" component={RetainingWallsKuna} />
          <Route path="/services/fire-pit-installation/kuna" component={FirePitInstallationKuna} />
          <Route path="/services/landscape-lighting/kuna" component={LandscapeLightingKuna} />
          <Route path="/services/sprinkler-system-installation/kuna" component={SprinklerSystemInstallationKuna} />
          <Route path="/services/irrigation-repair/kuna" component={IrrigationRepairKuna} />
          <Route path="/services/irrigation-maintenance/kuna" component={IrrigationMaintenanceKuna} />
          <Route path="/services/tree-trimming/kuna" component={TreeTrimmingKuna} />
          <Route path="/services/lawn-edging/kuna" component={LawnEdgingKuna} />
          
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
