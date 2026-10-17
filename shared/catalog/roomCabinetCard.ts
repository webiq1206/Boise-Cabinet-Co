/**
 * Fields CabinetOptionsSelector renders for one room-page cabinet card.
 * The room page maps catalog products to this shape on the server so the
 * client payload does not include the rest of the catalog record.
 */
export const ROOM_CABINET_CARD_FIELDS = [
  "slug",
  "name",
  "category",
  "need",
  "dimensions",
  "diagram",
] as const;

export type RoomCabinetCardField = (typeof ROOM_CABINET_CARD_FIELDS)[number];

export type RoomCabinetCard = Record<RoomCabinetCardField, string>;
