import React, { useState, useEffect } from 'react';
import './DataTableView.css';
import { supabase } from '../lib/supabase';
import { Target, PlusCircle, Edit, Trash, Loader2 } from 'lucide-react';
import AddTargetModal from './AddTargetModal';

const PlanVsActual = () => {
  const [targets, setTargets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);

  useEffect(() => {
     fetchTargets();
  }, []);

  const fetchTargets = async () => {
     setIsLoading(true);
     const { data, error } = await supabase
        .from('business_targets')
        .select('*, assignee:employees(name, avatar)');
     
     if (data) setTargets(data);
     setIsLoading(false);
  };

  const handleDelete = async (id) => {
     if(window.confirm('Bạn có chắc xoá chỉ tiêu này không?')) {
        await supabase.from('business_targets').delete().eq('id', id);
        setTargets(targets.filter(t => t.id !== id));
     }
  };

  const handleOpenEdit = (target) => {
     setEditingTarget(target);
     setIsModalOpen(true);
  };

  const handleSaveModal = (newTargetData) => {
     if (editingTarget) {
         setTargets(prev => prev.map(t => t.id === newTargetData.id ? newTargetData : t));
     } else {
         setTargets(prev => [...prev, newTargetData]);
     }
     setIsModalOpen(false);
     setEditingTarget(null);
  };

  // UI Helper
  const formatMoney = (n) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
  
  const renderTableRow = (t) => {
      const percentage = (t.actual_value / t.target_value) * 100;
      let statusClass = 'pending';
      let statusText = 'Chưa đạt';
      let gap = t.actual_value - t.target_value;
      
      if (percentage >= 100) {
         statusClass = 'active';
         statusText = 'Vượt chỉ tiêu';
      } else if (percentage === 100) {
         statusClass = 'info';
         statusText = 'Hoàn thành';
      }

      return (
         <tr key={t.id}>
            <td style={{ fontWeight: 500, color: '#1e293b' }}>
               {t.title}
               <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                   Kỳ: {t.month} | Phân bổ: {t.assignment_type === 'department' ? `Tập thể ${t.department_name}` : `Cá nhân (${t.assignee?.name})`}
               </div>
            </td>
            <td style={{ fontWeight: 600 }}>{formatMoney(t.target_value)}</td>
            <td style={{ fontWeight: 600, color: '#6366f1' }}>{formatMoney(t.actual_value)}</td>
            <td style={{ color: gap >= 0 ? '#16a34a' : '#ef4444' }}>
                {gap >= 0 ? '+' : ''}{formatMoney(gap)}
            </td>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ background: '#e2e8f0', width: 90, height: 8, borderRadius: 4, overflow: 'hidden' }}>
                       <div style={{ background: percentage >= 100 ? '#16a34a' : '#f59e0b', width: `${Math.min(percentage, 100)}%`, height: '100%' }}></div>
                   </div>
                   <span style={{ fontSize: 13, fontWeight: 600 }}>{percentage.toFixed(0)}%</span>
                </div>
            </td>
            <td><span className={`status-pill ${statusClass}`}>{statusText}</span></td>
            <td>
               <div style={{ display: 'flex', gap: 8 }}>
                   <button 
                     onClick={() => handleOpenEdit(t)} 
                     style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: 6, borderRadius: 6, cursor: 'pointer', color: '#3b82f6' }}
                    >
                      <Edit size={16} />
                   </button>
                   <button 
                     onClick={() => handleDelete(t.id)} 
                     style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 6, borderRadius: 6, cursor: 'pointer', color: '#ef4444' }}
                    >
                      <Trash size={16} />
                   </button>
               </div>
            </td>
         </tr>
      )
  };

  // Tách làm 2 nhóm hiển thị
  const deptTargets = targets.filter(t => t.assignment_type === 'department');
  const empTargets = targets.filter(t => t.assignment_type === 'employee');

  return (
    <div className="data-table-container">
        <header className="board-header">
           <div className="board-breadcrumbs">ĐIỀU HÀNH / CHỈ TIÊU</div>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h1 className="board-title">Kế hoạch vs Thực tế</h1>
                  {isLoading && <Loader2 className="animate-spin" size={16} color="#64748b"/>}
               </div>
               <button 
                 className="tb-btn primary" 
                 style={{ borderRadius: 24 }}
                 onClick={() => { setEditingTarget(null); setIsModalOpen(true); }}
               >
                  <PlusCircle size={18}/> Thêm Kế Hoạch 
               </button>
           </div>
        </header>

        {targets.length === 0 && !isLoading && (
            <div style={{ textAlign: 'center', padding: '64px', background: 'white', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                <Target size={48} color="#cbd5e1" style={{ margin: '0 auto', marginBottom: 16 }} />
                <h3 style={{ color: '#475569', marginBottom: 8}}>Hệ thống CSDL Supabase chưa có Kế hoạch nào.</h3>
                <p style={{ color: '#94a3b8', fontSize: 13}}>Bấm nút Thêm Kế Hoạch bên trên để truyền chỉ tiêu cho các đội nhóm!</p>
            </div>
        )}

        {targets.length > 0 && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
               
               {/* ZONE: DEPARTMENT */}
               {deptTargets.length > 0 && (
                  <div className="table-wrapper">
                      <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b' }}>
                          🏢 Chỉ tiêu Tập thể / Phòng ban
                      </div>
                      <table className="info-table">
                         <thead>
                           <tr>
                              <th>Hạng Mục Doanh Thu</th>
                              <th>Target (Số Mời)</th>
                              <th>Thực tế (Live)</th>
                              <th>Chênh lệch</th>
                              <th>Tiến trình</th>
                              <th>Trạng thái</th>
                              <th>Hành động</th>
                           </tr>
                         </thead>
                         <tbody>{deptTargets.map(renderTableRow)}</tbody>
                      </table>
                  </div>
               )}

               {/* ZONE: EMPLOYEE */}
               {empTargets.length > 0 && (
                  <div className="table-wrapper">
                      <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b' }}>
                          👨‍💻 Khoán Chỉ tiêu cho Cá nhân
                      </div>
                      <table className="info-table">
                         <thead>
                           <tr>
                              <th>Hạng Mục Doanh Thu</th>
                              <th>Target Khâm Định</th>
                              <th>Thực tế Sale bán</th>
                              <th>Chênh lệch</th>
                              <th>Tiến trình</th>
                              <th>Trạng thái</th>
                              <th>Hành động</th>
                           </tr>
                         </thead>
                         <tbody>{empTargets.map(renderTableRow)}</tbody>
                      </table>
                  </div>
               )}
           </div>
        )}

        {isModalOpen && (
           <AddTargetModal 
              editingTarget={editingTarget}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveModal}
           />
        )}
    </div>
  );
};
export default PlanVsActual;
