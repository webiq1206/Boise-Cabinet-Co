export const SEO_KEYWORD_MAP = {
  home: {
    primary: "remodeling contractor boise idaho",
    secondary: ["kitchen remodel boise", "bathroom remodel treasure valley", "home addition boise idaho"],
    titleTarget: "Boise Remodeling Co | Design-Build Contractor",
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
    about: { primary: "design build remodeling company boise idaho", title: "About Boise Remodeling Co" },
    contact: { primary: "contact remodeling contractor boise", title: "Contact Us | Boise Remodeling Co" },
  },
} as const;
