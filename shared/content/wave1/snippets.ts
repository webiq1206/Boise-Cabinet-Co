/** Reusable HTML snippets for Treasure Valley long-form content */

export const CITIES_LIST =
  'Boise, Meridian, Eagle, Kuna, Star, Middleton, Nampa, and Caldwell';

export const PILLAR_COST = '/guides/boise-cabinet-cost-guide';
export const PILLAR_TV = '/guides/treasure-valley-cabinet-guide';
export const PILLAR_BOISE = '/guides/boise-cabinet-guide';

export function svc(path: string, label?: string): string {
  return `<a href="${path}">${label ?? path.split('/').pop()?.replace(/-/g, ' ') ?? path}</a>`;
}

export interface ContentSection {
  h2: string;
  paragraphs: string[];
  list?: string[];
  table?: { headers: string[]; rows: string[][]; className?: string };
}

export function buildSectionsHtml(sections: ContentSection[]): string {
  return sections
    .map((s) => {
      let block = `<h2>${s.h2}</h2>`;
      for (const p of s.paragraphs) {
        block += `<p>${p}</p>`;
      }
      if (s.list?.length) {
        block += `<ul>${s.list.map((li) => `<li>${li}</li>`).join('')}</ul>`;
      }
      if (s.table) {
        const cls = s.table.className ?? 'cost-table';
        block += `<table class="${cls}"><thead><tr>${s.table.headers
          .map((h) => `<th>${h}</th>`)
          .join('')}</tr></thead><tbody>${s.table.rows
          .map(
            (row) =>
              `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`,
          )
          .join('')}</tbody></table>`;
      }
      return block;
    })
    .join('\n');
}
