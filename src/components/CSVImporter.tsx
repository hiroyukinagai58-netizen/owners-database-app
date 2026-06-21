import { useState } from 'react';

interface CSVImporterProps<T> {
  title: string;
  onImport: (text: string) => Promise<T[]>;
}

export default function CSVImporter<T>({ title, onImport }: CSVImporterProps<T>) {
  const [message, setMessage] = useState('');

  return (
    <section className="panel">
      <h3>{title}</h3>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const text = await file.text();
          const imported = await onImport(text);
          setMessage(`${imported.length}件を取り込みました。`);
          e.currentTarget.value = '';
        }}
      />
      {message && <p className="helper">{message}</p>}
    </section>
  );
}
