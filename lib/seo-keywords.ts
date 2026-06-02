export const SEO_KEYWORD_MAP = {
  home: {
    primary: "custom cabinets boise idaho",
    secondary: ["kitchen cabinets boise", "bathroom vanity treasure valley", "custom cabinetry boise idaho"],
    titleTarget: "Boise Cabinet Co | Custom Cabinets Idaho",
  },
  servicePages: {
    primary: "{service} boise idaho",
    secondary: ["{service} treasure valley", "{service} near me idaho", "professional {service} boise"],
    titlePattern: "{Service Name} in Boise & Treasure Valley",
  },
  cityServicePages: {
    primary: "{service} {city} idaho",
    secondary: ["{service} near {city}", "{service} {city} id", "professional {service} {city}"],
    titlePattern: "{Service} in {City}, ID",
  },
  areaPages: {
    primary: "custom cabinets {city} idaho",
    secondary: ["kitchen cabinets {city}", "cabinet installation {city}", "bathroom vanity {city} idaho"],
    titlePattern: "Custom Cabinets in {City}, Idaho",
  },
  blogPages: {
    primary: "{topic} custom cabinets idaho",
    secondary: ["{topic} treasure valley", "{topic} boise cabinet planning"],
    titlePattern: "{Blog Title}",
  },
  staticPages: {
    about: { primary: "custom cabinet company boise idaho", title: "About Boise Cabinet Co" },
    contact: { primary: "contact cabinet company boise", title: "Contact Us | Boise Cabinet Co" },
  },
} as const;
