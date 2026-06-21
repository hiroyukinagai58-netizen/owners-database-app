import { useMemo, useState } from 'react';
import CompanyCard from '../components/CompanyCard';
import type { Company, CreateCompanyInput } from '../types';

interface CompaniesPageProps {
  companies: Company[];
  onAdd: (company: CreateCompanyInput) => void;
  onDelete: (companyId: number) => void;
}

export default function CompaniesPage({ companies, onAdd, onDelete }: CompaniesPageProps) {
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    area: '',
    name: '',
    ceo: '',
    address: '',
    tel: '',
    mail: '',
    type_of_vessel: '',
  });

  const areas = useMemo(() => Array.from(new Set(companies.map((c) => c.area))).sort(), [companies]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return companies.filter((company) => {
      const areaMatch = area === 'all' || company.area === area;
      const textMatch =
        !term ||
        [company.name, company.ceo, company.address, company.mail]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term));
      return areaMatch && textMatch;
    });
  }, [companies, search, area]);

  return (
    <section className="page-content">
      <div className="panel controls">
        <input
          type="search"
          placeholder="企業名・代表者・住所で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={area} onChange={(e) => setArea(e.target.value)}>
          <option value="all">全地域</option>
          {areas.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => setShowForm((v) => !v)}>
          企業追加
        </button>
      </div>

      {showForm && (
        <form
          className="panel form-inline"
          onSubmit={(e) => {
            e.preventDefault();
            onAdd(form);
            setForm({ area: '', name: '', ceo: '', address: '', tel: '', mail: '', type_of_vessel: '' });
            setShowForm(false);
          }}
        >
          <input required placeholder="企業名" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input required placeholder="代表者" value={form.ceo} onChange={(e) => setForm((p) => ({ ...p, ceo: e.target.value }))} />
          <input required placeholder="住所" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          <input required placeholder="電話" value={form.tel} onChange={(e) => setForm((p) => ({ ...p, tel: e.target.value }))} />
          <input placeholder="メール" value={form.mail} onChange={(e) => setForm((p) => ({ ...p, mail: e.target.value }))} />
          <input placeholder="地域" value={form.area} onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))} />
          <input placeholder="タグ(船種など)" value={form.type_of_vessel} onChange={(e) => setForm((p) => ({ ...p, type_of_vessel: e.target.value }))} />
          <button type="submit">保存</button>
        </form>
      )}

      <div className="company-grid">
        {filtered.map((company) => (
          <CompanyCard key={company.company_id} company={company} onDelete={onDelete} />
        ))}
      </div>
      {filtered.length === 0 && <p className="empty">条件に一致する企業がありません。</p>}
    </section>
  );
}
