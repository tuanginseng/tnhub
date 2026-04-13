import React from 'react';
import { Search, Filter, Download } from 'lucide-react';
import './DataTableView.css';

const DataTableView = ({ title }) => {
  return (
    <div className="data-table-container">
        <header className="board-header">
           <div className="board-breadcrumbs">QUẢN TRỊ DỮ LIỆU</div>
           <h1 className="board-title">{title}</h1>
           
           <div className="table-actions">
              <div className="search-box">
                <Search size={16} color="#94a3b8"/>
                <input type="text" placeholder="Tìm kiếm dữ liệu..." />
              </div>
              <button className="tb-btn"><Filter size={16}/> Bộ lọc</button>
              <button className="tb-btn primary"><Download size={16}/> Xuất Excel</button>
           </div>
        </header>

        <div className="table-wrapper">
            <table className="info-table">
               <thead>
                 <tr>
                    <th>STT</th>
                    <th>Mã Định Danh (ID)</th>
                    <th>Nội Dung / Nhân Sự</th>
                    <th>Phân Loại</th>
                    <th>Trạng Thái</th>
                    <th>Cập nhật Kế Tiếp</th>
                 </tr>
               </thead>
               <tbody>
                  {[1,2,3,4,5,6,7].map(i => (
                     <tr key={i}>
                        <td style={{ color: '#94a3b8'}}>{i}</td>
                        <td style={{ fontFamily: 'monospace', color: '#3b82f6' }}>#HS-00{i}</td>
                        <td style={{ fontWeight: 500, color: '#1e293b' }}>Dữ liệu hệ thống số {i}</td>
                        <td>{i % 2 === 0 ? 'Khối Bán Hàng' : 'Khối Vận Hành'}</td>
                        <td>
                          {i !== 4 ? (
                            <span className="status-pill active">Đang hoạt động</span>
                          ) : (
                            <span className="status-pill pending">Đang chờ duyệt</span>
                          )}
                        </td>
                        <td style={{ color: '#64748b'}}>16-04-2026</td>
                     </tr>
                  ))}
               </tbody>
            </table>
        </div>
    </div>
  );
};

export default DataTableView;
