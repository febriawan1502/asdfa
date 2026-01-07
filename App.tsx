import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StockTable from './components/StockTable';
import InboundForm from './components/InboundForm';
import OutboundForm from './components/OutboundForm';
import OutboundMonitoring from './components/OutboundMonitoring';
import AdminMaterials from './components/AdminMaterials';
import UserManagement from './components/UserManagement';
import LoginPage from './components/LoginPage';
import { db } from './db';
import { Material, User } from './types';
import { Search, Bell, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('wm_pro_auth') === 'true');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('wm_pro_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activePage, setActivePage] = useState('stock');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const refreshData = () => {
    setMaterials(db.getMaterials());
  };

  useEffect(() => {
    if (isLoggedIn) {
      refreshData();
    }
  }, [isLoggedIn]);

  const handleLogin = (user: User) => {
    localStorage.setItem('wm_pro_auth', 'true');
    localStorage.setItem('wm_pro_user', JSON.stringify(user));
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('wm_pro_auth');
    localStorage.removeItem('wm_pro_user');
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const filteredMaterials = materials.filter(m => 
    m.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.material_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    // Role-based access control
    if (activePage === 'users' && currentUser?.role !== 'admin') {
      setActivePage('stock');
      return <StockTable materials={filteredMaterials} />;
    }

    switch (activePage) {
      case 'inbound':
        return <InboundForm onComplete={() => { setActivePage('stock'); refreshData(); }} />;
      case 'outbound':
        return <OutboundForm onComplete={() => { setActivePage('monitoring'); refreshData(); }} />;
      case 'monitoring':
        return <OutboundMonitoring onRefresh={refreshData} />;
      case 'admin':
        return <AdminMaterials onComplete={refreshData} />;
      case 'users':
        return <UserManagement />;
      case 'stock':
      default:
        return <StockTable materials={filteredMaterials} />;
    }
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'inbound': return 'Inbound Transaction';
      case 'outbound': return 'Outbound Transaction';
      case 'monitoring': return 'Monitoring Reference & TUG9';
      case 'admin': return 'Material Directory Management';
      case 'users': return 'User Management';
      case 'stock': return 'Inventory Overview';
      default: return 'Warehouse Manager';
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={handleLogout} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        currentUser={currentUser}
      />
      
      <main 
        className={`flex-1 p-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
      >
        <div className="max-w-[1600px] mx-auto">
          <header className="flex justify-between items-center mb-10 no-print">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{getPageTitle()}</h2>
              <p className="text-slate-500 mt-1 font-medium">PLN UP3 CIREBON • Warehouse Operations</p>
            </div>

            <div className="flex items-center gap-6">
              {activePage === 'stock' && (
                <div className="relative group">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search material..." 
                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-64 shadow-sm transition-all text-slate-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          <section className="animate-in fade-in duration-500">
            {renderContent()}
          </section>

          <footer className="mt-20 border-t border-slate-200 pt-8 pb-12 flex justify-between items-center no-print">
            <p className="text-xs text-slate-400 font-medium">© 2024 Warehouse Material Pro • UP3 Cirebon</p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-slate-400 hover:text-blue-600 font-medium transition-colors">Documentation</a>
              <a href="#" className="text-xs text-slate-400 hover:text-blue-600 font-medium transition-colors">Support</a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;