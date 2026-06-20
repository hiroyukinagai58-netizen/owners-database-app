import './SearchBar.css';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedArea: string;
  onAreaChange: (area: string) => void;
  areas: string[];
  totalCompanies: number;
  filteredCount: number;
}

function SearchBar({
  searchTerm,
  onSearchChange,
  selectedArea,
  onAreaChange,
  areas,
  totalCompanies,
  filteredCount
}: SearchBarProps) {
  return (
    <div className="search-bar">
      <div className="search-inputs">
        <div className="search-field">
          <input
            type="text"
            placeholder="企業名、CEO名、住所で検索..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="area-field">
          <select
            value={selectedArea}
            onChange={(e) => onAreaChange(e.target.value)}
            className="area-select"
          >
            <option value="all">すべての地域</option>
            {areas.map(area => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="search-stats">
        <span className="stat-item">
          全体: <strong>{totalCompanies}</strong> 社
        </span>
        <span className="stat-separator">|</span>
        <span className="stat-item">
          検索結果: <strong>{filteredCount}</strong> 社
        </span>
      </div>
    </div>
  );
}

export default SearchBar;
