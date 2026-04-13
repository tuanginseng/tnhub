import React from 'react';
import { Users, LayoutGrid } from 'lucide-react';
// Re-using general styles

const Departments = () => {
    const deps = [
        { name: "Khối Sale (Thị trường VN)", head: "Trần Văn Hùng", headcount: 12, budget: "500M" },
        { name: "Khối Sale (Thị trường Global)", head: "Lisa Nguyễn", headcount: 8, budget: "1.2B" },
        { name: "Khối KOC Booking", head: "Lê Mai", headcount: 25, budget: "3.5B" },
        { name: "Khối Vận hành (Ops)", head: "Nguyễn Vũ", headcount: 10, budget: "300M" }
    ];

    return (
       <div style={{ padding: '24px 32px', height: '100%', overflow: 'auto' }}>
           <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1e293b', marginBottom: 24 }}>Phòng ban phân bổ</h1>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
               {deps.map((d, i) => (
                   <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                           <div style={{ background: '#f1f5f9', padding: 12, borderRadius: 12 }}><LayoutGrid color="#3b82f6" /></div>
                           <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>Active</span>
                       </div>
                       <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>{d.name}</h3>
                       <div style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>Trưởng phòng: <strong style={{ color: '#1e293b'}}>{d.head}</strong></div>
                       <div style={{ display: 'flex', gap: 16, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                           <div style={{ flex: 1 }}>
                               <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Nhân sự</div>
                               <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14}/> {d.headcount}</div>
                           </div>
                           <div style={{ flex: 1 }}>
                               <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Ngân sách Quý</div>
                               <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>{d.budget}</div>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
       </div>
    );
};
export default Departments;
