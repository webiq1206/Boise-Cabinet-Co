import {calculateEstimate} from './estimateEngine.ts';
import {designToEstimateSelections,countDesignSelections,getDesignEstimate as formatDesignEstimate,type DesignEstimateOptions} from '../lib/design/designToEstimate.ts';
import type {DesignState} from '../components/design-studio/DesignStudioProvider';
/** Server counterpart of the former synchronous design calculation. */
export function getDesignEstimate(design:DesignState,opts:DesignEstimateOptions={}){
 return formatDesignEstimate(design,opts,calculateEstimate(designToEstimateSelections(design,opts),countDesignSelections(design)));
}
