import React from 'react';
import { Calendar, CheckSquare, MessageSquare, FolderGit2 } from 'lucide-react';

const TNTopNav = ({ activeTopNav, setActiveTopNav }) => {
  
  const navItems = [
    { id: 'calendar', name: 'Lịch làm việc', icon: Calendar },
    { id: 'tasks', name: 'Công việc', icon: CheckSquare },
    { id: 'messages', name: 'Tin nhắn', icon: MessageSquare },
    { id: 'documents', name: 'Kho tài liệu', icon: FolderGit2 },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 fixed top-0 right-0 left-64 z-10">
       <nav className="flex items-center gap-8 h-full">
         {navItems.map(item => {
            const isActive = activeTopNav === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTopNav(item.id)}
                className={`flex items-center gap-2 h-full border-b-2 px-1 transition-colors ${
                  isActive 
                    ? 'border-blue-600 text-blue-700 font-semibold' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium'
                }`}
              >
                 <item.icon size={16} />
                 <span className="text-sm">{item.name}</span>
              </button>
            )
         })}
       </nav>
    </header>
  );
};

export default TNTopNav;
