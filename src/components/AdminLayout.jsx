import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartPulse, LayoutDashboard, FileText, CheckSquare, BarChart3, LogOut, User, Menu, X } from 'lucide-react';

export default function AdminLayout({ children, user, handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const menuItems = [
    { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Laporan Masuk', path: '/admin/laporan', icon: FileText },
    { name: 'Verifikasi & Antrean', path: '/admin/verifikasi', icon: CheckSquare },
    { name: 'Monitoring & Audit', path: '/admin/monitoring', icon: BarChart3 },
  ];

  const onLogout = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-slate-900 text-white shrink-0 shadow-xl border-r border-slate-800">
        <div className="h-16 flex items-center justify-center gap-2.5 border-b border-slate-800 px-6">
          <div className="p-1.5 bg-blue-500 rounded-lg text-white">
            <HeartPulse className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-wider text-slate-100">CAREBRIDGES</span>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile / Logout bottom */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-slate-700">
              <User className="h-4.5 w-4.5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-500 font-medium">Logged in as</p>
              <p className="text-sm font-bold text-slate-200 truncate">{user?.email || 'admin@test.com'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-sm font-semibold text-slate-300 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Keluar Portal
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <div className="md:hidden">
        {/* Top Navbar Mobile */}
        <header className="bg-slate-900 text-white h-16 flex items-center justify-between px-4 shadow-md w-screen max-w-full">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500 rounded-lg text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="font-bold text-base tracking-wider">CAREBRIDGES</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="p-1.5 hover:bg-slate-800 rounded-lg">
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Mobile Navigation Drawer backdrop */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop overlay */}
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>

            {/* Sidebar content */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 text-white shadow-2xl animate-slide-in">
              <div className="absolute top-0 right-0 -mr-12 pt-4">
                <button onClick={() => setMobileOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-slate-950/40 text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="h-16 flex items-center justify-center gap-2.5 border-b border-slate-800 px-6">
                <div className="p-1.5 bg-blue-500 rounded-lg text-white">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg tracking-wider text-slate-100">CAREBRIDGES</span>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-slate-700">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Logged in as</p>
                    <p className="text-sm font-bold text-slate-200 truncate">{user?.email || 'admin@test.com'}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50 border border-slate-700/50 rounded-xl py-2 px-4 text-sm font-semibold text-slate-300 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar Portal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
