import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import './App.css';
import {
  addMeetingRecord,
  fetchMeetingRecords,
  importMeetingRecords,
  MeetingRecord,
  NewMeetingRecord,
} from './firebase';

type TabKey = 'companies' | 'vessels' | 'meetings' | 'admin';

interface Company {
  company_id: number;
  area: string;
  name: string;
  ceo: string;
  address: string;
  tel: string;
}

interface Vessel {
  vessel_id: number;
  company_id: number;
  type: string | null;
  name: string;
  imo: string | null;
  flag: string | null;
  dwt: number | null;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').toLowerCase();
}

function toMeetingRecord(record: Partial<MeetingRecord>): MeetingRecord {
  return {
    id: record.id ?? `local-${Date.now()}`,
    date: record.date ?? '',
    company: record.company ?? '',
    vessel: record.vessel ?? '',
    attendees: record.attendees ?? '',
    memo: record.memo ?? '',
    createdAt: record.createdAt ?? new Date().toISOString(),
  };
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseMeetingCsv(csvText: string): NewMeetingRecord[] {
  const rows = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length < 2) {
    throw new Error('CSVはヘッダー行と1件以上のデータ行が必要です。');
  }

  const header = parseCsvLine(rows[0]).map((cell) => cell.toLowerCase());

  const readCell = (cells: string[], keys: string[]): string => {
    const index = header.findIndex((name) => keys.includes(name));
    return index >= 0 ? cells[index] ?? '' : '';
  };

  const records = rows.slice(1).map((line) => {
    const cells = parseCsvLine(line);

    return {
      date: readCell(cells, ['date', '日付']),
      company: readCell(cells, ['company', 'company_name', '会社', '会社名']),
      vessel: readCell(cells, ['vessel', 'ship', '船名']),
      attendees: readCell(cells, ['attendees', 'attendee', '参加者']),
      memo: readCell(cells, ['memo', 'notes', '内容', 'メモ']),
    };
  });

  const validRecords = records.filter((record) => record.company || record.vessel || record.memo);

  if (validRecords.length === 0) {
    throw new Error('CSVに有効なデータ行がありません。');
  }

  return validRecords;
}

function App() {
  const [tab, setTab] = useState<TabKey>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [companyArea, setCompanyArea] = useState('all');
  const [vesselSearch, setVesselSearch] = useState('');
  const [vesselType, setVesselType] = useState('all');
  const [meetingForm, setMeetingForm] = useState<NewMeetingRecord>({
    date: '',
    company: '',
    vessel: '',
    attendees: '',
    memo: '',
  });
  const [csvContent, setCsvContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.BASE_URL}data/owners_database.json`);
        if (!response.ok) {
          throw new Error('JSONデータの読み込みに失敗しました。');
        }

        const data = await response.json();
        const sourceCompanies = (data.companies ?? []) as Company[];
        const sourceVessels = (data.vessels ?? []) as Vessel[];
        const sourceMeetings = ((data.meetings ?? []) as Partial<MeetingRecord>[]).map(toMeetingRecord);

        setCompanies(sourceCompanies);
        setVessels(sourceVessels);
        setMeetings(sourceMeetings);

        try {
          const firebaseMeetings = await fetchMeetingRecords();
          setMeetings((prev) => [...firebaseMeetings, ...prev]);
        } catch (firebaseError) {
          console.warn(firebaseError);
          setMessage('Firebase未設定のため、面談記録の保存はローカル表示のみです。');
        }

        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'データ読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const areas = useMemo(
    () => Array.from(new Set(companies.map((company) => company.area))).sort(),
    [companies],
  );

  const companyMap = useMemo(() => {
    const map = new Map<number, string>();
    companies.forEach((company) => {
      map.set(company.company_id, company.name);
    });
    return map;
  }, [companies]);

  const vesselTypes = useMemo(
    () =>
      Array.from(new Set(vessels.map((vessel) => vessel.type).filter(Boolean) as string[])).sort(),
    [vessels],
  );

  const filteredCompanies = useMemo(() => {
    const term = normalizeText(companySearch);

    return companies.filter((company) => {
      const areaMatch = companyArea === 'all' || company.area === companyArea;
      const searchMatch =
        !term ||
        normalizeText(company.name).includes(term) ||
        normalizeText(company.ceo).includes(term) ||
        normalizeText(company.address).includes(term) ||
        normalizeText(company.tel).includes(term);

      return areaMatch && searchMatch;
    });
  }, [companies, companyArea, companySearch]);

  const filteredVessels = useMemo(() => {
    const term = normalizeText(vesselSearch);

    return vessels.filter((vessel) => {
      const typeMatch = vesselType === 'all' || vessel.type === vesselType;
      const companyName = companyMap.get(vessel.company_id) ?? '';
      const searchMatch =
        !term ||
        normalizeText(companyName).includes(term) ||
        normalizeText(vessel.type).includes(term) ||
        normalizeText(vessel.name).includes(term) ||
        normalizeText(vessel.imo).includes(term) ||
        normalizeText(vessel.flag).includes(term);

      return typeMatch && searchMatch;
    });
  }, [vessels, vesselType, vesselSearch, companyMap]);

  const submitMeeting = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const created = await addMeetingRecord(meetingForm);
      setMeetings((prev) => [created, ...prev]);
      setMeetingForm({ date: '', company: '', vessel: '', attendees: '', memo: '' });
      setMessage('面談記録を追加しました。');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '面談記録の保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  const onCsvFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    setCsvContent(text);
  };

  const submitCsvImport = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const records = parseMeetingCsv(csvContent);

      const importedCount = await importMeetingRecords(records);
      const refreshed = await fetchMeetingRecords();
      setMeetings((prev) => {
        const localRecords = prev.filter((record) => record.id.startsWith('local-'));
        return [...refreshed, ...localRecords];
      });

      setMessage(`${importedCount}件の面談記録をインポートしました。`);
      setCsvContent('');
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'CSVインポートに失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}ssy-logo.svg`} alt="SSY logo" className="logo" />
          <div>
            <h1>ShipVault</h1>
            <p>Company, Fleet & Meeting Management</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <nav className="tabs">
          <button className={tab === 'companies' ? 'active' : ''} onClick={() => setTab('companies')}>会社一覧</button>
          <button className={tab === 'vessels' ? 'active' : ''} onClick={() => setTab('vessels')}>船舶一覧</button>
          <button className={tab === 'meetings' ? 'active' : ''} onClick={() => setTab('meetings')}>面談記録</button>
          <button className={tab === 'admin' ? 'active' : ''} onClick={() => setTab('admin')}>管理画面</button>
        </nav>

        {loading && <p className="state">データを読み込み中...</p>}
        {error && <p className="state error">{error}</p>}
        {message && <p className="state message">{message}</p>}

        {!loading && tab === 'companies' && (
          <section>
            <div className="filters">
              <input
                value={companySearch}
                onChange={(event) => setCompanySearch(event.target.value)}
                placeholder="企業名・代表者・住所・電話で検索"
              />
              <select value={companyArea} onChange={(event) => setCompanyArea(event.target.value)}>
                <option value="all">すべてのエリア</option>
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
            <div className="company-grid">
              {filteredCompanies.map((company) => (
                <article key={company.company_id} className="card">
                  <h3>{company.name}</h3>
                  <p><strong>代表者:</strong> {company.ceo}</p>
                  <p><strong>住所:</strong> {company.address}</p>
                  <p><strong>電話:</strong> {company.tel}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {!loading && tab === 'vessels' && (
          <section>
            <div className="filters">
              <input
                value={vesselSearch}
                onChange={(event) => setVesselSearch(event.target.value)}
                placeholder="会社・船種・船名・IMO・旗国で検索"
              />
              <select value={vesselType} onChange={(event) => setVesselType(event.target.value)}>
                <option value="all">すべての船種</option>
                {vesselTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>会社</th>
                    <th>船種</th>
                    <th>船名</th>
                    <th>IMO</th>
                    <th>旗国</th>
                    <th>DWT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVessels.map((vessel) => (
                    <tr key={vessel.vessel_id}>
                      <td>{companyMap.get(vessel.company_id) ?? '-'}</td>
                      <td>{vessel.type ?? '-'}</td>
                      <td>{vessel.name}</td>
                      <td>{vessel.imo ?? '-'}</td>
                      <td>{vessel.flag ?? '-'}</td>
                      <td>{vessel.dwt?.toLocaleString() ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {!loading && tab === 'meetings' && (
          <section className="meeting-layout">
            <form className="meeting-form" onSubmit={submitMeeting}>
              <h2>新規面談記録</h2>
              <input type="date" value={meetingForm.date} required onChange={(event) => setMeetingForm((prev) => ({ ...prev, date: event.target.value }))} />
              <input value={meetingForm.company} required placeholder="会社名" onChange={(event) => setMeetingForm((prev) => ({ ...prev, company: event.target.value }))} />
              <input value={meetingForm.vessel} placeholder="船名" onChange={(event) => setMeetingForm((prev) => ({ ...prev, vessel: event.target.value }))} />
              <input value={meetingForm.attendees} placeholder="参加者" onChange={(event) => setMeetingForm((prev) => ({ ...prev, attendees: event.target.value }))} />
              <textarea value={meetingForm.memo} required placeholder="面談メモ" onChange={(event) => setMeetingForm((prev) => ({ ...prev, memo: event.target.value }))} />
              <button type="submit" disabled={saving}>{saving ? '保存中...' : '面談記録を追加'}</button>
            </form>
            <div>
              <h2>面談記録一覧</h2>
              <ul className="meeting-list">
                {meetings.map((record) => (
                  <li key={record.id}>
                    <p><strong>{record.date}</strong> / {record.company} / {record.vessel || '-'}</p>
                    <p>参加者: {record.attendees || '-'}</p>
                    <p>{record.memo}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {!loading && tab === 'admin' && (
          <section className="admin-panel">
            <h2>CSVインポート（面談記録）</h2>
            <p>ヘッダー例: date,company,vessel,attendees,memo</p>
            <input type="file" accept=".csv,text/csv" onChange={onCsvFileSelected} />
            <textarea
              value={csvContent}
              onChange={(event) => setCsvContent(event.target.value)}
              placeholder={'date,company,vessel,attendees,memo\n2026-06-20,SSY株式会社,HL MIDLAND,山田太郎,今治エリアの案件ヒアリング'}
            />
            <button onClick={submitCsvImport} disabled={saving}>{saving ? '処理中...' : 'Firebaseへインポート'}</button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
