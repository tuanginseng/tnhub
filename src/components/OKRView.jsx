import React from 'react';
import { Target, CheckCircle } from 'lucide-react';
import './DashboardView.css';

const OKRView = () => {
    const okrs = [
        {
            obj: "Đạt mốc doanh số 10 Tỷ VNĐ / Tháng trong Hè",
            progress: 75,
            krs: [
                { name: "Đạt 5 Tỷ từ luồng Booking KOC", progress: 80 },
                { name: "Mở mới 20 hợp đồng TKQC Hoàn Tín", progress: 60 },
                { name: "Duy trì tỷ lệ hoàn trả mức < 5%", progress: 100 }
            ]
        },
        {
            obj: "Nâng cấp chất lượng dịch vụ vận hành gian hàng",
            progress: 40,
            krs: [
                { name: "Đạt tỷ lệ hài lòng KH 4.8/5", progress: 50 },
                { name: "Hoàn tất check list 10 Shop mới trong 24h", progress: 30 }
            ]
        }
    ];

  return (
    <div className="dashboard-container">
       <header className="board-header">
        <div className="board-breadcrumbs">CHIẾN LƯỢC / OKR</div>
        <h1 className="board-title">Tổng quan OKR Toàn Công ty</h1>
      </header>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {okrs.map((okr, index) => (
             <div key={index} style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24}}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                         <Target size={24} color="#3b82f6" />
                         <h2 style={{ fontSize: 18, color: '#1e293b' }}>Objective: {okr.obj}</h2>
                     </div>
                     <span style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>{okr.progress}%</span>
                 </div>
                 
                 {/* Main Progress Bar */}
                 <div style={{ width: '100%', height: 12, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden', marginBottom: 24 }}>
                     <div style={{ width: `${okr.progress}%`, height: '100%', background: '#3b82f6' }}></div>
                 </div>

                 <div style={{ paddingLeft: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
                     {okr.krs.map((kr, idx) => (
                         <div key={idx}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
                                 <span style={{ fontSize: 14, color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <CheckCircle size={14} color="#10b981" /> Kr: {kr.name}
                                 </span>
                                 <span style={{ fontSize: 13, fontWeight: 600 }}>{kr.progress}%</span>
                             </div>
                             <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                 <div style={{ width: `${kr.progress}%`, height: '100%', background: '#10b981' }}></div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
          ))}
      </div>
    </div>
  );
};
export default OKRView;
