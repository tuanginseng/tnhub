import React from 'react';
import './DataTableView.css';

const Payroll = () => {
  return (
    <div className="data-table-container">
        <header className="board-header">
           <div className="board-breadcrumbs">TÀI CHÍNH / KẾ TOÁN</div>
           <h1 className="board-title">Bảng lương Tháng 4/2026</h1>
        </header>

        <div className="table-wrapper">
            <table className="info-table">
               <thead>
                 <tr>
                    <th>Nhân viên</th>
                    <th>Ngày công chuẩn</th>
                    <th>Lương Cơ Bản</th>
                    <th>Hoa hồng Sale</th>
                    <th>Phụ cấp</th>
                    <th>Thực nhận (Net)</th>
                 </tr>
               </thead>
               <tbody>
                  <tr>
                     <td style={{ fontWeight: 500 }}>Trần Văn Hùng</td>
                     <td>22/22</td>
                     <td>12,000,000 ₫</td>
                     <td style={{ color: '#16a34a', fontWeight: 600 }}>+ 45,500,000 ₫</td>
                     <td>500,000 ₫</td>
                     <td style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>58,000,000 ₫</td>
                  </tr>
                  <tr>
                     <td style={{ fontWeight: 500 }}>Vũ Minh Tuấn</td>
                     <td>20/22</td>
                     <td>15,000,000 ₫</td>
                     <td style={{ color: '#16a34a', fontWeight: 600 }}>+ 5,000,000 ₫</td>
                     <td>0 ₫</td>
                     <td style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>18,636,363 ₫</td>
                  </tr>
               </tbody>
            </table>
        </div>
    </div>
  );
};
export default Payroll;
