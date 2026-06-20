import CompanyCard from './CompanyCard';
import './CompanyList.css';

interface Company {
  company_id: number;
  area: string;
  name: string;
  ceo: string;
  pic?: string;
  address: string;
  tel: string;
  [key: string]: any;
}

interface CompanyListProps {
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
}

function CompanyList({ companies, selectedCompany, onSelectCompany }: CompanyListProps) {
  return (
    <div className="company-list">
      <div className="company-list-header">
        <h2>企業一覧</h2>
        <span className="company-count">{companies.length} 社</span>
      </div>

      {companies.length === 0 ? (
        <div className="no-results">
          <p>条件に合う企業が見つかりませんでした。</p>
        </div>
      ) : (
        <div className="company-cards">
          {companies.map(company => (
            <CompanyCard
              key={company.company_id}
              company={company}
              isSelected={selectedCompany?.company_id === company.company_id}
              onClick={() => onSelectCompany(company)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanyList;
