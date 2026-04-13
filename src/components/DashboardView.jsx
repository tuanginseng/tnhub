import React from 'react';
import { DollarSign, TrendingUp, Users, Target } from 'lucide-react';
import './DashboardView.css';

const DashboardView = ({ title }) => {
  return (
    <div className="dashboard-container">
       <header className="board-header">
        <div className="board-breadcrumbs">ĐÔNG LƯỜNG / PHÂN TÍCH CHUYÊN SÂU</div>
        <h1 className="board-title">{title}</h1>
      </header>
      
      <div className="stats-grid">
         <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}><DollarSign size={24} /></div>
            <div className="stat-details">
               <span className="stat-title">Doanh Thu Q2</span>
               <span className="stat-value">2,450 Triệu ₫</span>
               <span className="stat-trend positive">+12.5% so với tháng trước</span>
            </div>
         </div>
         <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}><TrendingUp size={24} /></div>
            <div className="stat-details">
               <span className="stat-title">Tỉ lệ Chuyển Đổi</span>
               <span className="stat-value">18.2%</span>
               <span className="stat-trend positive">+2.1% so với tháng trước</span>
            </div>
         </div>
         <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}><Users size={24} /></div>
            <div className="stat-details">
               <span className="stat-title">Lead Tự Nhiên</span>
               <span className="stat-value">4,521 Lead</span>
               <span className="stat-trend negative">-5.4% do ngưng Ads FB</span>
            </div>
         </div>
         <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}><Target size={24} /></div>
            <div className="stat-details">
               <span className="stat-title">OKRs Đạt Được</span>
               <span className="stat-value">72%</span>
               <span className="stat-trend positive">Đang bám sát Roadmap</span>
            </div>
         </div>
      </div>

      <div className="charts-area">
          <div className="chart-box main-chart">
            <h3 className="chart-title">Biểu đồ tăng trưởng 30 ngày</h3>
            <div className="mock-chart-container">
               {/* Giả lập thanh đồ thị sinh động */}
               {[40, 60, 50, 80, 70, 95, 65, 85, 100, 90].map((h, i) => (
                  <div key={i} className="bar-wrapper">
                    <div className="bar" style={{ height: `${h}%` }}></div>
                    <span className="bar-label">{i+1}/4</span>
                  </div>
               ))}
            </div>
          </div>
          
          <div className="chart-box side-chart">
             <h3 className="chart-title">Phân bổ tỷ trọng Nguồn Ngân Sách</h3>
             <div className="pie-chart-mockup">
                <div className="pie-slice"></div>
                <div className="pie-center">
                  <span>Tổng</span>
                  <strong>100%</strong>
                </div>
             </div>
             <ul className="pie-legend">
                <li><span className="dot" style={{background: '#3b82f6'}}></span> Facebook Ads (45%)</li>
                <li><span className="dot" style={{background: '#10b981'}}></span> Tiktok KOC (35%)</li>
                <li><span className="dot" style={{background: '#f59e0b'}}></span> Shopee (20%)</li>
             </ul>
          </div>
      </div>
    </div>
  );
};

export default DashboardView;
