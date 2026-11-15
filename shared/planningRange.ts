import {z} from 'zod';
import {roomSelectionsSchema,MAX_ROOMS,PROJECT_TYPE_VALUES} from './estimateInputSchema';

/** Public selections and customer display fields only. No code, rate or finance input. */
export const planningRangeRequestSchema=z.object({
  rooms:z.array(roomSelectionsSchema.strict()).min(1).max(MAX_ROOMS),
  selectionsMade:z.array(z.number().int().min(0).max(10)).max(MAX_ROOMS).optional(),
}).strict().refine(value=>!value.selectionsMade||value.selectionsMade.length===value.rooms.length,'Selection counts must match rooms');
const price=z.number().int().positive().max(5_000_000);
const text=z.string().max(1200);
const confidence=z.enum(['starting','refined','detailed']);
const room=z.object({project:z.enum(PROJECT_TYPE_VALUES),projectLabel:text,sizeLabel:text,scopeSummary:text,priceLow:price,priceHigh:price}).strict();
const single=z.object({priceLow:price,priceHigh:price,roi:z.number().finite().min(0).max(100),included:z.array(text).max(50),confidence,confidenceLabel:text,confidencePercent:z.number().int().min(0).max(100),scopeSummary:text,selectionsMade:z.number().int().min(0).max(10),totalSteps:z.number().int().min(0).max(20)}).strict();
const combined=z.object({priceLow:price,priceHigh:price,rooms:z.array(room).min(1).max(MAX_ROOMS),included:z.array(text).max(100),confidence,confidenceLabel:text,confidencePercent:z.number().int().min(0).max(100)}).strict();
export const planningRangeResponseSchema=z.object({combined:combined.nullable(),singles:z.array(single.nullable()).min(1).max(MAX_ROOMS)}).strict();
export type PublicPlanningRange=z.infer<typeof planningRangeResponseSchema>;
