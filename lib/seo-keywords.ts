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
    primary: "remodeling contractor {city} idaho",
    secondary: ["home renovation {city} id", "kitchen remodel {city}", "bathroom remodel {city} idaho"],
    titlePattern: "Remodeling Contractor in {City}, Idaho",
  },
  blogPages: {
    primary: "{topic} home remodeling idaho",
    secondary: ["{topic} treasure valley", "{topic} boise area"],
    titlePattern: "{Blog Title}",
  },
  staticPages: {
    about: { primary: "custom cabinet company boise idaho", title: "About Boise Cabinet Co" },
    contact: { primary: "contact cabinet company boise", title: "Contact Us | Boise Cabinet Co" },
  },
} as const;
