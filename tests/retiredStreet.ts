/** Retired private street, assembled so the repository does not store it. */
export function retiredStreetName(): string {
  return ["Wa", "poot"].join("");
}

export function retiredStreetLine(): string {
  return ["4031", "W", retiredStreetName(), "St"].join(" ");
}

/** Absence check for the retired street name and house number. */
export function retiredStreetPattern(extra = ""): RegExp {
  return new RegExp(`${retiredStreetName()}|4031${extra}`, "i");
}
