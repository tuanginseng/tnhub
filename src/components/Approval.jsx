import React from 'react';
import './DataTableView.css';

const Approval = () => {
  return (
    <div className="data-table-container">
        <header className="board-header">
           <div className="board-breadcrumbs">ADMIN / PHÊ DUYỆT</div>
           <h1 className="board-title">Duyệt Báo Cáo & Yêu cầu</h1>
        </header>

        <div className="table-wrapper">
            <table className="info-table">
               <thead>
                 <tr>
                    <th>Yêu Cầu Từ</th>
                    <th>Loại Yêu Cầu</th>
                    <th>Chi Tiết</th>
                    <th>Thời gian gửi</th>
                    <th>Hành động</th>
                 </tr>
               </thead>
               <tbody>
                  <tr>
                     <td style={{ fontWeight: 500 }}>Vũ Minh Tuấn</td>
                     <td>Báo cáo doanh số</td>
                     <td>Báo cáo T4 đã hoàn tất đính kèm file Excel</td>
                     <td>2 giờ trước</td>
                     <td>
                        <button style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', marginRight: 8 }}>Duyệt</button>
                        <button style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>Từ chối</button>
                     </td>
                  </tr>
                  <tr>
                     <td style={{ fontWeight: 500 }}>Nguyễn Vũ</td>
                     <td>Nghỉ phép</td>
                     <td>Xin đi khám mắt 1 buổi sáng (14/04)</td>
                     <td>5 giờ trước</td>
                     <td>
                        <button style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', marginRight: 8 }}>Duyệt</button>
                        <button style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>Từ chối</button>
                     </td>
                  </tr>
               </tbody>
            </table>
        </div>
    </div>
  );
};
export default Approval;
