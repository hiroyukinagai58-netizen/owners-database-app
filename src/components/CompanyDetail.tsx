import './CompanyDetail.css';

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

interface CompanyDetailProps {
  company: Company;
  onClose: () => void;
}

function CompanyDetail({ company, onClose }: CompanyDetailProps) {
  const sections = [
    { title: '基本情報', fields: ['ceo', 'pic', 'address', 'tel', 'mail'] },
    { title: '関連企業情報', fields: ['registered_owner', 'related_company', 'banks', 'broker'] },
    { title: '船舶情報', fields: ['type_of_vessel', 'shipyard'] },
    { title: 'TCフリート・チャーターrer', fields: ['tc_fleet', 'bbc_fleet', 'tc_charterer', 'bbc_charterer'] },
    { title: '新造船', fields: ['newbuilding'] },
  ];

  const formatLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      ceo: '代表者',
      pic: '役員',
      address: '住所',
      tel: '電話',
      mail: 'メール',
      registered_owner: '登録船舶所有者',
      related_company: '関連企業',
      banks: '銀行',
      broker: 'ブローカー',
      type_of_vessel: '船舶種別',
      shipyard: '造船所',
      tc_fleet: 'TCフリート',
      bbc_fleet: 'BBCフリート',
      tc_charterer: 'TCチャーター',
      bbc_charterer: 'BBCチャーター',
      newbuilding: '新造船',
    };
    return labels[key] || key;
  };

  return (
    <div className="company-detail">
      <div className="detail-header">
        <div>
          <h2>{company.name}</h2>
          <span className="detail-area">{company.area}</span>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="detail-content">
        {sections.map((section, idx) => {
          const hasData = section.fields.some(field => company[field]);
          if (!hasData) return null;

          return (
            <div key={idx} className="detail-section">
              <h3>{section.title}</h3>
              <div className="section-fields">
                {section.fields.map(field => (
                  company[field] && (
                    <div key={field} className="detail-field">
                      <span className="detail-label">{formatLabel(field)}</span>
                      <span className="detail-value">{company[field]}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CompanyDetail;
