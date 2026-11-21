import { HomeDoorPicker } from '@/components/approved/HomeDoorPicker';
import { versionedSrc } from '@/lib/images/imageVersion';
import type { VisualizerFinish, VisualizerStyle } from '@/shared/doorVisualizerModel';

/**
 * Homepage "Find your point of view". The page resolves every catalog finish
 * and door style on the server (resolveHomePicker() in shared/homeFinishes.ts)
 * and this hands them to the picker with their URLs already versioned, so the
 * browser never loads the finish library itself. The picker is
 * components/approved/HomeDoorPicker.tsx; the layout is app/finish-picker.css.
 */
export function FinishPicker({ finishes, styles }: { finishes: readonly VisualizerFinish[]; styles: readonly VisualizerStyle[] }) {
  if (!finishes.length || !styles.length) return null;
  const views = finishes.map((finish) => ({ ...finish, imageUrl: versionedSrc(finish.image), chipUrl: versionedSrc(finish.chip) }));
  return <HomeDoorPicker finishes={views} styles={styles} />;
}
