import React from 'react';
import { Activity, AlertCircle, Zap, DollarSign } from 'lucide-react';
import './DashboardView.css';

const DashboardCenter = () => {
  return (
    <div className="dashboard-container">
       <header className="board-header">
        <div className="board-breadcrumbs">ĐIỀU HÀNH / TRUNG TÂM</div>
        <h1 className="board-title">Trung tâm điều hành</h1>
      </header>
      
      <div className="stats-grid">
         <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}><Activity size={24} /></div>
            <div className="stat-details">
               <span className="stat-title">Trạng thái hệ thống</span>
               <span className="stat-value">Ổn định</span>
               <span className="stat-trend positive">99.9% Uptime</span>
            </div>
         </div>
         <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}><AlertCircle size={24} /></div>
            <div className="stat-details">
               <span className="stat-title">Cảnh báo TK Cáo</span>
               <span className="stat-value">2 TK</span>
               <span className="stat-trend negative">Sắp hết ngân sách</span>
            </div>
         </div>
         <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fef9c3', color: '#eab308' }}><Zap size={24} /></div>
            <div className="stat-details">
               <span className="stat-title">Tốc độ xử lý Yêu cầu</span>
               <span className="stat-value">1.5h</span>
               <span className="stat-trend positive">Nhanh hơn 30%</span>
            </div>
         </div>
         <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#22c55e' }}><DollarSign size={24} /></div>
            <div className="stat-details">
               <span className="stat-title">Lợi nhuận gộp (Ước tính)</span>
               <span className="stat-value">~15.2%</span>
               <span className="stat-trend positive">Bình ổn</span>
            </div>
         </div>
      </div>

      <div className="charts-area">
          <div className="chart-box main-chart">
            <h3 className="chart-title">Nhịp đập hoạt động toàn phòng Sale (Real-time)</h3>
            <div className="mock-chart-container" style={{ alignItems: 'center', justifyContent: 'space-around'}}>
               {[60, 45, 80, 50, 90, 70, 85, 40, 60, 100, 75, 50].map((h, i) => (
                  <div key={i} className="bar-wrapper" style={{ flex: 'none', width: '20px' }}>
                    <div className="bar" style={{ height: `${h}%`, backgroundColor: i%2===0 ? '#3b82f6': '#93c5fd', borderRadius: 10 }}></div>
                  </div>
               ))}
            </div>
          </div>
      </div>
    </div>
  );
};
export default DashboardCenter;
