import React from 'react';
import './DataTableView.css';
import { Gift } from 'lucide-react';

const BonusCalc = () => {
  return (
    <div className="data-table-container">
        <header className="board-header">
           <div className="board-breadcrumbs">TÀI CHÍNH / LƯƠNG THƯỞNG</div>
           <h1 className="board-title">Bảng tính thưởng từ KPI (Pts)</h1>
        </header>
        
        <div style={{ background: '#eff6ff', padding: '12px 24px', borderRadius: 8, marginBottom: 24, border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Gift color="#3b82f6" />
            <span style={{ color: '#1d4ed8', fontWeight: 500 }}>Quy đổi điểm hiện tại: <strong>1 Pts = 50,000 VNĐ</strong></span>
        </div>

        <div className="table-wrapper">
            <table className="info-table">
               <thead>
                 <tr>
                    <th>Nhân sự</th>
                    <th>Tổng Pts (Hệ thống giao việc)</th>
                    <th>Xếp hạng</th>
                    <th>Tổng Hệ số Thưởng</th>
                 </tr>
               </thead>
               <tbody>
                  <tr>
                     <td style={{ fontWeight: 500 }}>Bùi Văn K</td>
                     <td style={{ fontWeight: 700, color: '#ea580c' }}>500 Pts</td>
                     <td><span className="status-pill active" style={{background: '#fef9c3', color: '#a16207'}}>Top 1</span></td>
                     <td style={{ fontWeight: 700, color: '#16a34a', fontSize: 16 }}>25,000,000 ₫</td>
                  </tr>
                  <tr>
                     <td style={{ fontWeight: 500 }}>Lê Mai</td>
                     <td style={{ fontWeight: 700, color: '#ea580c' }}>250 Pts</td>
                     <td><span className="status-pill active">Đạt chuẩn</span></td>
                     <td style={{ fontWeight: 700, color: '#16a34a', fontSize: 16 }}>12,500,000 ₫</td>
                  </tr>
               </tbody>
            </table>
        </div>
    </div>
  );
};
export default BonusCalc;
