import CSVImporter from '../components/CSVImporter';
import type { Company, Vessel } from '../types';

interface AdminPageProps {
  onImportCompanies: (csvText: string) => Promise<Company[]>;
  onImportVessels: (csvText: string) => Promise<Vessel[]>;
}

export default function AdminPage({ onImportCompanies, onImportVessels }: AdminPageProps) {
  return (
    <section className="page-content">
      <div className="panel">
        <h2>管理画面（/admin）</h2>
        <p className="helper">CSVファイルを使って会社情報・船舶情報を一括登録できます。</p>
      </div>
      <CSVImporter title="会社CSVインポート" onImport={onImportCompanies} />
      <CSVImporter title="船舶CSVインポート" onImport={onImportVessels} />
    </section>
  );
}
