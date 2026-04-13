import React from 'react';
import { useTN } from '../context/TNHoldingContext';
import { 
  LayoutDashboard, PieChart, Users, 
  ShoppingCart, Settings, Wallet
} from 'lucide-react';

const TNSidebar = ({ activeSidebar, setActiveSidebar }) => {
  const { currentUser } = useTN();

  const menus = [
    { id: 'dashboard', name: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'crm', name: 'CRM Khách Hàng', icon: Users },
    { id: 'sales', name: 'Bán Hàng', icon: ShoppingCart },
    { id: 'analytics', name: 'Analytics', icon: PieChart },
    { id: 'settings', name: 'Cài Đặt', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold mr-3">TN</div>
        <div className="font-semibold text-slate-100 tracking-wide">Holding Agency</div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        <div className="text-xs font-semibold text-slate-500 mb-2 px-2 uppercase tracking-wider">Môi trường làm việc</div>
        
        {menus.map(m => {
           const isActive = activeSidebar === m.id;
           return (
             <button 
               key={m.id}
               onClick={() => setActiveSidebar(m.id)}
               className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                 isActive 
                  ? 'bg-blue-600 border border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                  : 'hover:bg-slate-800 hover:text-slate-100'
               }`}
             >
                <m.icon size={18} className={isActive ? "text-blue-100" : "text-slate-400"} />
                <span className="font-medium text-sm">{m.name}</span>
             </button>
           )
        })}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold">
            {currentUser?.name?.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">{currentUser?.name}</div>
            <div className="text-xs text-blue-400 font-medium">[{currentUser?.role}] {currentUser?.title}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default TNSidebar;
