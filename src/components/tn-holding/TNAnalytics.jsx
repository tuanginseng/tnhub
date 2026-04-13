import React, { useState } from 'react';
import { useTN } from '../../context/TNHoldingContext';
import { Calculator, Award, Info, X } from 'lucide-react';

const formatMoney = (val) => new Intl.NumberFormat('vi-VN').format(val) + 'đ';

// Helper so khớp tên dịch vụ (tránh lỗi font chữ, hoặc sai ký tự Tích xanh vs Tick xanh)
const isMatch = (dealS, bonusS) => {
   if (!dealS || !bonusS) return false;
   const normalizeText = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^a-z0-9]/g, "");
   const d = normalizeText(dealS);
   const b = normalizeText(bonusS);
   if (b.includes("tichxanh") || b.includes("tickxanh")) return d.includes("tichxanh") || d.includes("tickxanh");
   if (b.includes("hoantin")) return d.includes("hoantin");
   return d.includes(b) || b.includes(d);
};

// Hàm tính lương động thông qua Config
const calculateDynamicSalary = (user, deals, config) => {
   // Role 'employee' hoặc 'NVCT' đều là nhân viên chính thức được nhận lương cứng
   const isNVCT = user.role === 'NVCT' || user.role === 'employee';
   
   // Dữ liệu config
   const sortedTiers = [...config.tiers].sort((a,b) => b.limit - a.limit); // Sort giảm dần để lấy mốc to nhất
   const attendance = isNVCT ? config.attendance : 0;

   // Lọc doanh thu thực tế
   const userDeals = deals.filter(d => d.userId === user.id && d.status === 'approved');
   const totalRevenue = userDeals.reduce((sum, d) => sum + d.amount, 0);

   // Tìm mốc lương KPI
   let baseSalary = 0;
   let kpiBonus = 0;
   
   // Loop qua mảng config giảm dần để check xem doanh thu đã chạm mốc nào (Doanh thu >= limit)
   for (let i = 0; i < sortedTiers.length; i++) {
        if (totalRevenue >= sortedTiers[i].limit) {
            baseSalary = isNVCT ? sortedTiers[i].base : 0; // CTV ko có lương cứng
            
            // Giữ logic cũ cho CTV nếu thưởng kpi. Do ko có bảng config riêng cho CTV nên tạm nội suy bonus
            kpiBonus = isNVCT ? sortedTiers[i].bonus : (sortedTiers[i].limit >= 120000000 ? sortedTiers[i].bonus + 1000000 : 0); 
            break;
        }
   }

   // Thưởng Thêm (Super Bonus) mở khoá khi doanh thu chạm mốc KPI đầu tiên (Thường là mốc limit thứ 2 trở lên)
   // Giả sử mốc KPI mở khoá là mốc config số 2 (mốc số 1 là 0đ)
   let superBonus = 0;
   const superBonusDetails = [];
   const unlockLimit = sortedTiers.length > 1 ? sortedTiers[sortedTiers.length - 2].limit : 120000000; // Mốc sau mốc số 0

   // Sắp xếp hợp đồng theo thứ tự thời gian hoàn thành (Cũ nhất -> mới nhất) để tính mốc rổ chính xác
   const chronologicalDeals = [...userDeals].sort((a,b) => {
       const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
       if (dateDiff !== 0) return dateDiff;
       // Nếu trùng trong cùng 1 ngày, ưu tiên sắp xếp theo thời gian khởi tạo (created_at) trên Server
       if (a.createdAt && b.createdAt) return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
       // Fallback
       return String(a.id).localeCompare(String(b.id));
   });

   let runningTotal = 0;

   chronologicalDeals.forEach(deal => {
      // Cộng dồn tiền vào rổ TRƯỚC RỒI mới xét Hợp đồng hiện tại có tính không!
      // VD: Hợp đồng đầu 50tr, HĐ 2 50tr, HĐ 3 50tr (Tích xanh). Rổ = 150tr > 120tr => HĐ thứ 3 đc thưởng!
      runningTotal += deal.amount;
      
      // Nếu tổng tiền rổ chạm hoặc vượt mốc, mới xét xem hợp đồng CÓ tạo ra sau khi chạm mốc ko.
      if (runningTotal >= unlockLimit) {
         config.superBonus.forEach(b => {
             if (isMatch(deal.service, b.service)) {
                 superBonus += b.bonus;
                 superBonusDetails.push({ deal, serviceName: deal.service, bonusAmount: b.bonus });
             }
         });
      }
   });

   const totalSalary = baseSalary + attendance + kpiBonus + superBonus;

   return { baseSalary, allowance: attendance, totalRevenue, kpiBonus, superBonus, superBonusDetails, totalSalary, unlockLimit };
};

const TNAnalytics = () => {
  const { users, deals, customers, currentUser, salaryConfig } = useTN();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedUserBonus, setSelectedUserBonus] = useState(null);
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const displayUsers = currentUser.role === 'admin' 
      ? users.filter(u => u.role !== 'admin')
      : [currentUser];

  const checkDealMonth = (d, targetMonth) => {
      const dealDateToUse = d.approvedDate || d.date; // Uu tiên thang Duyet
      return dealDateToUse.startsWith(targetMonth);
  };

  const filteredDeals = deals.filter(d => d.status === 'approved' && checkDealMonth(d, selectedMonth));

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <Calculator className="text-blue-600" size={32}/> Báo Cáo Lương KPI
             </h1>
             <p className="text-slate-500 mt-1">Lợi nhuận được tính Tự Động theo cơ chế cấu hình ở Cài Đặt.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                <span className="text-sm font-semibold text-slate-500 mr-2">Kỳ lương:</span>
                <input 
                   type="month" 
                   value={selectedMonth} 
                   onChange={(e) => setSelectedMonth(e.target.value)} 
                   className="text-sm font-bold text-slate-800 outline-none bg-transparent cursor-pointer"
                />
             </div>
             <button onClick={() => setShowConfigModal(true)} className="bg-slate-100 text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-slate-200">
                <Info size={16}/> Xem Cơ Chế Lương/Thưởng
             </button>
          </div>
       </header>

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-700">
                      <th className="p-4">Nhân Sự</th>
                      <th className="p-4 text-right">Doanh Thu Đạt</th>
                      <th className="p-4 text-right">Lương Cứng</th>
                      <th className="p-4 text-right">PC</th>
                      <th className="p-4 text-right text-blue-600">Thưởng KPI</th>
                      <th className="p-4 text-right text-emerald-600">Hoa Hồng Gói Khó</th>
                      <th className="p-4 text-right text-lg text-slate-900 border-l border-slate-200 bg-slate-100">THỰC NHẬN</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {displayUsers.map(user => {
                      const data = calculateDynamicSalary(user, filteredDeals, salaryConfig);
                      return (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                           <td className="p-4">
                              <div className="font-bold text-slate-800">{user.name}</div>
                              <div className="text-xs font-semibold text-slate-500 mt-0.5 px-2 py-0.5 bg-slate-100 w-max rounded">
                                {user.role}
                              </div>
                           </td>
                           <td className="p-4 text-right font-black text-slate-800">
                              {formatMoney(data.totalRevenue)}
                           </td>
                           <td className="p-4 text-right text-slate-600 font-medium">{formatMoney(data.baseSalary)}</td>
                           <td className="p-4 text-right text-slate-600 font-medium">{formatMoney(data.allowance)}</td>
                           <td className="p-4 text-right font-bold text-blue-600">{formatMoney(data.kpiBonus)}</td>
                           <td className="p-4 text-right font-bold text-emerald-600">
                               <div 
                                  className={`flex items-center justify-end gap-1 ${data.superBonus > 0 ? 'cursor-pointer hover:underline' : ''}`}
                                  onClick={() => data.superBonus > 0 && setSelectedUserBonus({ user, details: data.superBonusDetails })}
                               >
                                  {data.superBonus > 0 && <Award size={14} className="text-emerald-500" />}
                                  {formatMoney(data.superBonus)}
                               </div>
                               {data.totalRevenue < data.unlockLimit && <div className="text-[10px] text-amber-500 font-normal mt-1">Dưới {formatMoney(data.unlockLimit)} bị khoá thưởng</div>}
                           </td>
                           <td className="p-4 text-right font-black text-xl text-slate-900 border-l border-slate-200 bg-slate-50/50">
                              {formatMoney(data.totalSalary)}
                           </td>
                        </tr>
                      )
                   })}
                </tbody>
             </table>
          </div>
       </div>

       {/* MODAL CƠ CHẾ LƯƠNG */}
       {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in flex-col px-4">
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">Niêm yết Cơ chế Lương Thưởng</h2>
                        <p className="text-sm font-medium text-slate-500">Bảng quy chế gốc đồng bộ tự động từ Cài đặt Giám Đốc</p>
                    </div>
                    <button onClick={() => setShowConfigModal(false)} className="bg-white border shadow-sm p-1.5 rounded-full text-slate-400 hover:text-slate-800"><X size={20}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-8 bg-slate-50/50">
                   
                   <div>
                       <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-blue-500 pl-3">I. Cấp bậc Doanh Thu / KPI Lương (Áp dụng NVCT)</h3>
                       <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                           <table className="w-full text-left font-medium text-sm">
                               <thead className="bg-slate-100/50">
                                   <tr>
                                       <th className="p-3">Doanh thu Đạt mốc</th>
                                       <th className="p-3 text-right">Lương cứng</th>
                                       <th className="p-3 text-right">Thưởng doanh số</th>
                                       <th className="p-3 text-right">Phụ cấp/CC</th>
                                       <th className="p-3 text-right font-bold text-blue-600 bg-blue-50/50">TỔNG LƯƠNG</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100">
                                   {[...salaryConfig.tiers].sort((a,b)=>a.limit-b.limit).map(t => (
                                       <tr key={t.id} className="hover:bg-slate-50">
                                           <td className="p-3 font-bold text-slate-800">{formatMoney(t.limit)}</td>
                                           <td className="p-3 text-right text-slate-600">{formatMoney(t.base)}</td>
                                           <td className="p-3 text-right text-amber-600 font-bold">{formatMoney(t.bonus)}</td>
                                           <td className="p-3 text-right text-indigo-500">{formatMoney(salaryConfig.attendance)}</td>
                                           <td className="p-3 text-right font-black text-blue-600 bg-blue-50/30">{formatMoney(t.base + t.bonus + salaryConfig.attendance)}</td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   </div>

                   <div>
                       <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-emerald-500 pl-3">II. Thưởng Nóng Gói Khó (Super Bonus)</h3>
                       <div className="bg-white border rounded-xl overflow-hidden shadow-sm max-w-xl">
                           <table className="w-full text-left font-medium text-sm">
                               <thead className="bg-emerald-50/50">
                                   <tr>
                                       <th className="p-3">Tên sản phẩm / Gói dịch vụ</th>
                                       <th className="p-3 text-right">Thẻ Hoa hồng / Đơn</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100">
                                   {salaryConfig.superBonus.map(b => (
                                       <tr key={b.id} className="hover:bg-slate-50">
                                           <td className="p-3 font-bold text-slate-800">{b.service}</td>
                                           <td className="p-3 text-right font-black text-emerald-600">+{formatMoney(b.bonus)}</td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   </div>

                </div>
             </div>
          </div>
       )}

       {/* MODAL CHI TIẾT SUPER BONUS CỦA CÁ NHÂN */}
       {selectedUserBonus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in flex-col px-4">
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-emerald-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Award className="text-emerald-600"/> Chi tiết Hoa Hồng Siêu Cấp
                        </h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">Nhân sự: <strong className="text-blue-600">{selectedUserBonus.user.name}</strong></p>
                    </div>
                    <button onClick={() => setSelectedUserBonus(null)} className="bg-white border shadow-sm p-1.5 rounded-full text-slate-400 hover:text-slate-800"><X size={20}/></button>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                   {selectedUserBonus.details.length === 0 ? (
                       <div className="text-center text-slate-500 py-4">Chưa có thưởng gói khó nào.</div>
                   ) : (
                       <div className="space-y-3">
                           {selectedUserBonus.details.map((b, idx) => {
                               const customerInfo = customers?.find(c => c.id === b.deal.customerId);
                               return (
                                   <div key={idx} className="bg-white border text-left border-emerald-100 p-4 rounded-xl shadow-sm hover:border-emerald-300 transition-colors flex justify-between items-center">
                                       <div>
                                           <div className="text-sm font-bold text-slate-800">{customerInfo?.name || 'Khách vãng lai'}</div>
                                           <div className="text-xs text-slate-500 mt-1">Sản phẩm: <span className="font-semibold text-slate-700">{b.serviceName}</span></div>
                                           <div className="text-[10px] text-slate-400 mt-0.5">Ngày chốt: {b.deal.date}</div>
                                       </div>
                                       <div className="text-right">
                                           <div className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                                               +{formatMoney(b.bonusAmount)}
                                           </div>
                                       </div>
                                   </div>
                               )
                           })}
                       </div>
                   )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-sm">
                   <span className="font-semibold text-slate-600">Tổng cộng {selectedUserBonus.details.length} deals thưởng</span>
                   <span className="font-black text-emerald-600 text-lg">{formatMoney(selectedUserBonus.details.reduce((sum, b) => sum + b.bonusAmount, 0))}</span>
                </div>
             </div>
          </div>
       )}

    </div>
  );
};

export default TNAnalytics;
