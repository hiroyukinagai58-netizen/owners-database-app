import { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import CompaniesPage from './pages/CompaniesPage';
import ShipsPage from './pages/ShipsPage';
import MeetingsPage from './pages/MeetingsPage';
import AdminPage from './pages/AdminPage';
import { parseCompaniesCsv, parseVesselsCsv } from './services/csvService';
import { loadSeedData } from './services/dataService';
import {
  deleteCompany,
  deleteMeeting,
  deleteVessel,
  loadFirebaseSnapshot,
  upsertCompany,
  upsertMeeting,
  upsertVessel,
} from './services/firebaseService';
import type { Company, CreateCompanyInput, CreateVesselInput, MeetingRecord, SeedData, Vessel } from './types';

type Route = '/' | '/ships' | '/meetings' | '/admin';

function resolveRoute(pathname: string): Route {
  if (pathname.endsWith('/ships')) return '/ships';
  if (pathname.endsWith('/meetings')) return '/meetings';
  if (pathname.endsWith('/admin')) return '/admin';
  return '/';
}

function toPath(route: Route): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL.slice(0, -1)
    : import.meta.env.BASE_URL;

  return route === '/' ? `${base}/` : `${base}${route}`;
}

const emptySeed: SeedData = { companies: [], vessels: [], meetings: [] };

export default function App() {
  const fallbackMeetingCounterRef = useRef(0);
  const [route, setRoute] = useState<Route>(() => resolveRoute(window.location.pathname));
  const [seed, setSeed] = useState<SeedData>(emptySeed);
  const [addedCompanies, setAddedCompanies] = useState<Record<string, Company>>({});
  const [addedVessels, setAddedVessels] = useState<Record<string, Vessel>>({});
  const [deletedCompanyIds, setDeletedCompanyIds] = useState<Record<string, boolean>>({});
  const [deletedVesselIds, setDeletedVesselIds] = useState<Record<string, boolean>>({});
  const [firebaseMeetings, setFirebaseMeetings] = useState<Record<string, MeetingRecord>>({});
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onPop = () => setRoute(resolveRoute(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [seedData, firebaseData] = await Promise.all([loadSeedData(), loadFirebaseSnapshot()]);

        setSeed(seedData);
        setAddedCompanies(firebaseData.addedCompanies);
        setAddedVessels(firebaseData.addedVessels);
        setDeletedCompanyIds(firebaseData.deletedCompanyIds);
        setDeletedVesselIds(firebaseData.deletedVesselIds);
        setFirebaseMeetings(firebaseData.meetings);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'データ取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const companies = useMemo(() => {
    const local = seed.companies.filter((company) => !deletedCompanyIds[String(company.company_id)]);
    const extra = Object.values(addedCompanies).filter((company) => !deletedCompanyIds[String(company.company_id)]);
    return [...local, ...extra];
  }, [seed.companies, addedCompanies, deletedCompanyIds]);

  const vessels = useMemo(() => {
    const local = seed.vessels.filter((vessel) => !deletedVesselIds[String(vessel.vessel_id)]);
    const extra = Object.values(addedVessels).filter((vessel) => !deletedVesselIds[String(vessel.vessel_id)]);
    return [...local, ...extra];
  }, [seed.vessels, addedVessels, deletedVesselIds]);

  const meetings = useMemo(() => {
    const fromSeed = seed.meetings;
    const fromFirebase = Object.values(firebaseMeetings);
    return [...fromSeed, ...fromFirebase].sort((a, b) => b.date.localeCompare(a.date));
  }, [seed.meetings, firebaseMeetings]);

  const moveTo = (nextRoute: Route) => {
    const nextPath = toPath(nextRoute);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setRoute(nextRoute);
  };

  const nextCompanyId = useMemo(
    () => Math.max(0, ...seed.companies.map((c) => c.company_id), ...Object.values(addedCompanies).map((c) => c.company_id)) + 1,
    [seed.companies, addedCompanies],
  );
  const nextVesselId = useMemo(
    () => Math.max(0, ...seed.vessels.map((v) => v.vessel_id), ...Object.values(addedVessels).map((v) => v.vessel_id)) + 1,
    [seed.vessels, addedVessels],
  );

  const showStatus = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => {
      setStatusMessage((prev) => (prev === message ? '' : prev));
    }, 3500);
  };

  const runAction = (task: () => Promise<void>) => {
    task().catch((e) => {
      const message = e instanceof Error ? e.message : '処理に失敗しました。';
      setError(message);
    });
  };

  const handleAddCompany = async (input: CreateCompanyInput) => {
    const company: Company = { ...input, company_id: nextCompanyId };
    await upsertCompany(company);
    setAddedCompanies((prev) => ({ ...prev, [String(company.company_id)]: company }));
    showStatus('企業情報をFirebaseに保存しました。');
  };

  const handleDeleteCompany = async (companyId: number) => {
    await deleteCompany(companyId);
    setDeletedCompanyIds((prev) => ({ ...prev, [String(companyId)]: true }));
    setAddedCompanies((prev) => {
      const next = { ...prev };
      delete next[String(companyId)];
      return next;
    });
    showStatus('企業情報を削除しました。');
  };

  const handleAddVessel = async (input: CreateVesselInput) => {
    const vessel: Vessel = { ...input, vessel_id: nextVesselId };
    await upsertVessel(vessel);
    setAddedVessels((prev) => ({ ...prev, [String(vessel.vessel_id)]: vessel }));
    showStatus('船舶情報をFirebaseに保存しました。');
  };

  const handleDeleteVessel = async (vesselId: number) => {
    await deleteVessel(vesselId);
    setDeletedVesselIds((prev) => ({ ...prev, [String(vesselId)]: true }));
    setAddedVessels((prev) => {
      const next = { ...prev };
      delete next[String(vesselId)];
      return next;
    });
    showStatus('船舶情報を削除しました。');
  };

  const handleAddMeeting = async (input: Omit<MeetingRecord, 'id'>) => {
    let id: string;
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      id = crypto.randomUUID();
    } else {
      fallbackMeetingCounterRef.current += 1;
      const randomPart =
        typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'
          ? Array.from(crypto.getRandomValues(new Uint32Array(1)))[0].toString(36)
          : Math.random().toString(36).slice(2, 10);
      id = `m-${Date.now()}-${fallbackMeetingCounterRef.current}-${randomPart}`;
    }
    const meeting: MeetingRecord = { id, ...input };
    await upsertMeeting(meeting);
    setFirebaseMeetings((prev) => ({ ...prev, [id]: meeting }));
    showStatus('面談記録をFirebaseに保存しました。');
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    await deleteMeeting(meetingId);
    setFirebaseMeetings((prev) => {
      const next = { ...prev };
      delete next[meetingId];
      return next;
    });
    showStatus('面談記録を削除しました。');
  };

  const handleImportCompanies = async (csvText: string) => {
    const imported = parseCompaniesCsv(csvText, nextCompanyId);
    await Promise.all(imported.map((company) => upsertCompany(company)));
    setAddedCompanies((prev) => {
      const next = { ...prev };
      imported.forEach((company) => {
        next[String(company.company_id)] = company;
      });
      return next;
    });
    showStatus('会社CSVを取り込みました。');
    return imported;
  };

  const handleImportVessels = async (csvText: string) => {
    const companyMap = new Map(companies.map((company) => [company.name, company.company_id]));
    const imported = parseVesselsCsv(csvText, nextVesselId, (name) => companyMap.get(name));
    await Promise.all(imported.map((vessel) => upsertVessel(vessel)));
    setAddedVessels((prev) => {
      const next = { ...prev };
      imported.forEach((vessel) => {
        next[String(vessel.vessel_id)] = vessel;
      });
      return next;
    });
    showStatus('船舶CSVを取り込みました。');
    return imported;
  };

  return (
    <div className="app-shell">
      <Header currentPath={route} onNavigate={(path) => moveTo(path as Route)} />
      <main className="main-shell">
        {loading && <div className="panel">データを読み込み中です...</div>}
        {error && <div className="panel">エラー: {error}</div>}
        {!loading && !error && (
          <>
            {route === '/' && (
              <CompaniesPage
                companies={companies}
                onAdd={(company) => runAction(() => handleAddCompany(company))}
                onDelete={(id) => runAction(() => handleDeleteCompany(id))}
              />
            )}
            {route === '/ships' && (
              <ShipsPage
                vessels={vessels}
                companies={companies}
                onAdd={(vessel) => runAction(() => handleAddVessel(vessel))}
                onDelete={(id) => runAction(() => handleDeleteVessel(id))}
              />
            )}
            {route === '/meetings' && (
              <MeetingsPage
                meetings={meetings}
                companies={companies}
                onAdd={(meeting) => runAction(() => handleAddMeeting(meeting))}
                onDelete={(id) => runAction(() => handleDeleteMeeting(id))}
              />
            )}
            {route === '/admin' && <AdminPage onImportCompanies={handleImportCompanies} onImportVessels={handleImportVessels} />}
            {statusMessage && <p className="status">{statusMessage}</p>}
          </>
        )}
      </main>
    </div>
  );
}
