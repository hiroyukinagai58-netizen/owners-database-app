import { useMemo, useState } from 'react';
import MeetingForm from '../components/MeetingForm';
import type { Company, MeetingRecord } from '../types';

interface MeetingsPageProps {
  meetings: MeetingRecord[];
  companies: Company[];
  onAdd: (meeting: Omit<MeetingRecord, 'id'>) => void;
  onDelete: (meetingId: string) => void;
}

type Tab = 'all' | 'thisMonth' | 'nextMonth';

export default function MeetingsPage({ meetings, companies, onAdd, onDelete }: MeetingsPageProps) {
  const [tab, setTab] = useState<Tab>('all');

  const filtered = useMemo(() => {
    if (tab === 'all') return meetings;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    return meetings.filter((meeting) => {
      const date = new Date(meeting.date);
      if (Number.isNaN(date.getTime())) return false;
      const y = date.getFullYear();
      const m = date.getMonth();

      if (tab === 'thisMonth') return y === year && m === month;
      return y > year || (y === year && m > month);
    });
  }, [meetings, tab]);

  const attendeeOptions = useMemo(
    () => companies.map((company) => company.name).sort((a, b) => a.localeCompare(b, 'ja')),
    [companies],
  );

  return (
    <section className="page-content">
      <div className="tabs panel">
        <button type="button" className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>
          全て
        </button>
        <button type="button" className={tab === 'thisMonth' ? 'active' : ''} onClick={() => setTab('thisMonth')}>
          今月
        </button>
        <button type="button" className={tab === 'nextMonth' ? 'active' : ''} onClick={() => setTab('nextMonth')}>
          今後
        </button>
      </div>

      <MeetingForm attendeeOptions={attendeeOptions} onSubmit={onAdd} />

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>日付</th>
              <th>出席者</th>
              <th>内容</th>
              <th>次のアクション</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((meeting) => (
              <tr key={meeting.id}>
                <td>{meeting.date}</td>
                <td>{meeting.attendees.join('、') || '-'}</td>
                <td>{meeting.content}</td>
                <td>{meeting.nextAction || '-'}</td>
                <td>
                  <button type="button" className="danger" onClick={() => onDelete(meeting.id)}>
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <p className="empty">表示できる面談記録がありません。</p>}
    </section>
  );
}
