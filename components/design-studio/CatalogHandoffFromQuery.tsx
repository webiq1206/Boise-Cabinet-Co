"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  CABINET_PRODUCT_BY_SLUG,
  getCollectionBySlug,
  getDoorStyleBySlug,
  getFinishBySlug,
  resolveDoorStyleSlug,
  resolveFinishSlug,
} from "@/shared/catalog";
import { useDesignStudio } from "./DesignStudioProvider";
import type { DesignState } from "./DesignStudioProvider";

/**
 * Hydrates the Design Studio from deep-link query params so catalog pages and the
 * guided finder can hand a homeowner straight into a pre-filled design:
 *   ?doorStyle=  ?finish=  ?collection=  ?product=
 * Runs once on mount; never overrides a value the visitor has already chosen.
 */
function CatalogHandoffInner() {
  const params = useSearchParams();
  const { design, updateDesign } = useDesignStudio();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;

    const patch: Partial<DesignState> = {};

    const doorStyleParam = params.get("doorStyle");
    if (doorStyleParam && !design.doorStyle) {
      const slug = resolveDoorStyleSlug(doorStyleParam);
      if (getDoorStyleBySlug(slug)) patch.doorStyle = slug;
    }

    const finishParam = params.get("finish");
    if (finishParam && !design.finish) {
      const slug = resolveFinishSlug(finishParam);
      if (getFinishBySlug(slug) ?? getFinishBySlug(finishParam)) {
        patch.finish = getFinishBySlug(slug) ? slug : finishParam;
      }
    }

    const collectionParam = params.get("collection");
    if (collectionParam && !design.collection) {
      const collection = getCollectionBySlug(collectionParam);
      if (collection) patch.collection = collection.slug;
    }

    const productParam = params.get("product");
    if (productParam && design.lineItemSlugs.length === 0) {
      const product = CABINET_PRODUCT_BY_SLUG[productParam];
      if (product) {
        patch.lineItemSlugs = [product.slug];
        // Seed the room from the product's typical room when none is chosen yet.
        if (!design.roomType && !params.get("roomType")) {
          patch.roomType = product.category === "vanity" ? "bathroom" : "kitchen";
        }
      }
    }

    if (Object.keys(patch).length > 0) {
      updateDesign(patch);
    }
  }, [params, design.doorStyle, design.finish, design.collection, design.roomType, design.lineItemSlugs.length, updateDesign]);

  return null;
}

export function CatalogHandoffFromQuery() {
  return (
    <Suspense fallback={null}>
      <CatalogHandoffInner />
    </Suspense>
  );
}
