/** One stable end-of-page reservation shared by mounted pinned action bars. */
export interface PageClearanceLease {
  update(height: number): void;
  release(): void;
}

type ClearanceStyle = Pick<CSSStyleDeclaration,
  'getPropertyValue' | 'getPropertyPriority' | 'setProperty' | 'removeProperty'>;
const PROPERTY = '--wizard-bar-clearance';

export function createPageClearanceRegistry(style: ClearanceStyle, computedValue: () => string) {
  const owners = new Set<object>();
  let heldHeight = 0;
  let originalValue = '';
  let originalPriority = '';
  let baseline = '';
  const write = (value: string, priority: string) => {
    if (style.getPropertyValue(PROPERTY) !== value || style.getPropertyPriority(PROPERTY) !== priority) {
      style.setProperty(PROPERTY, value, priority);
    }
  };
  return {
    reserve(): PageClearanceLease {
      if (!owners.size) {
        originalValue = style.getPropertyValue(PROPERTY);
        originalPriority = style.getPropertyPriority(PROPERTY);
        baseline = computedValue().trim();
      }
      const owner = {};
      owners.add(owner);
      let released = false;
      return {
        update(height) {
          if (released || !Number.isFinite(height) || height <= heldHeight) return;
          heldHeight = Math.ceil(height);
          // Never shrink the document during a dock/inline handoff, shorter
          // measurement or sibling departure. Clear it when the pinned flow ends.
          const value = baseline && baseline !== '0' && baseline !== '0px'
            ? `max(${baseline}, ${heldHeight}px)` : `${heldHeight}px`;
          write(value, originalPriority);
        },
        release() {
          if (released) return;
          released = true;
          owners.delete(owner);
          if (owners.size) return;
          heldHeight = 0;
          if (originalValue) write(originalValue, originalPriority);
          else style.removeProperty(PROPERTY);
        },
      };
    },
  };
}

const registries = new WeakMap<HTMLElement, ReturnType<typeof createPageClearanceRegistry>>();
export function reservePageClearance(): PageClearanceLease {
  if (typeof document === 'undefined') return {update() {}, release() {}};
  const root = document.documentElement;
  let registry = registries.get(root);
  if (!registry) {
    registry = createPageClearanceRegistry(root.style,
      () => getComputedStyle(root).getPropertyValue(PROPERTY));
    registries.set(root, registry);
  }
  return registry.reserve();
}
