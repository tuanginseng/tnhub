import React, { useState } from 'react';
import { useTN } from '../../context/TNHoldingContext';
import { PlusCircle, FileText, CheckCircle2, Check, X } from 'lucide-react';

const formatMoney = (val) => new Intl.NumberFormat('vi-VN').format(val) + 'đ';

const TNSales = () => {
   const { customers, deals, apiAddDeal, apiUpdateDeal, apiDeleteDeal, currentUser, users } = useTN();

   // States for form
   const [selectedCustomerId, setSelectedCustomerId] = useState('');
   const [amount, setAmount] = useState('');
   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
   const [isFixFee, setIsFixFee] = useState(false);
   const [fileName, setFileName] = useState('');
   const [editingDealId, setEditingDealId] = useState(null);

   const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

   const isAdmin = currentUser.role === 'admin';
   const saleUsers = users.filter(u => u.role !== 'admin');

   const [selectedUserId, setSelectedUserId] = useState('all');

   const [selectedMonth, setSelectedMonth] = useState(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
   });

   const checkDealMonth = (d, targetMonth) => {
      // Pending deals show up regardless of month so they don't get lost
      if (d.status === 'pending') return true;
      const dealDateToUse = d.status === 'approved' ? (d.approvedDate || d.date) : d.date;
      return dealDateToUse.startsWith(targetMonth);
   };

   const filteredDeals = deals.filter(d => checkDealMonth(d, selectedMonth));

   const displayDeals = isAdmin
      ? (selectedUserId === 'all' ? filteredDeals : filteredDeals.filter(d => d.userId === selectedUserId))
      : filteredDeals.filter(d => d.userId === currentUser.id);

   const handleSubmit = (e) => {
      e.preventDefault();
      if (!selectedCustomerId || !amount || !date) return alert("Vui lòng điền đủ thông tin");

      if (editingDealId) {
         apiUpdateDeal(editingDealId, {
            customerId: selectedCustomerId,
            amount: parseFloat(amount.replace(/\./g, '')),
            date,
            isFixFee: selectedCustomer.service === 'Vận hành shop' ? isFixFee : false,
            service: selectedCustomer.service
         });
         alert("Cập nhật Hợp đồng thành công!");
      } else {
         apiAddDeal({
            userId: currentUser.id,
            customerId: selectedCustomerId,
            amount: parseFloat(amount.replace(/\./g, '')),
            date: date,
            isFixFee: selectedCustomer.service === 'Vận hành shop' ? isFixFee : false,
            service: selectedCustomer.service,
            status: 'pending' // Chờ duyệt
         });
         alert("Thêm Hợp đồng thành công! Chờ Admin duyệt để được tính lương.");
      }

      // Reset
      cancelEdit();
   };

   const cancelEdit = () => {
      setSelectedCustomerId('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsFixFee(false);
      setFileName('');
      setEditingDealId(null);
   };

   const handleEditClick = (deal) => {
      setEditingDealId(deal.id);
      setSelectedCustomerId(deal.customerId);
      setAmount(new Intl.NumberFormat('vi-VN').format(deal.amount));
      setDate(deal.date);
      setIsFixFee(deal.isFixFee);
   };

   const handleDeleteDeal = (id) => {
      if (window.confirm("Bạn có chắc chắn muốn xoá Hợp đồng này không? Khách hàng sẽ không bị xoá, nhưng doanh số sẽ biến mất vĩnh viễn.")) {
         apiDeleteDeal(id);
      }
   };

   const updateStatus = (id, newStatus) => {
      apiUpdateDeal(id, { status: newStatus });
   };

   return (
      <div className="max-w-7xl w-full mx-auto space-y-8 animate-in fade-in duration-500">
         <header>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doanh thu & Hợp Đồng</h1>
            <p className="text-slate-500 mt-1">Cập nhật deal chốt thành công để hệ thống tính KPI (Cần Giám Đốc duyệt)</p>
         </header>

         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">

            {/* Form: nhân viên luôn thấy, admin chỉ thấy khi đang sửa */}
            {(!isAdmin || editingDealId) && (
               <div className="md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-slate-100 bg-white">
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <PlusCircle className="text-blue-600" /> {editingDealId ? (isAdmin ? '✏️ Admin Sửa Hợp Đồng' : 'Chỉnh Sửa Hợp Đồng') : 'Nhập Deal Đã Chốt'}
                     </div>
                     {editingDealId && (
                        <button type="button" onClick={cancelEdit} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded hover:bg-slate-200">Hủy sửa</button>
                     )}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Khách hàng chốt deal</label>
                        <select
                           className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           value={selectedCustomerId}
                           onChange={(e) => setSelectedCustomerId(e.target.value)}
                           required
                        >
                           <option value="">-- Chọn khách hàng --</option>
                           {customers.map(c => (
                              <option key={c.id} value={c.id}>{c.name} ({c.service})</option>
                           ))}
                        </select>
                     </div>

                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Số tiền thực thu (VNĐ)</label>
                        <input
                           type="text"
                           className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Ví dụ: 15.000.000"
                           value={amount}
                           onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              setAmount(val ? new Intl.NumberFormat('vi-VN').format(val) : '');
                           }}
                           required
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Ngày thanh toán</label>
                        <input
                           type="date"
                           className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                           value={date}
                           onChange={(e) => setDate(e.target.value)}
                           required
                        />
                     </div>

                     {selectedCustomer?.service === 'Vận hành shop' && (
                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                           <input
                              type="checkbox"
                              id="fixFee"
                              className="w-4 h-4 text-blue-600 rounded border-gray-300"
                              checked={isFixFee}
                              onChange={(e) => setIsFixFee(e.target.checked)}
                           />
                           <label htmlFor="fixFee" className="text-sm font-semibold text-blue-900 cursor-pointer">
                              Thu phí cứng 6 tháng đầu
                           </label>
                        </div>
                     )}

                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Bản scan Hợp đồng</label>
                        <div className="flex items-center gap-3 relative">
                           <input
                              type="file"
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                              onChange={(e) => setFileName(e.target.files[0]?.name || '')}
                           />
                           <div className="w-full border-2 border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-50 flex flex-col items-center justify-center pointer-events-none data-[has-file=true]:border-emerald-400 data-[has-file=true]:bg-emerald-50" data-has-file={!!fileName}>
                              {fileName ? (
                                 <>
                                    <CheckCircle2 className="text-emerald-500 mb-2" />
                                    <span className="text-sm font-semibold text-emerald-700">{fileName}</span>
                                 </>
                              ) : (
                                 <>
                                    <FileText className="text-slate-400 mb-2" />
                                    <span className="text-sm text-slate-500">Kéo thả file lên</span>
                                 </>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="pt-2">
                        <button type="submit" className={`w-full text-white font-bold py-3 rounded-lg transition-colors shadow-md ${editingDealId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                           {editingDealId ? 'Lưu Thay Đổi' : 'Nộp Báo Cáo'}
                        </button>
                     </div>
                  </form>
               </div>
            )}

            <div className={`p-6 bg-slate-50 border-l border-slate-200 ${(isAdmin && !editingDealId) ? 'w-full' : 'md:w-1/2'}`}>
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-800 relative">
                     {isAdmin ? 'Danh sách Hợp đồng cần Duyệt' : 'Hợp đồng của tôi'}
                     {isAdmin && <span className="absolute -right-24 top-0 text-[10px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Tổng: {deals.filter(d => d.status === 'pending').length} chờ duyệt</span>}
                  </h2>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                     <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="text-xs font-bold text-slate-800 outline-none bg-transparent cursor-pointer" />
                  </div>
               </div>

               {isAdmin && (
                  <div className="flex overflow-x-auto gap-3 mb-6 bg-slate-100/50 p-2 rounded-2xl border border-slate-200">
                     <button
                        onClick={() => setSelectedUserId('all')}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold flex flex-col items-start whitespace-nowrap transition-all duration-300 ${selectedUserId === 'all'
                           ? 'bg-white shadow-sm border border-slate-200 text-blue-600 scale-[1.02]'
                           : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent hover:border-slate-200 border cursor-pointer'
                           }`}
                     >
                        <span>Tất Cả Sales</span>
                        <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded mt-1 w-max tracking-wide ${selectedUserId === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>TỔNG HỢP</span>
                     </button>
                     {saleUsers.map(u => {
                        const pendingCount = deals.filter(d => d.userId === u.id && d.status === 'pending').length;
                        return (
                           <button
                              key={u.id}
                              onClick={() => setSelectedUserId(u.id)}
                              className={`px-4 py-2.5 rounded-xl text-sm font-bold flex flex-col items-start whitespace-nowrap transition-all duration-300 relative ${selectedUserId === u.id
                                 ? 'bg-white shadow-sm border border-slate-200 text-blue-600 scale-[1.02]'
                                 : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent hover:border-slate-200 border cursor-pointer'
                                 }`}
                           >
                              {pendingCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full animate-bounce">{pendingCount}</span>}
                              <span>{u.name}</span>
                              <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded mt-1 w-max tracking-wide ${selectedUserId === u.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>{u.role}</span>
                           </button>
                        )
                     })}
                  </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2">
                  {displayDeals.map(deal => {
                     const c = customers.find(x => x.id === deal.customerId);
                     const u = users.find(x => x.id === deal.userId);

                     let statusBadge = '';
                     if (deal.status === 'approved') statusBadge = <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded uppercase">Đã Duyệt</span>;
                     else if (deal.status === 'rejected') statusBadge = <span className="text-[10px] font-bold text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded uppercase">Bị Huỷ</span>;
                     else statusBadge = <span className="text-[10px] font-bold text-amber-600 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded uppercase animate-pulse">Chờ Duyệt</span>;

                     return (
                        <div key={deal.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative transition-all hover:shadow-md group">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <h4 className="font-bold text-slate-800 text-sm">{c?.name || 'Khách Vãng Lai'}</h4>
                                 {isAdmin && <div className="text-xs text-blue-600 font-semibold mt-1 px-2 py-0.5 bg-blue-50 rounded-md w-max">👤 {u?.name}</div>}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                 <span className="text-sm font-black text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                    + {formatMoney(deal.amount)}
                                 </span>
                                 {statusBadge}
                              </div>
                           </div>
                           <div className="text-xs text-slate-500 mb-2 mt-3">Dịch vụ: <span className="font-semibold text-slate-700">{deal.service}</span></div>
                           <div className="text-xs text-slate-400 flex justify-between items-center border-t pt-3 mt-2">
                              <span>Date: {deal.date}</span>
                              {deal.isFixFee && <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">Phí Cứng</span>}
                           </div>

                           {/* Admin: Duyệt/Từ chối (pending) */}
                           {isAdmin && deal.status === 'pending' && (
                              <div className="mt-3 pt-3 border-t flex gap-2">
                                 <button onClick={() => updateStatus(deal.id, 'approved')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1 text-xs transition-colors shadow-[0_2px_4px_rgba(16,185,129,0.3)]">
                                    <Check size={16} /> Duyệt tính Lương
                                 </button>
                                 <button onClick={() => updateStatus(deal.id, 'rejected')} className="flex-1 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 font-bold py-2 rounded-lg flex items-center justify-center gap-1 text-xs transition-colors">
                                    <X size={16} /> Từ chối
                                 </button>
                              </div>
                           )}

                           {/* Admin: Sửa/Xóa mọi deal */}
                           {isAdmin && (
                              <div className="mt-2 pt-2 border-t border-dashed border-slate-200 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button
                                    onClick={() => handleEditClick(deal)}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors"
                                 >
                                    ✏️ Sửa
                                 </button>
                                 <button
                                    onClick={() => handleDeleteDeal(deal.id)}
                                    className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition-colors"
                                 >
                                    🗑️ Xóa
                                 </button>
                              </div>
                           )}

                           {/* Nhân viên: chỉ sửa/xóa deal pending của mình */}
                           {!isAdmin && deal.status === 'pending' && (
                              <div className="mt-4 pt-3 border-t flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => handleEditClick(deal)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline">Sửa Deal</button>
                                 <button onClick={() => handleDeleteDeal(deal.id)} className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline">Xóa 🗑️</button>
                              </div>
                           )}
                        </div>
                     );
                  })}
                  {displayDeals.length === 0 && <div className="text-slate-400 text-sm italic py-4 text-center">Chưa có hợp đồng nào.</div>}
               </div>
            </div>
         </div>

      </div>
   );
};

export default TNSales;
