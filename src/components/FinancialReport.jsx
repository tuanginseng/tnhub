import React from 'react';
import { DollarSign, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import './DashboardView.css';

const FinancialReport = () => {
  return (
    <div className="dashboard-container">
       <header className="board-header">
        <div className="board-breadcrumbs">ĐIỀU HÀNH / TÀI CHÍNH</div>
        <h1 className="board-title">Báo cáo tài chính (P&L)</h1>
      </header>
      
      <div className="stats-grid">
         <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}><ArrowUpRight size={24} /></div>
            <div className="stat-details">
               <span className="stat-title">Tổng Doanh Thu</span>
               <span className="stat-value">5.400.000.000 ₫</span>
               <span className="stat-trend positive">Tháng 4/2026</span>
            </div>
         </div>
         <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}><ArrowDownRight size={24} /></div>
            <div className="stat-details">
               <span className="stat-title">Chi phí Marketing (Cogs)</span>
               <span className="stat-value">1.100.000.000 ₫</span>
               <span className="stat-trend negative">Chiếm 20.3% doanh thu</span>
            </div>
         </div>
         <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}><Wallet size={24} /></div>
            <div className="stat-details">
               <span className="stat-title">Chi phí Lương & Thưởng</span>
               <span className="stat-value">850.000.000 ₫</span>
               <span className="stat-trend negative">Đã gồm Hoa hồng</span>
            </div>
         </div>
         <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}><DollarSign size={24} /></div>
            <div className="stat-details">
               <span className="stat-title">Biên lợi nhuận gộp</span>
               <span className="stat-value">63.8%</span>
               <span className="stat-trend positive">Tốt</span>
            </div>
         </div>
      </div>

      <div className="charts-area">
          <div className="chart-box main-chart">
            <h3 className="chart-title">Dòng tiền thu chi (Cashflow) 6 tháng qua</h3>
            <div className="mock-chart-container">
               {[
                 { in: 60, out: 40, label: 'T11' },
                 { in: 70, out: 50, label: 'T12' },
                 { in: 90, out: 80, label: 'T1' },
                 { in: 85, out: 45, label: 'T2' },
                 { in: 100, out: 60, label: 'T3' },
                 { in: 95, out: 55, label: 'T4' },
               ].map((d, i) => (
                  <div key={i} className="bar-wrapper" style={{ flexDirection: 'row', gap: 4, alignItems: 'flex-end'}}>
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                       <div className="bar" style={{ height: `${d.in}%`, backgroundColor: '#10b981', width: 24, borderRadius: '4px 4px 0 0' }}></div>
                    </div>
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                       <div className="bar" style={{ height: `${d.out}%`, backgroundColor: '#ef4444', width: 24, borderRadius: '4px 4px 0 0' }}></div>
                    </div>
                    <span className="bar-label" style={{ position: 'absolute', bottom: -20, width: 52, textAlign: 'center' }}>{d.label}</span>
                  </div>
               ))}
            </div>
          </div>
          
          <div className="chart-box side-chart">
             <h3 className="chart-title">Cấu trúc Doanh thu</h3>
             <div className="pie-chart-mockup">
                <div className="pie-center">
                  <span>Tổng thu</span>
                  <strong>5.4 Tỷ</strong>
                </div>
             </div>
             <ul className="pie-legend">
                <li><span className="dot" style={{background: '#3b82f6'}}></span> Vận hành Shop (45%)</li>
                <li><span className="dot" style={{background: '#10b981'}}></span> Booking KOC (35%)</li>
                <li><span className="dot" style={{background: '#f59e0b'}}></span> Lên Tích xanh (20%)</li>
             </ul>
          </div>
      </div>
    </div>
  );
};
export default FinancialReport;
