import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Calendar, CheckSquare, MessageSquare, FolderGit2, Menu } from 'lucide-react';
import { useTN } from '../context/TNHoldingContext';
import './Layout.css';

const Layout = ({ children, activeMenu, setActiveMenu }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { tasks, currentUser, events } = useTN();

  // Ngày hôm nay dạng YYYY-MM-DD
  const todayStr = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
  })();

  // Đếm sự kiện hôm nay của user hiện tại
  const todayEventCount = events.filter(e => {
    if (!currentUser) return false;
    const isToday = e.date === todayStr;
    if (currentUser.role === 'admin') return isToday;
    return isToday && e.userId === currentUser.id;
  }).length;

  // Đếm task chưa hoàn thành của user hiện tại
  const pendingCount = tasks.filter(t => {
    const incomplete = t.status !== 'Đã xong' && t.status !== 'done';
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return incomplete;
    return incomplete && t.userId === currentUser.id;
  }).length;

  const topMenus = [
    { name: 'Lịch làm việc', icon: Calendar, badge: todayEventCount, badgeColor: '#2563eb' },
    { name: 'Công việc', icon: CheckSquare, badge: pendingCount, badgeColor: '#ef4444' },
    { name: 'Tin nhắn', icon: MessageSquare },
    { name: 'Kho tài liệu', icon: FolderGit2 },
  ];

  return (
    <div className="app-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={(menu) => {
          setActiveMenu(menu);
          setIsMobileMenuOpen(false);
      }} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
          <header className="top-nav-header" style={{ 
              height: 64, 
              backgroundColor: '#fff', 
              borderBottom: '1px solid #e2e8f0', 
              display: 'flex', 
              alignItems: 'center', 
              padding: '0 24px',
              gap: 32,
              flexShrink: 0
          }}>
             <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu size={24} color="#1e293b" />
             </button>
             
             <div className="top-nav-links">
             {topMenus.map((m, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveMenu(m.name)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: 8, 
                    color: activeMenu === m.name ? '#2563eb' : '#64748b', 
                    fontWeight: activeMenu === m.name ? 600 : 500,
                    cursor: 'pointer',
                    height: '100%',
                    borderBottom: activeMenu === m.name ? '2px solid #2563eb' : '2px solid transparent',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                   <m.icon size={16} />
                   <span style={{ fontSize: 14 }}>{m.name}</span>
                   {/* Badge */}
                   {m.badge > 0 && (
                     <span style={{
                       display: 'inline-flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       minWidth: 18,
                       height: 18,
                       padding: '0 5px',
                       borderRadius: 9,
                       backgroundColor: m.badgeColor || '#ef4444',
                       color: '#fff',
                       fontSize: 11,
                       fontWeight: 700,
                       lineHeight: 1,
                     }}>
                       {m.badge > 99 ? '99+' : m.badge}
                     </span>
                   )}
                </div>
             ))}
             </div>
             
             <a 
                href="https://phisan.lovable.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link-btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16.01" y1="10" y2="10"/><line x1="16" x2="16.01" y1="14" y2="14"/><line x1="16" x2="16.01" y1="18" y2="18"/><line x1="8" x2="8.01" y1="10" y2="10"/><line x1="8" x2="8.01" y1="14" y2="14"/><line x1="12" x2="12.01" y1="10" y2="10"/><line x1="12" x2="12.01" y1="14" y2="14"/><line x1="8" x2="8.01" y1="18" y2="18"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>
                <span className="external-link-text">Tính phí sàn</span>
              </a>
          </header>

          <main className="main-content" style={{ padding: '32px', overflowY: 'auto' }}>
            {children}
          </main>
      </div>
    </div>
  );
};

export default Layout;
