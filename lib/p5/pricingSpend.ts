import {randomUUID} from 'node:crypto';
import {query,transaction} from './database.ts';

export type PricingSpendStatus='reserved'|'consumed'|'released'|'unknown'|'stopped';
export type PricingSpendOutcome={
  id:string|null;
  allowanceId:string;
  operationKey:string;
  amountUsd:number;
  status:PricingSpendStatus;
  remainingUsd:number|null;
  code:string;
};

const money=(value:unknown)=>Number(value||0);
const validId=(value:unknown)=>typeof value==='string'&&/^[A-Za-z0-9._:-]{1,160}$/.test(value);
const validAmount=(value:unknown)=>Number.isFinite(Number(value))&&Number(value)>0&&Number(value)<=1000000;

export const PRICING_SPEND_SCHEMA=[
  `CREATE TABLE IF NOT EXISTS p5_estimator_pricing_allowances (
    allowance_id text PRIMARY KEY,
    budget_usd numeric(14,6) NOT NULL CHECK (budget_usd>0),
    reserved_usd numeric(14,6) NOT NULL DEFAULT 0 CHECK (reserved_usd>=0),
    consumed_usd numeric(14,6) NOT NULL DEFAULT 0 CHECK (consumed_usd>=0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS p5_estimator_pricing_spend (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    allowance_id text NOT NULL REFERENCES p5_estimator_pricing_allowances(allowance_id),
    operation_key text NOT NULL,
    amount_usd numeric(14,6) NOT NULL CHECK (amount_usd>0),
    status text NOT NULL CHECK (status IN ('reserved','consumed','released','unknown','stopped')),
    provider text,
    model text,
    scenario text,
    stage text,
    elapsed_ms integer,
    error_code text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (allowance_id,operation_key)
  )`,
  `CREATE INDEX IF NOT EXISTS p5_estimator_pricing_spend_status ON p5_estimator_pricing_spend(allowance_id,status)`
];

let schemaReady:Promise<void>|null=null;
export function ensurePricingSpendSchema(){
  if(!schemaReady)schemaReady=(async()=>{for(const statement of PRICING_SPEND_SCHEMA)await query(statement);})().catch(error=>{schemaReady=null;throw error;});
  return schemaReady;
}

export function configuredPricingAllowance(env:Readonly<Record<string,string|undefined>>=process.env){
  const allowanceId=env.P5_LIVE_PRICING_ALLOWANCE_ID;
  const budgetUsd=Number(env.P5_LIVE_PRICING_ALLOWANCE_USD);
  const reserveUsd=Number(env.P5_LIVE_PRICING_RESERVE_USD);
  if(!validId(allowanceId)||!validAmount(budgetUsd)||!validAmount(reserveUsd))throw new Error('pricing-spend-configuration-required');
  if(reserveUsd>budgetUsd)throw new Error('pricing-spend-reservation-exceeds-allowance');
  return {allowanceId:allowanceId!,budgetUsd,reserveUsd};
}

export async function reservePricingSpend(input:{
  operationKey:string; provider?:string; model?:string; scenario?:string; stage?:string;
},env:Readonly<Record<string,string|undefined>>=process.env):Promise<PricingSpendOutcome>{
  if(!/^[A-Za-z0-9._:-]{1,240}$/.test(input.operationKey))throw new Error('pricing-spend-operation-key-invalid');
  const config=configuredPricingAllowance(env);
  await ensurePricingSpendSchema();
  return transaction(async tx=>{
    await tx(`INSERT INTO p5_estimator_pricing_allowances(allowance_id,budget_usd)
      VALUES($1,$2) ON CONFLICT(allowance_id) DO NOTHING`,[config.allowanceId,config.budgetUsd]);
    const [allowance]=await tx('SELECT budget_usd AS "budgetUsd" FROM p5_estimator_pricing_allowances WHERE allowance_id=$1 FOR UPDATE',[config.allowanceId]);
    if(!allowance||Math.abs(money(allowance.budgetUsd)-config.budgetUsd)>0.000001)throw new Error('pricing-spend-allowance-mismatch');
    const existing=await tx('SELECT id FROM p5_estimator_pricing_spend WHERE allowance_id=$1 AND operation_key=$2',[config.allowanceId,input.operationKey]);
    if(!existing.length){
      const debited=await tx(`UPDATE p5_estimator_pricing_allowances SET reserved_usd=reserved_usd+$2,updated_at=now()
        WHERE allowance_id=$1 AND budget_usd-reserved_usd-consumed_usd >= $2 RETURNING allowance_id`,[config.allowanceId,config.reserveUsd]);
      await tx(`INSERT INTO p5_estimator_pricing_spend(id,allowance_id,operation_key,amount_usd,status,provider,model,scenario,stage)
        VALUES($8,$1,$2,$3,$9,$4,$5,$6,$7)`,
        [config.allowanceId,input.operationKey,config.reserveUsd,input.provider||null,input.model||null,input.scenario||null,input.stage||null,randomUUID(),debited.length?'reserved':'stopped']);
    }
    const rows=await tx(`SELECT s.id,s.allowance_id AS "allowanceId",s.operation_key AS "operationKey",s.amount_usd AS "amountUsd",
      s.status,a.budget_usd-a.reserved_usd-a.consumed_usd AS "remainingUsd",
      CASE WHEN s.status='reserved' THEN 'reserved' WHEN s.status='stopped' THEN 'allowance-exhausted' ELSE 'reused' END AS code
      FROM p5_estimator_pricing_spend s JOIN p5_estimator_pricing_allowances a ON a.allowance_id=s.allowance_id
      WHERE s.allowance_id=$1 AND s.operation_key=$2`,[config.allowanceId,input.operationKey]);
    const row=rows[0];
    if(!row)throw new Error('pricing-spend-ledger-unavailable');
    return {id:String(row.id),allowanceId:String(row.allowanceId),operationKey:String(row.operationKey),amountUsd:money(row.amountUsd),status:row.status as PricingSpendStatus,remainingUsd:row.remainingUsd==null?null:money(row.remainingUsd),code:String(row.code)};
  });
}

export async function finishPricingSpend(id:string,status:Extract<PricingSpendStatus,'consumed'|'released'|'unknown'>,details:{elapsedMs?:number;errorCode?:string}={}){
  if(!/^[0-9a-f-]{20,}$/i.test(id))throw new Error('pricing-spend-id-invalid');
  await ensurePricingSpendSchema();
  const rows=await query(`WITH changed AS (
    UPDATE p5_estimator_pricing_spend SET status=$2,elapsed_ms=$3,error_code=$4,updated_at=now()
    WHERE id=$1 AND status='reserved' RETURNING allowance_id,amount_usd
  ), adjusted AS (
    UPDATE p5_estimator_pricing_allowances a SET reserved_usd=a.reserved_usd-(SELECT amount_usd FROM changed),
      consumed_usd=a.consumed_usd+CASE WHEN $2 IN ('consumed','unknown') THEN (SELECT amount_usd FROM changed) ELSE 0 END,updated_at=now()
    WHERE a.allowance_id=(SELECT allowance_id FROM changed) RETURNING a.budget_usd-a.reserved_usd-a.consumed_usd AS remaining
  ) SELECT COALESCE((SELECT remaining FROM adjusted),NULL) AS "remainingUsd"`,[id,status,details.elapsedMs==null?null:Math.max(0,Math.round(details.elapsedMs)),details.errorCode||null]);
  return rows[0]?.remainingUsd==null?null:money(rows[0].remainingUsd);
}

/**
 * Cross the paid-request boundary conservatively. Moving the reservation to
 * unknown before the network call means a process crash can never make the
 * same operation look safe to call again. Unknown spend remains charged
 * against the allowance until an operator reconciles the provider invoice.
 */
export async function beginPricingSpend(id:string){
  if(!/^[0-9a-f-]{20,}$/i.test(id))throw new Error('pricing-spend-id-invalid');
  await ensurePricingSpendSchema();
  const rows=await query(`WITH changed AS (
    UPDATE p5_estimator_pricing_spend SET status='unknown',error_code='provider-outcome-pending',updated_at=now()
    WHERE id=$1 AND status='reserved' RETURNING allowance_id,amount_usd
  ), adjusted AS (
    UPDATE p5_estimator_pricing_allowances a SET reserved_usd=a.reserved_usd-(SELECT amount_usd FROM changed),
      consumed_usd=a.consumed_usd+(SELECT amount_usd FROM changed),updated_at=now()
    WHERE a.allowance_id=(SELECT allowance_id FROM changed) RETURNING a.budget_usd-a.reserved_usd-a.consumed_usd AS remaining
  ) SELECT COALESCE((SELECT remaining FROM adjusted),NULL) AS "remainingUsd"`,[id]);
  if(rows[0]?.remainingUsd==null)throw new Error('pricing-spend-reservation-not-active');
  return money(rows[0].remainingUsd);
}

export async function confirmPricingSpend(id:string,details:{elapsedMs?:number}={}){
  if(!/^[0-9a-f-]{20,}$/i.test(id))throw new Error('pricing-spend-id-invalid');
  await ensurePricingSpendSchema();
  const rows=await query(`UPDATE p5_estimator_pricing_spend
    SET status='consumed',elapsed_ms=$2,error_code=NULL,updated_at=now()
    WHERE id=$1 AND status='unknown' RETURNING id`,[id,details.elapsedMs==null?null:Math.max(0,Math.round(details.elapsedMs))]);
  if(!rows.length)throw new Error('pricing-spend-outcome-not-pending');
}