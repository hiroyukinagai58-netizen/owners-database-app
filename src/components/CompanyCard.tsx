import { JAPANESE_TEXT_SPLIT_PATTERN } from '../constants';
import type { Company } from '../types';

interface CompanyCardProps {
  company: Company;
  onDelete: (companyId: number) => void;
}

export default function CompanyCard({ company, onDelete }: CompanyCardProps) {
  const tags = (company.type_of_vessel ?? '')
    .split(JAPANESE_TEXT_SPLIT_PATTERN)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <article className="company-card">
      <div className="card-title-row">
        <h3>{company.name}</h3>
        <button type="button" className="danger" onClick={() => onDelete(company.company_id)}>
          削除
        </button>
      </div>
      <p><strong>代表者:</strong> {company.ceo || '-'}</p>
      <p><strong>住所:</strong> {company.address || '-'}</p>
      <p><strong>電話:</strong> {company.tel || '-'}</p>
      <p><strong>メール:</strong> {company.mail || '-'}</p>
      <div className="tag-list">
        {tags.length === 0 && <span className="tag">未設定</span>}
        {tags.map((tag) => (
          <span className="tag" key={`${company.company_id}-${tag}`}>
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
