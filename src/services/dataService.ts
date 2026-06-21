import type { MeetingRecord, SeedData } from '../types';

const dataPath = `${import.meta.env.BASE_URL}data/owners_database.json`;
const attendeeSeparatorPattern = /[、,\n]/; // Japanese delimiter "、", comma, and newline.

const toMeetingRecord = (value: unknown): MeetingRecord | null => {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const attendees = Array.isArray(item.attendees)
    ? item.attendees.map(String)
    : typeof item.attendees === 'string'
      ? item.attendees.split(attendeeSeparatorPattern).map((v) => v.trim()).filter(Boolean)
      : [];

  if (!item.id || !item.content || !item.date) return null;

  return {
    id: String(item.id),
    attendees,
    content: String(item.content),
    nextAction: item.nextAction ? String(item.nextAction) : '',
    date: String(item.date),
  };
};

export async function loadSeedData(): Promise<SeedData> {
  const response = await fetch(dataPath);
  if (!response.ok) {
    throw new Error('既存データの読み込みに失敗しました。');
  }

  const raw = (await response.json()) as {
    companies?: SeedData['companies'];
    vessels?: SeedData['vessels'];
    meetings?: unknown[];
  };

  return {
    companies: raw.companies ?? [],
    vessels: raw.vessels ?? [],
    meetings: (raw.meetings ?? []).map(toMeetingRecord).filter((v): v is MeetingRecord => v !== null),
  };
}
