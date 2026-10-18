import { publishDeep } from "@/shared/trustFlags";

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
        answer: "Yes. Boise Cabinet Co was founded in 2020 and provides a written workmanship guarantee.",
      },
    ],
  };
}

const LOCATIONS: Record<string, Phase1Answer> = {
  kuna: cityAnswer(
    "Kuna",
    "Boise Cabinet Co designs custom cabinets for Kuna homes with frameless (European-style) boxes and soft-close hardware. Founded in 2020, the company offers a free in-home design consultation, a written workmanship guarantee, and hundreds of finishes and six door styles. Service covers Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.",
  ),
  middleton: cityAnswer(
    "Middleton",
    "Custom cabinets in Middleton start with frameless (European-style) boxes and soft-close hardware from Boise Cabinet Co, founded in 2020. Homeowners get a free in-home design consultation, a written workmanship guarantee, and hundreds of finishes and six door styles. The service area is Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.",
  ),
  meridian: cityAnswer(
    "Meridian",
    "Meridian cabinet projects from Boise Cabinet Co use frameless (European-style) boxes and soft-close hardware. The company, founded in 2020, includes a free in-home design consultation and a written workmanship guarantee. Choose from hundreds of finishes and six door styles. Coverage includes Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.",
  ),
  boise: cityAnswer(
    "Boise",
    "Boise homeowners can order custom cabinets with frameless (European-style) boxes and soft-close hardware from Boise Cabinet Co, founded in 2020. Every project includes a free in-home design consultation and a written workmanship guarantee, plus hundreds of finishes and six door styles. The company serves Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.",
  ),
};

const ROOMS: Record<string, Phase1Answer> = {
  kitchen: {
    heading: "What are kitchen cabinets from Boise Cabinet Co?",
    paragraph:
      "Kitchen cabinets from Boise Cabinet Co are built with frameless (European-style) boxes and soft-close hardware. Founded in 2020, the shop includes a free in-home design consultation and a written workmanship guarantee. Hundreds of finishes and six door styles are available across Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.",
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
        question: "Is kitchen workmanship covered in writing?",
        answer: "Yes. Boise Cabinet Co was founded in 2020 and provides a written workmanship guarantee.",
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

export function phase1LocationAnswer(slug: string): Phase1Answer | undefined {
  const answer = LOCATIONS[slug];
  return answer ? publishDeep(answer) : undefined;
}

export function phase1RoomAnswer(slug: string): Phase1Answer | undefined {
  const answer = ROOMS[slug];
  return answer ? publishDeep(answer) : undefined;
}

export function phase1ContactAnswer(): Phase1Answer {
  return publishDeep(CONTACT);
}

export const PHASE1_ANSWERS = [...Object.values(LOCATIONS), ...Object.values(ROOMS), CONTACT].map((answer) => publishDeep(answer));
