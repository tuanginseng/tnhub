import React, { useState } from 'react';
import { TNProvider, useTN } from './context/TNHoldingContext';
import Layout from './components/Layout';

// TN Components
import TNDashboard from './components/tn-holding/TNDashboard';
import TNCRM from './components/tn-holding/TNCRM';
import TNSales from './components/tn-holding/TNSales';
import TNAnalytics from './components/tn-holding/TNAnalytics';
import TNTasks from './components/tn-holding/TNTasks';
import TNDocuments from './components/tn-holding/TNDocuments';
import TNSettings from './components/tn-holding/TNSettings';
import TNCalendar from './components/tn-holding/TNCalendar';

function AppContent() {
  const { currentUser, setCurrentUser, users, reloadData } = useTN();
  const [activeMenu, setActiveMenu] = useState('DASHBOARD');
  
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const handleLogin = (e) => {
     e.preventDefault();
     setLoginError('');
     const foundUser = users.find(u => u.username === loginUsername && u.password === loginPassword);
     if (foundUser) {
        setCurrentUser(foundUser);
        reloadData(); // Fetch lại data mới nhất sau khi đăng nhập
     } else {
        setLoginError('Tài khoản hoặc mật khẩu không chính xác!');
     }
  };

  if (!currentUser) {
     return (
       <div className="flex bg-slate-50 items-center justify-center p-4 md:p-8 w-full h-screen">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 w-full max-w-sm">
             <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 tracking-tighter shadow-md">TN</div>
             <h2 className="text-2xl font-black text-slate-900 mb-2 text-center tracking-tight">Hệ Thống Quản Trị</h2>
             <p className="text-sm text-slate-500 mb-8 text-center font-medium">TN Holding Agency ERP</p>
             
             <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                   <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100 text-center animate-in shake">
                      {loginError}
                   </div>
                )}
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Tên Đăng Nhập</label>
                   <input type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} required className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" placeholder="Ví dụ: admin" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Mật Khẩu</label>
                   <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" placeholder="••••••" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30 transform hover:-translate-y-0.5 mt-2">
                   Đăng Nhập
                </button>
             </form>

             <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <button onClick={() => setShowDemo(!showDemo)} className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-wider">
                   {showDemo ? 'Ẩn tài khoản Demo' : 'Hiển thị tài khoản Demo (Dành cho Sếp)'}
                </button>
                
                {showDemo && (
                   <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2">
                     {users.map(u => (
                        <button 
                          key={u.id}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl hover:bg-white hover:border-blue-400 transition-colors text-left flex items-center justify-between group"
                          onClick={() => { setCurrentUser(u); reloadData(); }}
                        >
                           <div>
                             <div className="font-bold text-slate-800 group-hover:text-blue-700">{u.name}</div>
                             <div className="text-xs text-slate-500">{u.title} - Pass: {u.password}</div>
                           </div>
                           <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{u.role}</span>
                        </button>
                     ))}
                   </div>
                )}
             </div>
          </div>
       </div>
     );
  }

  const renderContent = () => {
     switch(activeMenu) {
        case 'DASHBOARD': return <TNDashboard setActiveMenu={setActiveMenu} />;
        case 'CRM Khách Hàng': return <TNCRM />;
        case 'Bán Hàng': return <TNSales />;
        case 'Analytics': return <TNAnalytics />;
        case 'Công việc': return <TNTasks />;
        case 'Kho tài liệu': return <TNDocuments />;
        case 'Cài Đặt': return <TNSettings />;
        case 'Lịch làm việc': return <TNCalendar />;
        case 'Marketing':
        case 'Tin nhắn':
           return <div style={{ padding: 32, color: '#64748b' }}>Đang phát triển giao diện {activeMenu}...</div>;
        default: return <TNDashboard />;
     }
  };

  return (
    <Layout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
       {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <TNProvider>
      <AppContent />
    </TNProvider>
  );
}

export default App;
