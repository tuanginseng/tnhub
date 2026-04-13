import React from 'react';
import './DataTableView.css';
import { CreditCard, Download } from 'lucide-react';

const ExpenseManage = () => {
  return (
    <div className="data-table-container">
        <header className="board-header">
           <div className="board-breadcrumbs">ĐIỀU HÀNH / CHI PHÍ</div>
           <h1 className="board-title">Quản lý chi phí (Hoạt động)</h1>
           <div className="table-actions">
              <button className="tb-btn primary"><CreditCard size={16}/> Tạo Phiếu Chi Mới</button>
           </div>
        </header>

        <div className="table-wrapper">
            <table className="info-table">
               <thead>
                 <tr>
                    <th>ID Phiếu</th>
                    <th>Khoản Mục</th>
                    <th>Người đề nghị</th>
                    <th>Số Tiền</th>
                    <th>Ngày chi</th>
                    <th>Trạng thái</th>
                 </tr>
               </thead>
               <tbody>
                  <tr>
                     <td style={{ color: '#94a3b8' }}>PC-001</td>
                     <td style={{ fontWeight: 500 }}>Thanh toán booking KOC Hè 2</td>
                     <td>Lê Mai</td>
                     <td style={{ fontWeight: 600 }}>150,000,000 ₫</td>
                     <td>12-04-2026</td>
                     <td><span className="status-pill pending">Chờ Kế toán</span></td>
                  </tr>
                  <tr>
                     <td style={{ color: '#94a3b8' }}>PC-002</td>
                     <td style={{ fontWeight: 500 }}>Nạp ngân sách Ads Facebook</td>
                     <td>Phạm Tuấn</td>
                     <td style={{ fontWeight: 600 }}>50,000,000 ₫</td>
                     <td>10-04-2026</td>
                     <td><span className="status-pill active">Đã Chi</span></td>
                  </tr>
               </tbody>
            </table>
        </div>
    </div>
  );
};
export default ExpenseManage;
