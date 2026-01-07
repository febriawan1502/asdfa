
import React from 'react';
import { LayoutDashboard, FileInput, FileOutput, Package, Database, LogOut, ChevronLeft, ChevronRight, ClipboardList, Users } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  currentUser: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onLogout, isCollapsed, setIsCollapsed, currentUser }) => {
  const menuItems = [
    { id: 'stock', name: 'Stock Monitoring', icon: LayoutDashboard },
    { id: 'inbound', name: 'Inbound Material', icon: FileInput },
    { id: 'outbound', name: 'Outbound Material', icon: FileOutput },
    { id: 'monitoring', name: 'Monitoring Outbound', icon: ClipboardList },
    { id: 'admin', name: 'Material Directory', icon: Database },
    { id: 'users', name: 'User Management', icon: Users, adminOnly: true },
  ];

  // Role-based filtering
  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || currentUser?.role === 'admin');

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-blue-900 text-white flex flex-col fixed left-0 top-0 shadow-xl no-print transition-all duration-300 z-40`}>
      <div className="p-6 flex items-center justify-between border-b border-blue-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/50">
            <Package className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <h1 className="font-black text-xl leading-none tracking-tight">WM-Pro</h1>
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-1">Warehouse</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 mt-6 px-4 overflow-y-auto">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActivePage(item.id)}
                  title={isCollapsed ? item.name : ''}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                      : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="font-bold text-sm whitespace-nowrap">{item.name}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-blue-800 space-y-4 bg-blue-950/20">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center py-2 text-blue-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>

        {!isCollapsed && currentUser && (
          <div className="flex items-center gap-3 bg-blue-800/30 p-3 rounded-2xl border border-blue-700/50">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-sm font-black border border-blue-600 shadow-inner shrink-0 uppercase">
              {getInitials(currentUser.username)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate text-white uppercase tracking-wider">{currentUser.username}</p>
              <p className="text-[10px] text-blue-400 font-bold truncate capitalize">{currentUser.role}</p>
            </div>
          </div>
        )}
        
        <button 
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 text-rose-400 rounded-xl text-sm font-black hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 ${isCollapsed ? 'px-0' : ''}`}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
