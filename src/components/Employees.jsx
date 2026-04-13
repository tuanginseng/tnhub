import React from 'react';
import './DataTableView.css';

const Employees = () => {
    const emps = [
        { id: "EMP-001", name: "Trần Văn Hùng", role: "Trưởng phòng Sale", dep: "Khối Sale VN", email: "hung.tv@congty.com", status: "Làm việc" },
        { id: "EMP-002", name: "Vũ Minh Tuấn", role: "Chuyên viên Phân tích", dep: "Khối Vận hành", email: "tuan.vm@congty.com", status: "Làm việc" },
        { id: "EMP-003", name: "Lê Mai", role: "KOC Manager", dep: "Khối KOC Booking", email: "mai.le@congty.com", status: "Làm việc" },
        { id: "EMP-004", name: "Nguyễn Vũ", role: "Trưởng phòng Ops", dep: "Khối Vận hành", email: "vu.nguyen@congty.com", status: "Nghỉ phép" }
    ];

  return (
    <div className="data-table-container">
        <header className="board-header">
           <div className="board-breadcrumbs">QUẢN TRỊ NHÂN SỰ</div>
           <h1 className="board-title">Danh sách Nhân viên</h1>
        </header>

        <div className="table-wrapper">
            <table className="info-table">
               <thead>
                 <tr>
                    <th>Mã NV</th>
                    <th>Nhân viên</th>
                    <th>Chức vụ</th>
                    <th>Phòng ban</th>
                    <th>Email</th>
                    <th>Trạng thái</th>
                 </tr>
               </thead>
               <tbody>
                  {emps.map(e => (
                     <tr key={e.id}>
                        <td style={{ color: '#94a3b8'}}>{e.id}</td>
                        <td style={{ fontWeight: 500, color: '#1e293b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                               <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                                 {e.name.charAt(0)}
                               </div>
                               {e.name}
                            </div>
                        </td>
                        <td>{e.role}</td>
                        <td>{e.dep}</td>
                        <td>{e.email}</td>
                        <td><span className={`status-pill ${e.status === 'Làm việc' ? 'active' : 'pending'}`}>{e.status}</span></td>
                     </tr>
                  ))}
               </tbody>
            </table>
        </div>
    </div>
  );
};
export default Employees;
