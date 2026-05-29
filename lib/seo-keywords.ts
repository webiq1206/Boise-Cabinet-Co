export const SEO_KEYWORD_MAP = {
  home: {
    primary: "lawn care kuna idaho",
    secondary: ["lawn care boise", "landscaping treasure valley", "lawn mowing kuna"],
    titleTarget: "Boise Remodeling Co Idaho | Free Quotes",
  },
  servicePages: {
    primary: "{service} in kuna boise idaho",
    secondary: ["{service} treasure valley", "{service} near me idaho", "professional {service} kuna"],
    titlePattern: "{Service Name} in Kuna & Boise",
  },
  cityServicePages: {
    primary: "{service} {city} idaho",
    secondary: ["{service} near {city}", "{service} {city} id", "professional {service} {city}"],
    titlePattern: "{Service} in {City}, ID",
  },
  areaPages: {
    primary: "lawn care {city} idaho",
    secondary: ["landscaping {city} id", "lawn mowing {city}", "yard care {city} idaho"],
    titlePattern: "Lawn Care in {City}, Idaho",
  },
  blogPages: {
    primary: "{topic} lawn care idaho",
    secondary: ["{topic} treasure valley", "{topic} boise area"],
    titlePattern: "{Blog Title}",
  },
  staticPages: {
    pricing: { primary: "lawn care pricing kuna idaho", title: "Lawn Care Pricing in Idaho" },
    about: { primary: "lawn care company kuna idaho", title: "About Boise Remodeling Co Idaho" },
    contact: { primary: "contact lawn care kuna", title: "Contact Us in Kuna, Idaho" },
    commercial: { primary: "commercial lawn care kuna idaho", title: "Commercial Lawn Care Idaho" },
    faq: { primary: "lawn care questions kuna idaho", title: "Lawn Care FAQ for Idaho" },
    seasonalGuide: { primary: "idaho lawn care calendar zone 6b", title: "Idaho Lawn Care Calendar" },
  },
} as const;
