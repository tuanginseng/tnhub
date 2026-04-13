import React from 'react';
import './DashboardView.css';
import { LineChart, TrendingUp } from 'lucide-react';

const Forecast = () => {
  return (
    <div className="dashboard-container">
       <header className="board-header">
        <div className="board-breadcrumbs">ĐIỀU HÀNH / DỰ BÁO</div>
        <h1 className="board-title">Dự báo lương thưởng & Tích luỹ</h1>
      </header>
      
      <div className="charts-area">
          <div className="chart-box main-chart" style={{ gridColumn: 'span 2' }}>
             <h3 className="chart-title">AI Dự đoán quỹ lương (Baseline vs Sales Bonus) 6 tháng tới</h3>
             <div className="mock-chart-container" style={{ height: 350, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
                {[
                  { month: 'T5', base: 40, bonus: 20 },
                  { month: 'T6', base: 40, bonus: 35 },
                  { month: 'T7', base: 45, bonus: 50 },
                  { month: 'T8', base: 45, bonus: 40 },
                  { month: 'T9', base: 50, bonus: 60 },
                  { month: 'T10', base: 50, bonus: 70 },
                ].map(d => (
                   <div key={d.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 4 }}>
                      <div style={{ width: 40, background: '#10b981', height: `${d.bonus}%`, borderRadius: '4px 4px 0 0' }}></div>
                      <div style={{ width: 40, background: '#cbd5e1', height: `${d.base}%`, borderRadius: '4px 4px 0 0' }}></div>
                      <span style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>{d.month}</span>
                   </div>
                ))}
             </div>
             <div style={{ display: 'flex', gap: 16, marginTop: 16, justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><div style={{ width: 12, height: 12, background: '#cbd5e1', borderRadius: 2 }}></div> Lương Cứng</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><div style={{ width: 12, height: 12, background: '#10b981', borderRadius: 2 }}></div> Hoa Hồng Chốt Sale</div>
             </div>
          </div>
      </div>
    </div>
  );
};
export default Forecast;
