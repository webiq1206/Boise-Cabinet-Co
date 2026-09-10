import {requireRole} from "../auth/server";
import {DraftError} from "./store";
export async function requireEstimatorAdmin(){
  const result=await requireRole("admin");
  if(result.error||!result.user)throw new DraftError("Administrator sign-in is required.",403);
  return {id:String(result.user.id),email:String(result.user.email||"").toLowerCase()};
}
