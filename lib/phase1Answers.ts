import { CABINET_WORKMANSHIP_WARRANTY, IDAHO_REGISTERED_CONTRACTOR, publicQa, publicText, REGISTERED_BONDED_INSURED, showFoundingYear } from "@/shared/claims";

/**
 * Additive answer blocks for phase-1 pages.
 * Aligned to P5 Family Fix Plan D1 identity and Phase 6 registration wording.
 */

export interface Phase1Faq {
  question: string;
  answer: string;
}

export interface Phase1Answer {
  heading: string;
  paragraph: string;
  faqs: Phase1Faq[];
}

const AREA = "Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell";
const IDENTITY =
  "Boise Cabinet Co designs and builds cabinets to your measurements, layout, finishes and hardware, installed by our own Treasure Valley crew.";

function cityAnswer(city: string, paragraph: string): Phase1Answer {
  return {
    heading: `What custom cabinets are available in ${city}?`,
    paragraph,
    faqs: [
      {
        question: `What cabinet boxes does Boise Cabinet Co install in ${city}?`,
        answer: `Cabinets for ${city} homes use frameless (European-style) boxes and soft-close hardware.`,
      },
      {
        question: `Is a design consultation free in ${city}?`,
        answer: "Yes. Boise Cabinet Co offers a free in-home design consultation.",
      },
      {
        question: `How many finishes and door styles are available for ${city} projects?`,
        answer: "299 finishes and six door styles, including Shaker and slab.",
      },
      {
        question: `Which cities does Boise Cabinet Co serve, including ${city}?`,
        answer: `The service area is ${AREA}.`,
      },
      {
        question: `Is workmanship covered in writing for a ${city} project?`,
        answer: `Yes. ${CABINET_WORKMANSHIP_WARRANTY}. Warranty claims are handled by us.`,
      },
    ],
  };
}

const LOCATIONS: Record<string, Phase1Answer> = {
  kuna: cityAnswer(
    "Kuna",
    `Kitchen cabinets and pantry storage are available for Kuna homes. ${IDENTITY} Free in-home design consultation. ${REGISTERED_BONDED_INSURED}. Frameless European-style boxes and soft-close hardware are available on many packages.`,
  ),
  middleton: cityAnswer(
    "Middleton",
    `Custom cabinets in Middleton, ID start with a free in-home design consultation. ${IDENTITY} Hardworking kitchens, pantries, mudrooms, and shop storage along the Highway 44 corridor. ${REGISTERED_BONDED_INSURED}.`,
  ),
  meridian: cityAnswer(
    "Meridian",
    `Custom cabinetry in Meridian, ID starts with a free in-home design consultation. ${IDENTITY} Builder-grade kitchen upgrades in subdivisions such as Paramount and Tuscany are a common request. ${REGISTERED_BONDED_INSURED}.`,
  ),
  boise: cityAnswer(
    "Boise",
    `Custom cabinets in Boise should feel local from the first visit. ${IDENTITY} Discuss your storage goals, finishes, door styles, and next steps. ${REGISTERED_BONDED_INSURED}.`,
  ),
};

const ROOMS: Record<string, Phase1Answer> = {
  kitchen: {
    heading: "Kitchen cabinets in Boise, Idaho",
    paragraph:
      "Kitchen cabinets in Boise, designed around how you cook. Boise Cabinet Co plans coordinated base runs, uppers, pantries, and appliance panels, builds to your layout, and installs with our own crew. Free in-home design consultation. Most full kitchens we install plan between $15,000 and $45,000+ installed. " + REGISTERED_BONDED_INSURED + ".",
    faqs: [
      {
        question: "What boxes do Boise Cabinet Co kitchen cabinets use?",
        answer: "Kitchen cabinets offer frameless and soft-close options. Box material is published per line.",
      },
      {
        question: "Is the kitchen design consultation free?",
        answer: "Yes. Boise Cabinet Co offers a free in-home design consultation.",
      },
      {
        question: "How many kitchen finishes and door styles are available?",
        answer: "299 finishes and six door styles, including Shaker and slab.",
      },
      {
        question: "Where are kitchen cabinets installed?",
        answer: `The service area is ${AREA}.`,
      },
      {
        question: "Do you build cabinets?",
        answer: IDENTITY,
      },
    ],
  },
  "home-office": {
    heading: "What are home office cabinets from Boise Cabinet Co?",
    paragraph:
      `Office cabinets by Boise Cabinet Co offer frameless and soft-close options. ${IDENTITY} Free in-home design consultation, ${CABINET_WORKMANSHIP_WARRANTY.toLowerCase()}, and 299 finishes with six door styles. Installation covers ${AREA}.`,
    faqs: [
      {
        question: "What construction do home office cabinets use?",
        answer: "Home office cabinets offer frameless and soft-close options.",
      },
      {
        question: "Is a home office design consultation free?",
        answer: "Yes. Boise Cabinet Co offers a free in-home design consultation.",
      },
      {
        question: "How many finishes and door styles can a home office use?",
        answer: "299 finishes and six door styles, including Shaker and slab.",
      },
      {
        question: "Where are home office cabinets installed?",
        answer: `The service area is ${AREA}.`,
      },
      {
        question: "Is home office workmanship covered in writing?",
        answer: `Yes. ${CABINET_WORKMANSHIP_WARRANTY}.`,
      },
    ],
  },
};

/** K-13: contact page does not ask "How do I contact" (the page is the answer). */
const CONTACT: Phase1Answer = {
  heading: "What happens when you reach out?",
  paragraph:
    `Call, text, or send the form. We reply within one business day to schedule a free in-home design consultation. ${IDENTITY} ${IDAHO_REGISTERED_CONTRACTOR}. Service area: ${AREA}.`,
  faqs: [
    {
      question: "How do I request a design consultation?",
      answer: "Call or text (208) 477-1169, or send the contact form. We reply within one business day.",
    },
    {
      question: "What cabinet construction should I expect?",
      answer: "Cabinets offer frameless and soft-close options. Box and finish specifications are published per line.",
    },
    {
      question: "How many finishes and door styles are available?",
      answer: "299 finishes and six door styles, including Shaker and slab.",
    },
    {
      question: "Which cities does Boise Cabinet Co serve?",
      answer: `The service area is ${AREA}.`,
    },
    {
      question: "Is workmanship covered in writing?",
      answer: `Yes. ${CABINET_WORKMANSHIP_WARRANTY}. Warranty claims are handled by us.`,
    },
  ],
};

function presentPhase1(answer: Phase1Answer): Phase1Answer {
  return {
    ...answer,
    paragraph: publicText(answer.paragraph),
    faqs: publicQa(answer.faqs),
  };
}

export function phase1LocationAnswer(slug: string): Phase1Answer | undefined {
  const answer = LOCATIONS[slug];
  return answer ? presentPhase1(answer) : undefined;
}

export function phase1RoomAnswer(slug: string): Phase1Answer | undefined {
  const answer = ROOMS[slug];
  return answer ? presentPhase1(answer) : undefined;
}

export function phase1ContactAnswer(): Phase1Answer {
  return presentPhase1(CONTACT);
}

export const PHASE1_ANSWERS = [...Object.values(LOCATIONS), ...Object.values(ROOMS), CONTACT].map(presentPhase1);

// Keep showFoundingYear import used for future founding sentences.
void showFoundingYear;
