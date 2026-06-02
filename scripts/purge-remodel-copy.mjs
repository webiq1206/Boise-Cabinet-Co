/**
 * Replaces common remodeling-era phrases in shared/content and related copy files.
 * Run: node scripts/purge-remodel-copy.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const FILES = [
  "shared/content",
  "shared/contentHubs.ts",
  "shared/guideContent.ts",
  "shared/resourcePdfContent.ts",
  "shared/testimonialsData.ts",
  "app/resources",
  "components/marketing/GuidePageLayout.tsx",
  "components/seo",
].flatMap((p) => {
  const full = path.join(root, p);
  if (!fs.existsSync(full)) return [];
  const st = fs.statSync(full);
  if (st.isDirectory()) {
    const out = [];
    const walk = (dir) => {
      for (const n of fs.readdirSync(dir)) {
        const f = path.join(dir, n);
        if (fs.statSync(f).isDirectory()) walk(f);
        else if (/\.(ts|tsx)$/.test(n)) out.push(f);
      }
    };
    walk(full);
    return out;
  }
  return [full];
});

const REPLACEMENTS = [
  [/design-build/gi, "cabinet design and installation"],
  [/Design-build/g, "Cabinet design"],
  [/remodeling contractor/gi, "cabinet company"],
  [/remodeling contractors/gi, "cabinet companies"],
  [/remodeling company/gi, "cabinet company"],
  [/home remodeling/gi, "custom cabinetry"],
  [/home renovation/gi, "cabinet upgrade"],
  [/whole-home remodel/gi, "whole-home cabinetry"],
  [/Whole-Home Remodel/g, "Whole-Home Cabinetry"],
  [/kitchen remodel/gi, "kitchen cabinets"],
  [/Kitchen Remodel/g, "Kitchen Cabinets"],
  [/bathroom remodel/gi, "bathroom vanities"],
  [/Bathroom Remodel/g, "Bathroom Vanities"],
  [/room addition/gi, "built-in storage"],
  [/Room Addition/g, "Built-In Storage"],
  [/full renovation/gi, "full cabinet program"],
  [/during construction/gi, "during installation"],
  [/During construction/g, "During installation"],
  [/before construction/gi, "before fabrication"],
  [/Before construction/g, "Before fabrication"],
  [/construction contract/gi, "cabinet contract"],
  [/general contractor/gi, "cabinet installer"],
  [/remodeling process/gi, "cabinet project process"],
  [/remodeling guide/gi, "cabinet planning guide"],
  [/remodeling-costs/g, "cabinet-costs"],
  [/remodeling-roi/g, "cabinet-roi"],
  [/kitchen-remodeling/g, "kitchen-cabinets"],
  [/bathroom-remodeling/g, "bathroom-vanities"],
  [/whole-home-remodeling/g, "whole-home-cabinetry"],
  [/remodeling-process/g, "cabinet-project-process"],
  [/contractor-selection/g, "choosing-cabinet-company"],
  [/remodeling-roi/g, "cabinet-roi"],
  [/boise-remodeling-cost-guide/g, "boise-cabinet-cost-guide"],
  [/boise-kitchen-remodeling-guide/g, "boise-kitchen-cabinet-guide"],
  [/boise-bathroom-remodeling-guide/g, "boise-bathroom-vanity-guide"],
  [/boise-remodeling-process-guide/g, "boise-cabinet-project-process-guide"],
  [/treasure-valley-remodeling-guide/g, "treasure-valley-cabinet-guide"],
  [/choose-remodeling-contractor/g, "choose-cabinet-company"],
  [/remodeling-contractor/g, "cabinet company"],
  [/Do you remodel/g, "Do you install cabinets"],
  [/remodel homes/g, "install cabinets"],
  [/remodel cost/g, "cabinet project cost"],
  [/remodels are/g, "cabinet projects are"],
  [/local remodels/g, "local cabinet projects"],
  [/next renovation/g, "next cabinet project"],
  [/remodel planning/g, "cabinet planning"],
  [/remodel budget/g, "cabinet budget"],
  [/remodeling costs/g, "cabinet costs"],
  [/remodeling budget/g, "cabinet budget"],
  [/luxury remodel/g, "luxury cabinet program"],
  [/remodel price/g, "cabinet project price"],
  [/remodeling budget framework/g, "cabinet budget framework"],
  [/renovation loans/g, "project financing"],
  [/construction milestones/g, "installation milestones"],
  [/indoor remodels/g, "indoor cabinet projects"],
  [/Pre-sale remodels/g, "Pre-sale cabinet upgrades"],
  [/residential remodels/g, "residential cabinet projects"],
  [/interior remodels/g, "interior cabinet upgrades"],
  [/Exterior remodels/g, "Exterior updates"],
  [/remodels should/g, "cabinet upgrades should"],
  [/remodels with/g, "cabinet projects with"],
  [/metro remodels/g, "metro cabinet projects"],
  [/Remodel Budget/g, "Cabinet Budget"],
  [/Remodel Permits/g, "Cabinet Permits"],
  [/remodel timeline/g, "project timeline"],
  [/Boise Remodeling Co/g, "Boise Cabinet Co"],
  [/boiseremodeling\.co/g, "boisecabinet.co"],
];

let changed = 0;
for (const file of FILES) {
  let text = fs.readFileSync(file, "utf8");
  const orig = text;
  for (const [re, rep] of REPLACEMENTS) {
    text = text.replace(re, rep);
  }
  if (text !== orig) {
    fs.writeFileSync(file, text);
    changed++;
  }
}
console.log(`Updated ${changed} files.`);
