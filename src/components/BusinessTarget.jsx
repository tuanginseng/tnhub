import React from 'react';
import './DataTableView.css';
import { Target } from 'lucide-react';

const BusinessTarget = () => {
  return (
    <div className="data-table-container">
        <header className="board-header">
           <div className="board-breadcrumbs">ĐIỀU HÀNH / MỤC TIÊU</div>
           <h1 className="board-title">Mục tiêu kinh doanh (Sale Quota)</h1>
        </header>

        <div className="stats-grid" style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
           <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', gap: 16, alignItems: 'center' }}>
               <div style={{ background: '#fef3c7', padding: 12, borderRadius: 12 }}><Target color="#d97706" /></div>
               <div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Tổng Quota Quý 2</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>15.000.000.000 ₫</div>
               </div>
           </div>
        </div>

        <div className="table-wrapper">
            <table className="info-table">
               <thead>
                 <tr>
                    <th>Nhân sự Sale</th>
                    <th>Chỉ tiêu (Quota)</th>
                    <th>Đã đạt (Actual)</th>
                    <th>Tiến độ</th>
                 </tr>
               </thead>
               <tbody>
                  <tr>
                     <td style={{ fontWeight: 500 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8}}><div className="status-pill" style={{background: '#3b82f6', color: 'white', padding: '4px 8px'}}>T</div> Trần Văn Hùng</div></td>
                     <td>2,000,000,000 ₫</td>
                     <td>1,200,000,000 ₫</td>
                     <td><div style={{ background: '#e2e8f0', width: 100, height: 8, borderRadius: 4 }}><div style={{ background: '#3b82f6', width: '60%', height: 8, borderRadius: 4 }}></div></div></td>
                  </tr>
                  <tr>
                     <td style={{ fontWeight: 500 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8}}><div className="status-pill" style={{background: '#10b981', color: 'white', padding: '4px 8px'}}>L</div> Lê Mai</div></td>
                     <td>1,500,000,000 ₫</td>
                     <td>1,600,000,000 ₫</td>
                     <td><div style={{ background: '#e2e8f0', width: 100, height: 8, borderRadius: 4 }}><div style={{ background: '#16a34a', width: '100%', height: 8, borderRadius: 4 }}></div></div></td>
                  </tr>
               </tbody>
            </table>
        </div>
    </div>
  );
};
export default BusinessTarget;
