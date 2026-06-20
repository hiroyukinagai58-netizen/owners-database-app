import { initializeApp } from 'firebase/app';
import { getDatabase, push, ref, set, get } from 'firebase/database';

export interface MeetingRecord {
  id: string;
  date: string;
  company: string;
  vessel: string;
  attendees: string;
  memo: string;
  createdAt: string;
}

export interface NewMeetingRecord {
  date: string;
  company: string;
  vessel: string;
  attendees: string;
  memo: string;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
const db = app ? getDatabase(app) : null;

function requireDatabase() {
  if (!db) {
    throw new Error('Firebaseが未設定です。.envに VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_DATABASE_URL, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID を設定してください。');
  }

  return db;
}

export async function fetchMeetingRecords(): Promise<MeetingRecord[]> {
  const database = requireDatabase();
  const snapshot = await get(ref(database, 'meetingRecords'));

  if (!snapshot.exists()) {
    return [];
  }

  const value = snapshot.val() as Record<string, Omit<MeetingRecord, 'id'>>;

  return Object.entries(value)
    .map(([id, record]) => ({ id, ...record }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function addMeetingRecord(record: NewMeetingRecord): Promise<MeetingRecord> {
  const database = requireDatabase();
  const newRef = push(ref(database, 'meetingRecords'));

  const payload: Omit<MeetingRecord, 'id'> = {
    ...record,
    createdAt: new Date().toISOString(),
  };

  await set(newRef, payload);

  return {
    id: newRef.key ?? `${Date.now()}`,
    ...payload,
  };
}

export async function importMeetingRecords(records: NewMeetingRecord[]): Promise<number> {
  for (const record of records) {
    await addMeetingRecord(record);
  }

  return records.length;
}
