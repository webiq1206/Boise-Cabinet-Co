import type { CabinetCollection } from "@/shared/catalog";

export interface CollectionFaq {
  question: string;
  answer: string;
}

export function getCollectionFaqs(collection: CabinetCollection): CollectionFaq[] {
  return [
    {
      question: `What is the typical lead time for ${collection.name}?`,
      answer: "Your lead time is confirmed with your quote. Timelines begin after you approve shop drawings and we receive your deposit, exact dates depend on finish selections and project scope.",
    },
    {
      question: `Who is ${collection.name} best suited for?`,
      answer: collection.description.slice(0, 280) + (collection.description.length > 280 ? "…" : ""),
    },
    {
      question: "Does Boise Cabinet Co include installation?",
      answer:
        "Yes. Every collection includes professional installation by our Treasure Valley crew and our written workmanship guarantee, with soft-close options. We coordinate with your project timeline when other trades are on site.",
    },
    {
      question: "Can I see finishes before ordering?",
      answer:
        "We provide finish samples during your design consultation so you can evaluate color and sheen in your home's natural light before production begins.",
    },
    {
      question: "How do I get a quote for this collection?",
      answer:
        "Browse layouts and finishes in the catalog, or schedule an in-home consultation. We produce drawings and a written scope with line-item pricing before any cabinets are ordered.",
    },
  ];
}
