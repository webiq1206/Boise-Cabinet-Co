import { formatCabinetDimensions } from "./index";
import { getCabinetNeedLabel } from "./cabinetLabels";
import { getProductImages } from "./entityImages";
import type { RoomCabinetCard } from "./roomCabinetCard";
import type { CabinetProduct } from "./types";

/** Server-side map of a catalog product to the fields the room selector renders. */
export function toRoomCabinetCard(product: CabinetProduct): RoomCabinetCard {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    need: getCabinetNeedLabel(product),
    dimensions: formatCabinetDimensions(product),
    diagram: getProductImages(product).diagram,
  };
}
