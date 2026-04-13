import React, { useState } from 'react';
import { useTN } from '../../context/TNHoldingContext';
import { Settings, Save, Plus, Trash2, ShieldAlert, UserPlus } from 'lucide-react';

const formatMoney = (val) => new Intl.NumberFormat('vi-VN').format(val) + 'đ';

const parseMoney = (val) => {
   const cleaned = val.toString().replace(/[^0-9]/g, '');
   return cleaned ? parseInt(cleaned, 10) : 0;
};

const NumberInput = ({ value, onChange, placeholder, className }) => {
   return (
      <input 
         type="text"
         className={`border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full ${className}`}
         value={value === 0 ? '0' : new Intl.NumberFormat('vi-VN').format(value)}
         onChange={(e) => onChange(parseMoney(e.target.value))}
         placeholder={placeholder}
      />
   );
};

const TNSettings = () => {
  const { currentUser, salaryConfig, targetKPI, users, apiUpdateConfig, apiAddUser, apiDeleteUser, apiChangePassword } = useTN();
  
  // Tabs State
  const [activeTab, setActiveTab] = useState('salary');

  // Clone Config to state for form handling before saving
  const [targetForm, setTargetForm] = useState(targetKPI);
  const [tiers, setTiers] = useState(JSON.parse(JSON.stringify(salaryConfig.tiers)));
  const [attendance, setAttendance] = useState(salaryConfig.attendance);
  const [superBonuses, setSuperBonuses] = useState(JSON.parse(JSON.stringify(salaryConfig.superBonus)));

  // Add User State
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('NVCT');
  const [newUsernameAuth, setNewUsernameAuth] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('123456');

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = (e) => {
     e.preventDefault();
     if (oldPassword !== currentUser.password) {
         return alert("Mật khẩu cũ không chính xác!");
     }
     if (newPassword !== confirmPassword) {
         return alert("Mật khẩu mới và Nhập lại mật khẩu không khớp!");
     }
     if (newPassword.length < 6) {
         return alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
     }
     if (window.confirm("Bảo vệ mật khẩu thành công! Bạn có chắc chắn muốn đổi mật khẩu?")) {
         apiChangePassword(newPassword);
         setOldPassword('');
         setNewPassword('');
         setConfirmPassword('');
         alert("Đổi mật khẩu thành công!");
     }
  };

  if (currentUser.role !== 'admin') {
     return (
        <div className="max-w-xl mx-auto mt-12 animate-in fade-in duration-500">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-blue-600 text-white p-6 border-b border-blue-700">
                   <h2 className="text-xl font-bold flex items-center gap-2">
                       <ShieldAlert size={24} className="text-blue-200" /> Quản Lý Tài Khoản
                   </h2>
                   <p className="text-blue-100 text-sm mt-1">Đổi mật khẩu tài khoản nội bộ của bạn</p>
               </div>
               <form onSubmit={handleChangePassword} className="p-6 space-y-5">
                   <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
                       <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••" />
                   </div>
                   <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
                       <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••" />
                   </div>
                   <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nhập lại mật khẩu mới</label>
                       <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••" />
                   </div>
                   <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm mt-4">
                       Cập Nhật Mật Khẩu
                   </button>
               </form>
           </div>
        </div>
     );
  }

  const handleUpdateTier = (id, field, val) => {
     setTiers(tiers.map(t => t.id === id ? { ...t, [field]: val } : t));
  };

  const addTier = () => {
     const newId = Date.now();
     setTiers([...tiers, { id: newId, limit: 0, base: 0, bonus: 0 }]);
  };

  const removeTier = (id) => {
     setTiers(tiers.filter(t => t.id !== id));
  };

  const handleUpdateBonus = (id, field, val) => {
     setSuperBonuses(superBonuses.map(b => b.id === id ? { ...b, [field]: val } : b));
  };

  const addSuperBonus = () => {
     setSuperBonuses([...superBonuses, { id: Date.now(), service: 'Hoa hồng đặc biệt', bonus: 0 }]);
  };

  const removeSuperBonus = (id) => {
     setSuperBonuses(superBonuses.filter(b => b.id !== id));
  };

  const handleSave = () => {
     apiUpdateConfig(targetForm, {
         attendance: attendance,
         tiers: tiers,
         superBonus: superBonuses
     });
     alert("Cập nhật Cấu hình Lương Toàn bộ Chiến dịch Thành Công!");
  };

  const handleAddUser = async (e) => {
     e.preventDefault();
     if (!newUserName.trim()) return;
     if (!newUsernameAuth.trim()) return alert('Vui lòng nhập Tên Đăng Nhập!');
     
     const result = await apiAddUser({
        name: newUserName,
        role: newUserRole,
        title: newUserRole === 'NVCT' ? 'Sale Chính Thức' : 'Cộng Tác Viên',
        username: newUsernameAuth,
        password: newUserPassword
     });

     if (result?.error) {
        const msg = result.error.message || '';
        if (msg.includes('duplicate') || msg.includes('unique')) {
           alert(`❌ Lỗi: Tên đăng nhập "${newUsernameAuth}" đã tồn tại! Hãy chọn username khác.`);
        } else {
           alert(`❌ Tạo tài khoản thất bại!\nLỗi: ${msg}`);
        }
        return;
     }

     setNewUserName('');
     setNewUsernameAuth('');
     setNewUserPassword('123456');
     alert(`✅ Tạo tài khoản thành công!\nNhân sự có thể đăng nhập bằng:\n- Username: ${newUsernameAuth}\n- Mật khẩu: ${newUserPassword}`);
  };

  const handleDeleteUser = (id) => {
     if(window.confirm("Bác có chắc chắn muốn thu hồi tài khoản này chứ? (Số liệu bán hàng vẫn được giữ nguyên hợp lệ).")) {
        apiDeleteUser(id);
     }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <Settings className="text-slate-700" size={32}/> Cài Đặt Hệ Thống (Admin)
             </h1>
             <p className="text-slate-500 mt-1 font-medium">Bảng điều hướng Cơ Chế (Dynamic Config) cho Lương & Gamification</p>
          </div>
          <button onClick={handleSave} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5 transform">
            <Save size={18} /> Lưu Áp Dụng Toàn Công Ty
          </button>
       </header>

       {/* TABS MENU */}
       <div className="flex gap-6 border-b border-slate-200 mt-2">
          <button 
             onClick={() => setActiveTab('salary')} 
             className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'salary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
             Cấu Hình Lương Thưởng
          </button>
          <button 
             onClick={() => setActiveTab('users')} 
             className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
             Quản Lý Nhân Sự (Tài khoản)
          </button>
       </div>

       {/* ======================= TAB 1 ======================== */}
       {activeTab === 'salary' && (
       <div className="space-y-8 mt-6 animate-in fade-in zoom-in-95 duration-300">
       {/* SECTION 1: GLOBAL CONFIG */}
       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 border-l-4 border-amber-500 pl-3">Thông số Chung (Cắt Cứng)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-700">Mốc Target Gamification</div>
                  <div className="text-xs text-slate-500 mt-1">Dùng để tính % Dashboard Vượt Ngưỡng</div>
                </div>
                <div className="w-40"><NumberInput value={targetForm} onChange={setTargetForm} className="font-bold text-amber-600" /></div>
             </div>
             
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-700">Thưởng Chuyên Cần</div>
                  <div className="text-xs text-slate-500 mt-1">Khoản Bonus gò cứng mỗi tháng cho NV</div>
                </div>
                <div className="w-40"><NumberInput value={attendance} onChange={setAttendance} className="font-bold text-indigo-600" /></div>
             </div>
          </div>
       </div>

       {/* SECTION 2: CHẾ ĐỘ LƯƠNG CƠ BẢN */}
       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <h2 className="text-xl font-bold text-slate-800 border-l-4 border-blue-500 pl-3">I. Bảng Chế Độ Lương Cứng & KPI</h2>
             <button onClick={addTier} className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"><Plus size={16}/> Thêm Bậc</button>
          </div>
          <div className="overflow-x-auto p-4">
             <table className="w-full text-left">
                <thead>
                   <tr className="text-sm uppercase tracking-wider font-bold text-slate-400 border-b border-slate-200">
                      <th className="pb-3 px-2">Doanh thu đạt (&gt;=)</th>
                      <th className="pb-3 px-2">Lương Cứng Tương Ứng</th>
                      <th className="pb-3 px-2">Thưởng Đi kèm</th>
                      <th className="pb-3 px-2 w-10"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {tiers.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                         <td className="py-3 px-2">
                            <NumberInput value={t.limit} onChange={(val) => handleUpdateTier(t.id, 'limit', val)} className="font-semibold text-slate-900"/>
                            {t.limit === 0 && <span className="text-[10px] text-red-500 font-bold block mt-1">Mốc Bét (Luôn phải có 0)</span>}
                         </td>
                         <td className="py-3 px-2"><NumberInput value={t.base} onChange={(val) => handleUpdateTier(t.id, 'base', val)} className="font-medium text-slate-700"/></td>
                         <td className="py-3 px-2"><NumberInput value={t.bonus} onChange={(val) => handleUpdateTier(t.id, 'bonus', val)} className="font-bold text-blue-600"/></td>
                         <td className="py-3 px-2 text-right">
                             {t.limit !== 0 && (
                                <button onClick={() => removeTier(t.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={16}/></button>
                             )}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

       {/* SECTION 3: SUPER BONUS */}
       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <div>
                <h2 className="text-xl font-bold text-slate-800 border-l-4 border-emerald-500 pl-3">II. Cơ Chế Thưởng Thêm (Super Bonus)</h2>
                <div className="text-xs font-semibold text-slate-500 ml-4 mt-1">Lưu ý: Chỉ mở khoá thưởng khi NV đạt Ngưỡng Target (Hiện tại là {formatMoney(targetForm)})</div>
             </div>
             <button onClick={addSuperBonus} className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1"><Plus size={16}/> Thêm Cơ Chế</button>
          </div>
          <div className="overflow-x-auto p-4">
             <table className="w-full text-left max-w-3xl">
                <thead>
                   <tr className="text-sm uppercase tracking-wider font-bold text-slate-400 border-b border-slate-200">
                      <th className="pb-3 px-2">Tên Dịch Vụ Mở Khoá</th>
                      <th className="pb-3 px-2">Thưởng Hoa Hồng Cứng</th>
                      <th className="pb-3 px-2 w-10"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {superBonuses.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50">
                         <td className="py-3 px-2">
                            <input 
                               type="text" 
                               value={b.service} 
                               onChange={(e) => handleUpdateBonus(b.id, 'service', e.target.value)} 
                               className="w-full border border-slate-300 rounded px-2 py-1.5 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                            />
                         </td>
                         <td className="py-3 px-2 w-48"><NumberInput value={b.bonus} onChange={(val) => handleUpdateBonus(b.id, 'bonus', val)} className="font-black text-emerald-600"/></td>
                         <td className="py-3 px-2 text-right">
                            <button onClick={() => removeSuperBonus(b.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={16}/></button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
       </div>
       )}

       {/* ======================= TAB 2 ======================== */}
       {activeTab === 'users' && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6 animate-in fade-in zoom-in-95 duration-300">
            
            {/* LEFT: FORM ADD USER */}
            <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-max">
                <h2 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-blue-500 pl-3 flex items-center gap-2">
                    <UserPlus size={18} className="text-blue-500"/> Tạo Tài Khoản Mới
                </h2>
                <form onSubmit={handleAddUser} className="space-y-5">
                    <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1.5">Họ Tên Nhân Viên <span className="text-red-500">*</span></label>
                       <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Bành Thị Lụa" />
                    </div>
                    <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loại Hình Hợp Đồng</label>
                       <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                          <option value="NVCT">Nhân Viên Chính Thức (NVCT)</option>
                          <option value="CTV">Cộng Tác Viên (CTV)</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên Đăng Nhập (Username) <span className="text-red-500">*</span></label>
                       <input type="text" value={newUsernameAuth} onChange={e => setNewUsernameAuth(e.target.value)} required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: luanb" />
                    </div>
                    <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật Khẩu <span className="text-slate-400 font-normal">(Mặc định 123456)</span></label>
                       <input type="text" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm mt-2">
                       + Khởi tạo Account
                    </button>
                </form>
            </div>

            {/* RIGHT: USER LIST */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                   <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      Danh Sách Nhân Sự Đang Hoạt Động
                   </h2>
                   <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{users.filter(u=>u.role!=='admin').length} người</span>
                </div>
                <div className="overflow-x-auto p-4">
                   <table className="w-full text-left">
                      <thead className="border-b border-slate-200">
                         <tr>
                            <th className="p-3 text-xs uppercase tracking-wider font-bold text-slate-400">Tên Nhân Viên</th>
                            <th className="p-3 text-xs uppercase tracking-wider font-bold text-slate-400">Chức Danh</th>
                            <th className="p-3 text-xs uppercase tracking-wider font-bold text-slate-400 text-right">Thu hồi</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 relative">
                         {users.filter(u => u.role !== 'admin').map((u, idx) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                               <td className="p-3 font-bold text-slate-800">
                                  <div className="flex items-center gap-3">
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx%2===0?'bg-amber-100 text-amber-700':'bg-indigo-100 text-indigo-700'}`}>{u.name.charAt(0)}</div>
                                     {u.name}
                                  </div>
                               </td>
                               <td className="p-3">
                                  <div className="flex items-center gap-2">
                                     <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-wide ${u.role === 'NVCT' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-200 text-slate-600 border border-slate-300'}`}>{u.role}</span>
                                     <span className="text-xs font-medium text-slate-500">{u.title}</span>
                                  </div>
                               </td>
                               <td className="p-3 text-right">
                                  <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-600 bg-white border border-red-100 hover:border-red-300 hover:bg-red-50 p-2 rounded-lg transition-colors shadow-sm" title="Xoá Nhân Viên">
                                     <Trash2 size={16} />
                                  </button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
            </div>
         </div>
       )}

    </div>
  );
};
export default TNSettings;
