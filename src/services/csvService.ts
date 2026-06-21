import type { Company, Vessel } from '../types';

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }

  out.push(current.trim());
  return out;
}

function toRows(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length <= 1) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

function toNumberOrUndefined(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function parseCompaniesCsv(text: string, startId: number): Company[] {
  return toRows(text)
    .map((row, idx) => ({
      company_id: toNumberOrUndefined(row.company_id) ?? startId + idx,
      area: row.area || '未設定',
      name: row.name || '',
      ceo: row.ceo || '',
      address: row.address || '',
      tel: row.tel || '',
      mail: row.mail || '',
      type_of_vessel: row.type_of_vessel || row.tags || '',
    }))
    .filter((company) => company.name && company.ceo);
}

export function parseVesselsCsv(
  text: string,
  startId: number,
  resolveCompanyId: (name: string) => number | undefined,
): Vessel[] {
  return toRows(text)
    .map((row, idx) => {
      const byName = row.company_name ? resolveCompanyId(row.company_name) : undefined;
      const companyId = toNumberOrUndefined(row.company_id) ?? byName ?? 0;
      return {
        vessel_id: toNumberOrUndefined(row.vessel_id) ?? startId + idx,
        company_id: companyId,
        section: row.section || row.status || '保有',
        type: row.type || '',
        imo: row.imo || '',
        name: row.name || '',
        flag: row.flag || '',
        dwt: row.dwt ? Number(row.dwt) : null,
      } as Vessel;
    })
    .filter((vessel) => vessel.company_id > 0 && vessel.name);
}
