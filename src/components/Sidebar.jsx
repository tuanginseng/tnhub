import React from 'react';
import { useTN } from '../context/TNHoldingContext';
import { 
  BarChart2, Users, ShoppingCart, 
  PieChart, Settings, Mail, LogOut, X
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeMenu, setActiveMenu, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { currentUser, setCurrentUser } = useTN();

  const menus = [
    { name: 'DASHBOARD', icon: BarChart2 },
    { name: 'Analytics', icon: PieChart },
    { name: 'Marketing', icon: Mail },
    { name: 'CRM Khách Hàng', icon: Users },
    { name: 'Bán Hàng', icon: ShoppingCart },
    { name: 'Cài Đặt', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-icon">TN</div>
        <div className="logo-text">
          <span className="logo-title">TN Holding</span>
          <span className="logo-subtitle">{currentUser?.role === 'admin' ? 'Admin Panel' : 'Employee Portal'}</span>
        </div>
        <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
           <X size={20} color="#64748b" />
        </button>
      </div>
      
      <div className="sidebar-section">
        <h3 className="section-title">Môi trường làm việc</h3>
        <ul className="nav-list">
          {menus.map((menu, idx) => (
             <li 
               key={idx} 
               className={`nav-item sub-item ${activeMenu === menu.name ? 'active' : ''}`}
               onClick={() => setActiveMenu(menu.name)}
             >
                <menu.icon size={16} color={activeMenu === menu.name ? '#3b82f6' : 'currentColor'} /> 
                <span style={{ fontWeight: activeMenu === menu.name ? 500 : 400, color: activeMenu === menu.name ? '#1e293b' : 'inherit' }}>
                  {menu.name}
                </span>
             </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{currentUser?.name?.charAt(0)}</div>
          <div className="user-info">
            <span className="user-name">{currentUser?.name}</span>
            <span className="user-role">[{currentUser?.role}] {currentUser?.title}</span>
          </div>
          <LogOut size={18} className="logout-icon" title="Đăng xuất" onClick={() => {
             setCurrentUser(null);
          }} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
