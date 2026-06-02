import type { CabinetCollection } from "@/shared/catalog";

export interface CollectionFaq {
  question: string;
  answer: string;
}

export function getCollectionFaqs(collection: CabinetCollection): CollectionFaq[] {
  return [
    {
      question: `What is the typical lead time for ${collection.name}?`,
      answer: `${collection.name} cabinets typically ship in ${collection.leadTime}. Timelines begin after you approve shop drawings and we receive your deposit, exact dates depend on finish selections and project scope.`,
    },
    {
      question: `Who is ${collection.name} best suited for?`,
      answer: collection.description.slice(0, 280) + (collection.description.length > 280 ? "…" : ""),
    },
    {
      question: "Does Boise Cabinet Co include installation?",
      answer:
        "Yes. Every collection includes professional installation by our Treasure Valley crew, soft-close hinges on doors, and our written workmanship guarantee. We coordinate with your project timeline when other trades are on site.",
    },
    {
      question: "Can I see finishes before ordering?",
      answer:
        collection.id === "reserve"
          ? "Reserve orders include a complimentary finish sample kit for Reserve-exclusive palettes. All collections support in-home or showroom sample review during your design consultation."
          : "We provide finish samples during your design consultation so you can evaluate color and sheen in your home's natural light before production begins.",
    },
    {
      question: "How do I get a quote for this collection?",
      answer:
        "Start in our Design Studio to explore layouts and finishes, or schedule an in-home consultation. We'll produce shop drawings and a written scope with line-item pricing before any cabinets are built.",
    },
  ];
}
