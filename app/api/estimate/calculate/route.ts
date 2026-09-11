import {NextResponse} from 'next/server';
/** The retired calculator has no active UI consumers. All pricing uses reviewed scope and approved costs. */
export async function POST(_request:Request){return NextResponse.json({message:'Continue your project in the estimator. Your saved scope and files stay with it.',nextStep:'/estimate'},{status:410});}
