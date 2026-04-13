import React from 'react';
import './DataTableView.css';
import { History, Check, Edit, Trash, Type } from 'lucide-react';

const ActivityLogView = () => {
    const logs = [
        { time: '10:30, 11/04/2026', user: 'Bạn (Admin)', action: 'Đã thêm công việc', target: 'Lên tích xanh Doanh nghiệp', type: 'add', icon: <Type size={16} color="#3b82f6"/>, bg: '#eff6ff' },
        { time: '09:15, 11/04/2026', user: 'Lê Mai', action: 'Đã đổi trạng thái', target: 'Booking gói 50 KOC -> Đang Làm', type: 'edit', icon: <Edit size={16} color="#f59e0b"/>, bg: '#fef3c7' },
        { time: '17:00, 10/04/2026', user: 'Bạn (Admin)', action: 'Đã duyệt yêu cầu', target: 'Phiếu chi PC-002', type: 'check', icon: <Check size={16} color="#10b981"/>, bg: '#dcfce7' },
        { time: '16:45, 10/04/2026', user: 'Bạn (Admin)', action: 'Đã xóa tác vụ', target: 'Task Test Lỗi', type: 'delete', icon: <Trash size={16} color="#ef4444"/>, bg: '#fee2e2' },
    ];

  return (
    <div className="data-table-container">
        <header className="board-header">
           <div className="board-breadcrumbs">HỆ THỐNG / LOGS</div>
           <h1 className="board-title">Nhật ký hoạt động hệ thống</h1>
        </header>

        <div style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid #e2e8f0', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {logs.map((log, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ background: log.bg, width: 36, height: 36, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                {log.icon}
                            </div>
                            {i !== logs.length - 1 && <div style={{ width: 2, background: '#e2e8f0', flex: 1, marginTop: 8 }}></div>}
                        </div>
                        <div style={{ paddingBottom: 16 }}>
                            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{log.time}</div>
                            <div style={{ fontSize: 15, color: '#1e293b' }}>
                                <strong style={{ color: '#0f172a' }}>{log.user}</strong> {log.action} <span style={{ fontWeight: 600, color: '#3b82f6'}}>{log.target}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ActivityLogView;
