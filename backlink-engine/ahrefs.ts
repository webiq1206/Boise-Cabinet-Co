/**
 * Thin Ahrefs API v3 client. In the deployed Replit cron cycles this reads
 * AHREFS_API_KEY from the environment (Replit Secrets). The request shapes here
 * mirror the exact endpoints validated against the live API.
 *
 * Docs: https://docs.ahrefs.com/docs/api/reference/introduction
 */

import type { CandidateMetrics } from "./types";

const BASE = "https://api.ahrefs.com/v3";

export class AhrefsClient {
  private key: string;

  constructor(key = process.env.AHREFS_API_KEY ?? "") {
    if (!key) {
      throw new Error(
        "AHREFS_API_KEY is not set. Add it to Replit Secrets (or your env) before running a cycle.",
      );
    }
    this.key = key;
  }

  private async get(path: string, params: Record<string, string>): Promise<any> {
    const url = new URL(`${BASE}${path}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.key}`, Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Ahrefs ${path} ${res.status}: ${await res.text()}`);
    }
    return res.json();
  }

  private async post(path: string, body: unknown): Promise<any> {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Ahrefs ${path} ${res.status}: ${await res.text()}`);
    }
    return res.json();
  }

  /** Authority snapshot for one or many domains (DR, refdomains, traffic). */
  async batchAnalysis(domains: string[]) {
    const data = await this.post("/batch-analysis/batch-analysis", {
      select: ["url", "domain_rating", "refdomains", "refdomains_dofollow", "backlinks", "org_traffic"],
      order_by: ["domain_rating:desc"],
      targets: domains.map((url) => ({ url, mode: "subdomains", protocol: "both" })),
    });
    return (data.targets ?? []) as {
      url: string;
      domain_rating: number;
      refdomains: number;
      refdomains_dofollow: number;
      backlinks: number;
      org_traffic: number;
    }[];
  }

  /**
   * Referring domains for a target, pre-filtered server-side to non-spam
   * dofollow links above a DR floor to conserve API units.
   */
  async referringDomains(target: string, minDr = 10, limit = 100): Promise<CandidateMetrics[]> {
    const where = JSON.stringify({
      and: [
        { field: "is_spam", is: ["eq", false] },
        { field: "dofollow_links", is: ["gte", 1] },
        { field: "domain_rating", is: ["gte", minDr] },
      ],
    });
    const data = await this.get("/site-explorer/refdomains", {
      target,
      mode: "subdomains",
      select: "domain,domain_rating,traffic_domain,dofollow_links,links_to_target,is_spam,first_seen,positions_source_domain",
      where,
      order_by: "domain_rating:desc",
      limit: String(limit),
      output: "json",
    });
    return (data.refdomains ?? []).map(mapRefDomain);
  }

  /** Every non-spam referring domain to a target (for our own gained/lost tracking). */
  async allReferringDomains(target: string, limit = 200): Promise<string[]> {
    const data = await this.get("/site-explorer/refdomains", {
      target,
      mode: "subdomains",
      select: "domain",
      where: JSON.stringify({ and: [{ field: "is_spam", is: ["eq", false] }] }),
      order_by: "domain_rating:desc",
      limit: String(limit),
      output: "json",
    });
    return (data.refdomains ?? []).map((r: any) => (r.domain ?? "").toLowerCase()).filter(Boolean);
  }

  /** Broken backlinks pointing at a competitor — replaceable-link opportunities. */
  async brokenBacklinks(target: string, limit = 50): Promise<CandidateMetrics[]> {
    const data = await this.get("/site-explorer/broken-backlinks", {
      target,
      mode: "subdomains",
      aggregation: "1_per_domain",
      select: "domain,domain_rating,traffic_domain,dofollow_links,links_to_target,is_spam,first_seen",
      where: JSON.stringify({ and: [{ field: "is_spam", is: ["eq", false] }] }),
      order_by: "domain_rating:desc",
      limit: String(limit),
      output: "json",
    });
    return (data.backlinks ?? data.refdomains ?? []).map(mapRefDomain);
  }
}

function mapRefDomain(r: any): CandidateMetrics {
  return {
    domain: r.domain ?? r.root_domain_name,
    domainRating: r.domain_rating ?? 0,
    trafficDomain: r.traffic_domain ?? 0,
    dofollowLinks: r.dofollow_links ?? 0,
    linksToTarget: r.links_to_target ?? 0,
    isSpam: Boolean(r.is_spam),
    firstSeen: r.first_seen,
    positionsSourceDomain: r.positions_source_domain,
  };
}
