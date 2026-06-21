import { useMemo, useState } from 'react';
import ShipTable, { type SortDirection } from '../components/ShipTable';
import type { Company, CreateVesselInput, Vessel } from '../types';

interface ShipsPageProps {
  vessels: Vessel[];
  companies: Company[];
  onAdd: (vessel: CreateVesselInput) => void;
  onDelete: (vesselId: number) => void;
}

type SortKey = 'companyName' | 'section' | 'type' | 'name' | 'imo' | 'flag' | 'dwt';

export default function ShipsPage({ vessels, companies, onAdd, onDelete }: ShipsPageProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    company_id: companies[0]?.company_id ?? 0,
    section: '保有',
    type: '',
    name: '',
    imo: '',
    flag: '',
    dwt: '',
  });

  const companyMap = useMemo(() => new Map(companies.map((company) => [company.company_id, company.name])), [companies]);
  const types = useMemo(() => Array.from(new Set(vessels.map((v) => v.type).filter(Boolean) as string[])).sort(), [vessels]);
  const sections = useMemo(() => Array.from(new Set(vessels.map((v) => v.section).filter(Boolean) as string[])).sort(), [vessels]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return vessels
      .map((vessel) => ({ ...vessel, companyName: companyMap.get(vessel.company_id) ?? `ID:${vessel.company_id}` }))
      .filter((vessel) => {
        const typeMatch = typeFilter === 'all' || vessel.type === typeFilter;
        const sectionMatch = sectionFilter === 'all' || vessel.section === sectionFilter;
        const textMatch =
          !term ||
          [vessel.name, vessel.imo, vessel.companyName].some((value) => String(value ?? '').toLowerCase().includes(term));
        return typeMatch && sectionMatch && textMatch;
      })
      .sort((a, b) => {
        const left = a[sortKey];
        const right = b[sortKey];
        const leftValue = typeof left === 'number' ? left : String(left ?? '').toLowerCase();
        const rightValue = typeof right === 'number' ? right : String(right ?? '').toLowerCase();

        if (leftValue === rightValue) return 0;
        const order = leftValue > rightValue ? 1 : -1;
        return sortDirection === 'asc' ? order : -order;
      });
  }, [vessels, companyMap, search, typeFilter, sectionFilter, sortKey, sortDirection]);

  return (
    <section className="page-content">
      <div className="panel controls">
        <input
          type="search"
          placeholder="船名・IMO・会社名で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">全ての種類</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
          <option value="all">全ての区分</option>
          {sections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => setShowForm((v) => !v)}>
          船舶追加
        </button>
      </div>

      {showForm && (
        <form
          className="panel form-inline"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.company_id || !form.name) return;
            onAdd({
              company_id: form.company_id,
              section: form.section,
              type: form.type,
              name: form.name,
              imo: form.imo,
              flag: form.flag,
              dwt: form.dwt ? Number(form.dwt) : null,
            });
            setForm((p) => ({ ...p, name: '', imo: '', dwt: '' }));
            setShowForm(false);
          }}
        >
          <select
            required
            value={form.company_id}
            onChange={(e) => setForm((p) => ({ ...p, company_id: Number(e.target.value) }))}
          >
            {companies.map((company) => (
              <option key={company.company_id} value={company.company_id}>
                {company.name}
              </option>
            ))}
          </select>
          <input placeholder="区分" value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))} />
          <input placeholder="船種" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} />
          <input required placeholder="船名" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input placeholder="IMO" value={form.imo} onChange={(e) => setForm((p) => ({ ...p, imo: e.target.value }))} />
          <input placeholder="旗国" value={form.flag} onChange={(e) => setForm((p) => ({ ...p, flag: e.target.value }))} />
          <input placeholder="DWT" value={form.dwt} onChange={(e) => setForm((p) => ({ ...p, dwt: e.target.value }))} />
          <button type="submit">保存</button>
        </form>
      )}

      <ShipTable
        rows={rows}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={(key) => {
          if (key === sortKey) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
          } else {
            setSortKey(key);
            setSortDirection('asc');
          }
        }}
        onDelete={onDelete}
      />
    </section>
  );
}
