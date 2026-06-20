import { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import CompanyList from './components/CompanyList';
import CompanyDetail from './components/CompanyDetail';

interface Company {
  company_id: number;
  area: string;
  name: string;
  ceo: string;
  pic?: string;
  address: string;
  tel: string;
  mail?: string;
  registered_owner?: string;
  related_company?: string;
  banks?: string;
  broker?: string;
  type_of_vessel?: string;
  shipyard?: string;
  tc_fleet?: string;
  bbc_fleet?: string;
  tc_charterer?: string;
  bbc_charterer?: string;
  newbuilding?: string;
  [key: string]: any;
}

function App() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load JSON data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/owners-database-app/data/owners_database.json');
        if (!response.ok) {
          throw new Error('Failed to load database');
        }
        const data = await response.json();
        setCompanies(data.companies || []);
        setFilteredCompanies(data.companies || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter companies based on search and area
  useEffect(() => {
    let filtered = companies;

    // Filter by area
    if (selectedArea !== 'all') {
      filtered = filtered.filter(c => c.area === selectedArea);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.ceo.toLowerCase().includes(term) ||
        c.area.toLowerCase().includes(term) ||
        c.address.toLowerCase().includes(term)
      );
    }

    setFilteredCompanies(filtered);
  }, [searchTerm, selectedArea, companies]);

  // Get unique areas
  const areas = Array.from(new Set(companies.map(c => c.area))).sort();

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚢 海運企業・船舶管理データベース</h1>
        <p>企業情報、船舶フリート、船舶建造情報の検索・管理</p>
      </header>

      <main className="app-main">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedArea={selectedArea}
          onAreaChange={setSelectedArea}
          areas={areas}
          totalCompanies={companies.length}
          filteredCount={filteredCompanies.length}
        />

        {loading && (
          <div className="loading">
            <p>データを読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>エラー: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="app-content">
            <CompanyList
              companies={filteredCompanies}
              selectedCompany={selectedCompany}
              onSelectCompany={setSelectedCompany}
            />

            {selectedCompany && (
              <CompanyDetail
                company={selectedCompany}
                onClose={() => setSelectedCompany(null)}
              />
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>© 2024 海運企業・船舶管理データベース</p>
      </footer>
    </div>
  );
}

export default App;
