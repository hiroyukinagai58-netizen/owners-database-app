import './CompanyCard.css';

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

interface CompanyCardProps {
  company: Company;
  isSelected: boolean;
  onClick: () => void;
}

function CompanyCard({ company, isSelected, onClick }: CompanyCardProps) {
  return (
    <div
      className={`company-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="card-header">
        <h3>{company.name}</h3>
        <span className="area-badge">{company.area}</span>
      </div>
      <div className="card-body">
        <div className="card-row">
          <span className="label">代表者:</span>
          <span className="value">{company.ceo}</span>
        </div>
        {company.pic && (
          <div className="card-row">
            <span className="label">役員:</span>
            <span className="value">{company.pic}</span>
          </div>
        )}
        <div className="card-row">
          <span className="label">住所:</span>
          <span className="value">{company.address.substring(0, 30)}...</span>
        </div>
      </div>
    </div>
  );
}

export default CompanyCard;
