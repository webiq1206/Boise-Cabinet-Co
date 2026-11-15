import {calculateCombinedEstimate} from './estimateEngine.ts';
import {buildEstimateRecord as publicRecord,type BuildEstimateRecordInput} from '../shared/estimateRecord.ts';
export * from '../shared/estimateRecord.ts';
export function buildEstimateRecord(input:BuildEstimateRecordInput){return publicRecord(input,calculateCombinedEstimate(input.rooms));}
