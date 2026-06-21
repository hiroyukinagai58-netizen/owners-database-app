import type { Company, MeetingRecord, Vessel } from '../types';

const FIREBASE_DB_URL =
  import.meta.env.VITE_FIREBASE_DB_URL ??
  'https://shipmate-86d9a-default-rtdb.asia-southeast1.firebasedatabase.app';

type Keyed<T> = Record<string, T>;

interface FirebaseSnapshot {
  addedCompanies: Keyed<Company>;
  addedVessels: Keyed<Vessel>;
  deletedCompanyIds: Keyed<boolean>;
  deletedVesselIds: Keyed<boolean>;
  meetings: Keyed<MeetingRecord>;
}

async function readNode<T>(path: string): Promise<Keyed<T>> {
  const response = await fetch(`${FIREBASE_DB_URL}/${path}.json`);
  if (!response.ok) {
    throw new Error('Firebaseデータの取得に失敗しました。');
  }
  const data = (await response.json()) as Keyed<T> | null;
  return data ?? {};
}

async function writeNode(path: string, value: unknown): Promise<void> {
  const response = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });

  if (!response.ok) {
    throw new Error('Firebaseへの保存に失敗しました。');
  }
}

async function deleteNode(path: string): Promise<void> {
  await fetch(`${FIREBASE_DB_URL}/${path}.json`, { method: 'DELETE' });
}

export async function loadFirebaseSnapshot(): Promise<FirebaseSnapshot> {
  const [addedCompanies, addedVessels, deletedCompanyIds, deletedVesselIds, meetings] = await Promise.all([
    readNode<Company>('shipmate/addedCompanies'),
    readNode<Vessel>('shipmate/addedVessels'),
    readNode<boolean>('shipmate/deletedCompanyIds'),
    readNode<boolean>('shipmate/deletedVesselIds'),
    readNode<MeetingRecord>('shipmate/meetings'),
  ]);

  return {
    addedCompanies,
    addedVessels,
    deletedCompanyIds,
    deletedVesselIds,
    meetings,
  };
}

export async function upsertCompany(company: Company): Promise<void> {
  await writeNode(`shipmate/addedCompanies/${company.company_id}`, company);
}

export async function upsertVessel(vessel: Vessel): Promise<void> {
  await writeNode(`shipmate/addedVessels/${vessel.vessel_id}`, vessel);
}

export async function deleteCompany(companyId: number): Promise<void> {
  await Promise.all([
    deleteNode(`shipmate/addedCompanies/${companyId}`),
    writeNode(`shipmate/deletedCompanyIds/${companyId}`, true),
  ]);
}

export async function deleteVessel(vesselId: number): Promise<void> {
  await Promise.all([
    deleteNode(`shipmate/addedVessels/${vesselId}`),
    writeNode(`shipmate/deletedVesselIds/${vesselId}`, true),
  ]);
}

export async function upsertMeeting(meeting: MeetingRecord): Promise<void> {
  await writeNode(`shipmate/meetings/${meeting.id}`, meeting);
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  await deleteNode(`shipmate/meetings/${meetingId}`);
}
