import React from 'react';
import { X, Trash2, Calendar, User, Tag } from 'lucide-react';

const TaskDetailModal = ({ task, onClose, onDelete }) => {
  if (!task) return null;

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tác vụ này không?')) {
      onDelete(task.id);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '500px' }}>
        <div className="modal-header">
          <h2>Chi tiết Công việc</h2>
          <button className="close-btn" onClick={onClose}><X size={20}/></button>
        </div>
        
        <div className="modal-form">
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '16px', lineHeight: 1.4 }}>
            {task.title}
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
             <span className={`badge priority ${task.priority === 'Cao' ? 'high' : 'medium'}`}>{task.priority}</span>
             <span className="badge points">{task.points}</span>
             <span className="badge category">{task.category}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <User size={16} color="#64748b" />
               <span style={{ fontSize: '14px', color: '#64748b', width: '100px' }}>Phân công:</span>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div className="assignee-avatar" style={{ backgroundColor: task.assignee.color || '#3b82f6', width: 24, height: 24, fontSize: 11 }}>
                   {task.assignee.avatar}
                 </div>
                 <span style={{ fontSize: '14px', fontWeight: 500 }}>{task.assignee.name}</span>
               </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Calendar size={16} color="#64748b" />
               <span style={{ fontSize: '14px', color: '#64748b', width: '100px' }}>Đến hạn:</span>
               <span style={{ fontSize: '14px', fontWeight: 500 }}>{task.dueDate}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Tag size={16} color="#64748b" />
               <span style={{ fontSize: '14px', color: '#64748b', width: '100px' }}>Trạng thái:</span>
               <span style={{ fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>
                  {task.status === 'done' ? 'Hoàn thành' : task.status === 'in-progress' ? 'Đang làm' : 'Chờ làm'}
               </span>
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', justifyContent: 'space-between' }}>
            <button type="button" className="btn-cancel" style={{ color: '#ef4444', borderColor: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleDelete}>
               <Trash2 size={16} /> Xóa công việc
            </button>
            <button type="button" className="btn-save" onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
