import { publicQa, publicText, showFoundingYear } from "@/shared/claims";

/**
 * Additive answer blocks for phase-1 pages.
 * Facts are limited to frameless (European-style) boxes, soft-close hardware,
 * a written workmanship guarantee, a free in-home design consultation,
 * founded 2020, the eight-city service area, and hundreds of finishes
 * and six door styles. Existing page claims stay in place.
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
        answer: "Hundreds of finishes and six door styles.",
      },
      {
        question: `Which cities does Boise Cabinet Co serve, including ${city}?`,
        answer: `The service area is ${AREA}.`,
      },
      {
        question: `Is workmanship covered in writing for a ${city} project?`,
        answer: "Yes. Boise Cabinet Co provides a written workmanship guarantee.",
      },
    ],
  };
}

const LOCATIONS: Record<string, Phase1Answer> = {
  kuna: cityAnswer(
    "Kuna",
    "Kitchen cabinets and kitchen pantry storage are available for Kuna homes. Boise Cabinet Co sources the cabinets and installs them after a free in-home design consultation, including upgrades for newer houses with builder-grade packages. Bonded and insured. Idaho Registered Contractor #8381215. Frameless European-style boxes and soft-close hardware are available on many packages.",
  ),
  middleton: cityAnswer(
    "Middleton",
    "Custom cabinets in Middleton, ID start with a free in-home design consultation. Boise Cabinet Co sources cabinetry and installs it for hardworking kitchens, pantries, mudrooms, and shop storage along the Highway 44 corridor. Bonded and insured. Idaho Registered Contractor #8381215. Frameless European-style boxes and soft-close hardware are available on many packages.",
  ),
  meridian: cityAnswer(
    "Meridian",
    "Custom cabinetry in Meridian, ID starts with a free in-home design consultation. Boise Cabinet Co sources cabinet packages and installs them for Meridian homes, including builder-grade kitchen upgrades in subdivisions such as Paramount and Tuscany. Bonded and insured. Idaho Registered Contractor #8381215. Frameless European-style boxes and soft-close hardware are available on many packages.",
  ),
  boise: cityAnswer(
    "Boise",
    "Custom cabinets Boise projects should feel local from the first visit. We source cabinet packages sized for your layout, then install them in Boise and across the Treasure Valley. Tell us about your kitchen or storage goals, review finishes and door styles, and leave with a planning path you can act on. Bonded and insured. Idaho Registered Contractor #8381215.",
  ),
};

const ROOMS: Record<string, Phase1Answer> = {
  kitchen: {
    heading: "What are kitchen cabinets from Boise Cabinet Co?",
    paragraph:
      "Kitchen cabinets near me should mean a local team that helps you choose, source, and install a kitchen package that fits your home. Boise Cabinet Co plans base runs, uppers, pantries, and appliance panels as one system, then sources and installs the package. Free in-home design consultation. Bonded and insured. Idaho Registered Contractor #8381215.",
    faqs: [
      {
        question: "What boxes do Boise Cabinet Co kitchen cabinets use?",
        answer: "Kitchen cabinets use frameless (European-style) boxes and soft-close hardware.",
      },
      {
        question: "Is the kitchen design consultation free?",
        answer: "Yes. Boise Cabinet Co offers a free in-home design consultation.",
      },
      {
        question: "How many kitchen finishes and door styles are available?",
        answer: "Hundreds of finishes and six door styles.",
      },
      {
        question: "Where are kitchen cabinets installed?",
        answer: `The service area is ${AREA}.`,
      },
      {
        question: "Do you build cabinets?",
        answer: "No. We source and install.",
      },
    ],
  },
  "home-office": {
    heading: "What are home office cabinets from Boise Cabinet Co?",
    paragraph:
      "Home office cabinets from Boise Cabinet Co use frameless (European-style) boxes and soft-close hardware. Founded in 2020, the company offers a free in-home design consultation, a written workmanship guarantee, and hundreds of finishes and six door styles. Installation covers Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.",
    faqs: [
      {
        question: "What construction do home office cabinets use?",
        answer: "Home office cabinets use frameless (European-style) boxes and soft-close hardware.",
      },
      {
        question: "Is a home office design consultation free?",
        answer: "Yes. Boise Cabinet Co offers a free in-home design consultation.",
      },
      {
        question: "How many finishes and door styles can a home office use?",
        answer: "Hundreds of finishes and six door styles.",
      },
      {
        question: "Where are home office cabinets installed?",
        answer: `The service area is ${AREA}.`,
      },
      {
        question: "Is home office workmanship covered in writing?",
        answer: "Yes. Boise Cabinet Co was founded in 2020 and provides a written workmanship guarantee.",
      },
    ],
  },
};

const CONTACT: Phase1Answer = {
  heading: "How do I contact Boise Cabinet Co?",
  paragraph:
    "Contact Boise Cabinet Co, founded in 2020, for a free in-home design consultation. Cabinets use frameless (European-style) boxes and soft-close hardware, with a written workmanship guarantee and hundreds of finishes and six door styles. The service area is Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.",
  faqs: [
    {
      question: "How do I request a design consultation?",
      answer: "Contact Boise Cabinet Co for a free in-home design consultation.",
    },
    {
      question: "What cabinet construction should I expect?",
      answer: "Cabinets use frameless (European-style) boxes and soft-close hardware.",
    },
    {
      question: "How many finishes and door styles are available?",
      answer: "Hundreds of finishes and six door styles.",
    },
    {
      question: "Which cities does Boise Cabinet Co serve?",
      answer: `The service area is ${AREA}.`,
    },
    {
      question: "When was Boise Cabinet Co founded, and is workmanship in writing?",
      answer: "Boise Cabinet Co was founded in 2020 and provides a written workmanship guarantee.",
    },
  ],
};

function presentPhase1(answer: Phase1Answer): Phase1Answer {
  return {
    ...answer,
    paragraph: publicText(answer.paragraph),
    faqs: publicQa(answer.faqs.map(faq => ({ ...faq, question: showFoundingYear() ? faq.question : faq.question.replace("When was Boise Cabinet Co founded, and is workmanship in writing?", "Is workmanship covered in writing?") }))),
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
