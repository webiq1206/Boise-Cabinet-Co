import { db } from "../db";
import { sql } from "drizzle-orm";
import { boundedStatement } from "./databaseTimeout.ts";
type Query = (statement:string,values?:unknown[])=>Promise<Record<string,any>[]>;
async function execute(executor:any,statement:string,values:unknown[]=[]):Promise<Record<string,any>[]> {
  const parts = statement.split(/\$(\d+)/g);
  const chunks = parts.map((part, index) => index % 2 ? sql`${values[Number(part)-1]}` : sql.raw(part));
  const result = await boundedStatement(()=>executor.execute(sql.join(chunks,sql.raw(""))),statement);
  return Array.isArray(result) ? result : (result as {rows:Record<string,any>[]}).rows;
}
/** Uses this site's existing database driver with parameterized values. */
export async function query(statement: string, values: unknown[] = []): Promise<Record<string, any>[]> {
  if (!db) throw new Error("persistence-unconfigured");
  return execute(db,statement,values);
}
/** Keep multi-statement safety decisions on one database connection. */
export async function transaction<T>(run:(query:Query)=>Promise<T>):Promise<T>{
  if(!db)throw new Error("persistence-unconfigured");
  return db.transaction(async tx=>run((statement,values=[])=>execute(tx,statement,values)));
}
