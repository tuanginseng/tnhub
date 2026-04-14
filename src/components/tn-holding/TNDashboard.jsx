import React, { useState } from 'react';
import { useTN } from '../../context/TNHoldingContext';
import { Trophy, Lock, Unlock, Flame, TrendingUp, Medal, BarChart3, Activity, X, CheckCircle, Calendar, User } from 'lucide-react';

const formatMoney = (val) => new Intl.NumberFormat('vi-VN').format(val) + 'đ';

const TNDashboard = ({ setActiveMenu }) => {
   const { currentUser, deals, users, targetKPI, customers } = useTN();
   const isAdmin = currentUser.role === 'admin';
   const target = targetKPI;

   const [showRevenueModal, setShowRevenueModal] = useState(false);

   const [selectedMonth, setSelectedMonth] = useState(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
   });

   const checkDealMonth = (d, targetMonth) => {
      const dealDateToUse = d.status === 'approved' ? (d.approvedDate || d.date) : d.date;
      return dealDateToUse.startsWith(targetMonth);
   };

   const filteredDeals = deals.filter(d => checkDealMonth(d, selectedMonth));
   const monthDisplay = selectedMonth.split('-')[1] + '/' + selectedMonth.split('-')[0];

   // TÍNH BẢNG LEADERBOARD (Áp dụng cho mọi Roles)
   // Chỉ cộng những deals đã 'approved'
   const leaderBoard = users.filter(u => u.role !== 'admin').map(user => {
      const userDeals = filteredDeals.filter(d => d.userId === user.id && d.status === 'approved');
      const rev = userDeals.reduce((sum, d) => sum + d.amount, 0);
      return { ...user, rev };
   }).sort((a, b) => b.rev - a.rev).slice(0, 5);

   const totalAgencyRevenue = leaderBoard.reduce((sum, lb) => sum + lb.rev, 0);

   if (isAdmin) {
      return (
         <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
               <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tổng Quan Điều Hành</h1>
                  <p className="text-slate-500 mt-1">Dữ liệu Doanh số ghi nhận sau khi Giám đốc phê duyệt thành công.</p>
               </div>
               <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm w-max">
                  <span className="text-sm font-semibold text-slate-500 mr-2">Tháng:</span>
                  <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="text-sm font-bold text-slate-800 outline-none bg-transparent cursor-pointer" />
               </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               <div
                  onClick={() => setShowRevenueModal(true)}
                  className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden cursor-pointer hover:from-slate-800 hover:to-slate-700 transition-all group"
               >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl -mr-20 -mt-20 opacity-30 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative z-10">
                     <div className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                        <BarChart3 size={18} /> Tổng Doanh số {monthDisplay} (Đã duyệt)
                     </div>
                     <div className="text-4xl font-black">{formatMoney(totalAgencyRevenue)}</div>
                     <div className="text-blue-400 text-xs mt-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity">👆 Nhấn để xem chi tiết hợp đồng</div>
                  </div>
               </div>

               <div
                  onClick={() => setActiveMenu && setActiveMenu('Bán Hàng')}
                  className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-center cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
               >
                  <div className="text-slate-500 font-semibold mb-2 flex items-center gap-2 group-hover:text-amber-600 transition-colors">
                     <Activity size={18} className="text-amber-500 group-hover:scale-110 transition-transform" /> Deals Chờ Duyệt (Pending)
                  </div>
                  <div className="text-4xl font-black text-amber-600">
                     {filteredDeals.filter(d => d.status === 'pending').length} <span className="text-lg font-medium text-slate-400">Hợp đồng</span>
                  </div>
               </div>
            </div>

            <LeaderBoard leaderBoard={leaderBoard} monthDisplay={monthDisplay} />

            {/* Modal Doanh thu */}
            {showRevenueModal && (
               <RevenueModal
                  deals={filteredDeals.filter(d => d.status === 'approved')}
                  users={users}
                  customers={customers}
                  monthDisplay={monthDisplay}
                  totalRevenue={totalAgencyRevenue}
                  onClose={() => setShowRevenueModal(false)}
               />
            )}
         </div>
      );
   }

   // TÍNH TIẾN TRÌNH CHO SALE (Duy trì code cũ nhưng lọc d.status === 'approved')
   const myDeals = filteredDeals.filter(d => d.userId === currentUser.id && d.status === 'approved');
   const myRevenue = myDeals.reduce((sum, d) => sum + d.amount, 0);

   const displayPercent = ((myRevenue / target) * 100).toFixed(1);
   const progressWidth = Math.min((myRevenue / target) * 100, 100);
   const isUnlocked = myRevenue >= target;

   return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 mb-16">
         <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gamification Dashboard</h1>
               <p className="text-slate-500 mt-1">Hệ thống tính điểm từ những Deal được duyệt trong tháng {monthDisplay}.</p>
            </div>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm w-max">
               <span className="text-sm font-semibold text-slate-500 mr-2">Tháng:</span>
               <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="text-sm font-bold text-slate-800 outline-none bg-transparent cursor-pointer" />
            </div>
         </header>

         {/* TIẾN TRÌNH KPI BẢN THÂN */}
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
               <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                     <TargetIcon /> Mục tiêu Cá Nhân (Quota)
                  </h2>
                  <div className="text-sm text-slate-500 font-medium mt-1">Nhân sự: <span className="text-blue-600">{currentUser.name}</span></div>
               </div>
               <div className="text-right">
                  <div className="text-3xl font-black text-slate-900">{formatMoney(myRevenue)}</div>
                  <div className="text-sm font-semibold text-slate-400">/ {formatMoney(target)}</div>
               </div>
            </div>

            <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner">
               <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                  style={{ width: `${progressWidth}%` }}
               >
                  {progressWidth > 5 && <Flame size={14} className="text-white animate-pulse" />}
               </div>
            </div>

            <div className="mt-4 flex justify-between text-sm font-medium">
               <span className="text-slate-500">Đã đạt: <strong className="text-slate-800">{displayPercent}%</strong></span>
               {isUnlocked ? (
                  <span className="text-emerald-500 flex items-center gap-1"><Trophy size={16} /> Đã Mở Khóa Đặc Quyền!</span>
               ) : (
                  <span className="text-amber-500">Còn thiếu {formatMoney(target - myRevenue)} để Unlock Đặc quyền</span>
               )}
            </div>
         </div>

         {/* ĐẶC QUYỀN UNLOCK */}
         <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Trophy className="text-amber-500" /> Thưởng Thêm (Super Bonus)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

               {/* BLOCK TÍCH XANH */}
               <div className={`relative rounded-2xl overflow-hidden border p-6 transition-all duration-500 ${isUnlocked ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  {!isUnlocked && (
                     <div className="absolute inset-0 backdrop-blur-[2px] bg-white/40 flex flex-col items-center justify-center z-10">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white shadow-lg mb-3">
                           <Lock size={20} />
                        </div>
                        <span className="font-semibold text-slate-800">Khóa Đặc Quyền</span>
                        <span className="text-xs text-slate-500 mt-1">Đạt 120tr để Mở Khóa</span>
                     </div>
                  )}
                  <div className="flex items-start justify-between relative z-0">
                     <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1 flex items-center gap-1">
                           {isUnlocked && <Unlock size={14} />} BONUS
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Dự án Tích Xanh</h3>
                        <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                           Nhận thưởng hoa hồng trực tiếp khi bán gói Tích xanh.
                        </p>
                     </div>
                     <div className="bg-white px-4 py-2 rounded-xl text-center shadow-sm border border-emerald-100">
                        <div className="text-xs text-slate-400 font-semibold uppercase">Thưởng nóng</div>
                        <div className="text-lg font-black text-emerald-600">+3Tr / gói</div>
                     </div>
                  </div>
               </div>

               {/* BLOCK HOÀN TÍN */}
               <div className={`relative rounded-2xl overflow-hidden border p-6 transition-all duration-500 ${isUnlocked ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                  {!isUnlocked && (
                     <div className="absolute inset-0 backdrop-blur-[2px] bg-white/40 flex flex-col items-center justify-center z-10">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white shadow-lg mb-3">
                           <Lock size={20} />
                        </div>
                        <span className="font-semibold text-slate-800">Khóa Đặc Quyền</span>
                        <span className="text-xs text-slate-500 mt-1">Đạt 120tr để Mở Khóa</span>
                     </div>
                  )}
                  <div className="flex items-start justify-between relative z-0">
                     <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1 flex items-center gap-1">
                           {isUnlocked && <Unlock size={14} />} SUPER BONUS
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">TK Hoàn Tín</h3>
                        <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                           Bán gói Tài khoản Quảng cáo có bảo hành.
                        </p>
                     </div>
                     <div className="bg-white px-4 py-2 rounded-xl text-center shadow-sm border border-indigo-100">
                        <div className="text-xs text-slate-400 font-semibold uppercase">Thưởng nóng</div>
                        <div className="text-lg font-black text-indigo-600">+500K / TK</div>
                     </div>
                  </div>
               </div>

            </div>
         </div>

         <LeaderBoard leaderBoard={leaderBoard} monthDisplay={monthDisplay} />
      </div>
   );
};

const LeaderBoard = ({ leaderBoard, monthDisplay }) => (
   <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
         <TrendingUp className="text-blue-500" /> Bảng Vinh Danh Tháng {monthDisplay}
      </h2>
      <div className="space-y-4">
         {leaderBoard.map((lb, idx) => (
            <div key={lb.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md
                     ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-600' : 'bg-slate-200 text-slate-600'}`}>
                     {idx < 3 ? <Medal size={20} /> : idx + 1}
                  </div>
                  <div>
                     <div className="font-bold text-slate-800 flex items-center gap-2">
                        {lb.name}
                        {idx === 0 && <span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-600 uppercase font-black tracking-wider">Top 1</span>}
                     </div>
                     <div className="text-xs text-slate-500 mt-0.5">{lb.role} - {lb.title}</div>
                  </div>
               </div>
               <div className="text-right">
                  <div className="font-bold text-lg text-emerald-600">{formatMoney(lb.rev)}</div>
               </div>
            </div>
         ))}
      </div>
   </div>
);

const TargetIcon = () => (
   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
);

const RevenueModal = ({ deals, users, customers, monthDisplay, totalRevenue, onClose }) => {
   const getUserName = (userId) => users.find(u => u.id === userId)?.name || 'Ẩn danh';
   const getCustomerName = (customerId) => customers.find(c => c.id === customerId)?.name || null;

   return (
      <div
         className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
         onClick={onClose}
      >
         <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
         >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between flex-shrink-0">
               <div>
                  <div className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                     <CheckCircle size={13} /> Hợp đồng đã duyệt
                  </div>
                  <h2 className="text-white text-xl font-bold">Doanh Thu Tháng {monthDisplay}</h2>
               </div>
               <div className="flex items-center gap-4">
                  <div className="text-right">
                     <div className="text-blue-300 text-xs font-semibold">Tổng cộng</div>
                     <div className="text-white text-2xl font-black">{formatMoney(totalRevenue)}</div>
                  </div>
                  <button
                     onClick={onClose}
                     className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                     <X size={18} />
                  </button>
               </div>
            </div>

            {/* Count badge */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex-shrink-0">
               <span className="text-sm text-slate-500 font-medium">
                  <span className="font-bold text-slate-800">{deals.length}</span> hợp đồng được duyệt trong tháng {monthDisplay}
               </span>
            </div>

            {/* Deal list */}
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
               {deals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                     <BarChart3 className="text-slate-300 mb-3" size={40} />
                     <p className="text-slate-400 font-semibold">Chưa có hợp đồng nào được duyệt</p>
                     <p className="text-slate-400 text-sm mt-1">trong tháng {monthDisplay}</p>
                  </div>
               ) : (
                  deals.map((deal, idx) => (
                     <div key={deal.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">
                              {idx + 1}
                           </div>
                           <div>
                               <div className="font-bold text-slate-800 text-sm">
                                 {getCustomerName(deal.customerId) || deal.service || 'Hợp đồng'}
                               </div>
                               {deal.service && getCustomerName(deal.customerId) && (
                                 <div className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5">{deal.service}</div>
                               )}
                              <div className="flex items-center gap-3 mt-0.5">
                                 <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <User size={11} /> {getUserName(deal.userId)}
                                 </span>
                                 <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Calendar size={11} /> {deal.approvedDate || deal.date || ''}
                                 </span>
                                 {deal.isFixFee && (
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Phí Cứng</span>
                                 )}
                              </div>
                           </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                           <div className="font-bold text-emerald-600">{formatMoney(deal.amount)}</div>
                           <div className="text-[10px] text-emerald-400 font-semibold mt-0.5 flex items-center justify-end gap-1">
                              <CheckCircle size={10} /> Đã duyệt
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>

            {/* Footer total */}
            {deals.length > 0 && (
               <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center flex-shrink-0">
                  <span className="text-sm font-bold text-slate-600">Tổng doanh thu ({deals.length} HĐ)</span>
                  <span className="text-lg font-black text-emerald-600">{formatMoney(totalRevenue)}</span>
               </div>
            )}
         </div>
      </div>
   );
};

export default TNDashboard;
