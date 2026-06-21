import type { Vessel } from '../types';

export type SortDirection = 'asc' | 'desc';

type SortKey = 'companyName' | 'section' | 'type' | 'name' | 'imo' | 'flag' | 'dwt';

interface Row extends Vessel {
  companyName: string;
}

interface ShipTableProps {
  rows: Row[];
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  onDelete: (vesselId: number) => void;
}

const headers: Array<{ key: SortKey; label: string }> = [
  { key: 'companyName', label: '会社名' },
  { key: 'section', label: '区分' },
  { key: 'type', label: '船種' },
  { key: 'name', label: '船名' },
  { key: 'imo', label: 'IMO' },
  { key: 'flag', label: '旗国' },
  { key: 'dwt', label: 'DWT' },
];

export default function ShipTable({ rows, sortKey, sortDirection, onSort, onDelete }: ShipTableProps) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header.key}>
                <button type="button" className="sort-btn" onClick={() => onSort(header.key)}>
                  {header.label}
                  {sortKey === header.key ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : ''}
                </button>
              </th>
            ))}
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.vessel_id}>
              <td>{row.companyName}</td>
              <td>{row.section || '-'}</td>
              <td>{row.type || '-'}</td>
              <td>{row.name}</td>
              <td>{row.imo || '-'}</td>
              <td>{row.flag || '-'}</td>
              <td>{row.dwt ?? '-'}</td>
              <td>
                <button type="button" className="danger" onClick={() => onDelete(row.vessel_id)}>
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="empty">条件に一致する船舶がありません。</p>}
    </div>
  );
}
