import { useMemo, useState } from 'react';

interface MeetingInput {
  attendees: string[];
  content: string;
  nextAction: string;
  date: string;
}

interface MeetingFormProps {
  attendeeOptions: string[];
  onSubmit: (input: MeetingInput) => void;
}

export default function MeetingForm({ attendeeOptions, onSubmit }: MeetingFormProps) {
  const [attendees, setAttendees] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const uniqueOptions = useMemo(() => Array.from(new Set(attendeeOptions)).filter(Boolean), [attendeeOptions]);

  const toggleAttendee = (name: string) => {
    setAttendees((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
  };

  return (
    <form
      className="panel form-panel"
      onSubmit={(event) => {
        event.preventDefault();
        if (!content.trim()) return;
        onSubmit({ attendees, content: content.trim(), nextAction: nextAction.trim(), date });
        setAttendees([]);
        setContent('');
        setNextAction('');
      }}
    >
      <h3>面談記録を追加</h3>
      <fieldset>
        <legend>出席者（複数選択）</legend>
        <div className="checkbox-grid">
          {uniqueOptions.map((name) => (
            <label key={name}>
              <input
                type="checkbox"
                checked={attendees.includes(name)}
                onChange={() => toggleAttendee(name)}
              />
              {name}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        面談内容
        <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={3} />
      </label>
      <label>
        次のアクション
        <textarea value={nextAction} onChange={(e) => setNextAction(e.target.value)} rows={2} />
      </label>
      <label>
        日付
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>
      <button type="submit">保存</button>
    </form>
  );
}
