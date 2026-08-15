import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { Home, Code, ShieldCheck, LogOut, User, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <nav className="flex items-center justify-between sticky top-0 z-[100] px-4 sm:px-8 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-dark)]/80 backdrop-blur-md min-h-[4rem] h-[4rem]">
      
      {/* Left: Logo */}
      <div className="flex-1 flex justify-start items-center gap-6">
        <NavLink to="/" className="text-xl font-extrabold tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2 font-outfit">
          <div className="w-8 h-8 flex items-center justify-center text-[var(--color-brand-orange)]">
            <Code size={24} strokeWidth={2.5} />
          </div>
          <span className="bg-gradient-to-r from-[#FFC801] to-[#FF9932] bg-clip-text text-transparent">AlgoForge</span>
        </NavLink>

        {/* Global Navigation Links */}
        <div className="hidden md:flex items-center gap-2 border-l border-[var(--color-brand-border)] pl-6">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-[var(--color-brand-surface)] text-[var(--color-brand-text-primary)] border border-[var(--color-brand-border)]' : 'text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-text-primary)] hover:bg-[var(--color-brand-surface)]/50'}`}
          >
            <Home size={16} />
            <span>Home</span>
          </NavLink>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex-1 flex justify-end items-center gap-4">
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-[var(--color-brand-surface)] text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-orange)] border border-[var(--color-brand-border)] transition-colors shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {user ? (
          <div className="flex items-center gap-3"> 
            {/* Role Button */}
            {user?.role === 'admin' ? (
              <NavLink to="/admin" className="btn btn-sm h-9 bg-[var(--color-brand-surface)] hover:bg-[var(--color-brand-border)] text-[var(--color-brand-orange)] border border-[var(--color-brand-border)] rounded-lg px-4 shadow-sm transition-all text-xs flex items-center gap-1.5 font-semibold">
                <ShieldCheck size={14} />
                Admin
              </NavLink>
            ) : (
              <div className="flex items-center justify-center px-3 h-9 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[var(--color-brand-surface)] text-[var(--color-brand-text-secondary)] border border-[var(--color-brand-border)] cursor-default transition-all gap-1.5">
                <User size={12} />
                User
              </div>
            )}

            {/* Profile / Name Component */}
            <div className="hidden sm:flex items-center gap-3 px-3 h-9 rounded-full bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] cursor-default transition-colors hover:bg-[var(--color-brand-border)] mx-1">
              <div className="w-6 h-6 rounded-full bg-[var(--color-brand-dark)] flex items-center justify-center shadow-sm border border-[var(--color-brand-border)]">
                <User size={14} className="text-[var(--color-brand-text-primary)]" />
              </div>
              <div className="text-[13px] font-medium text-[var(--color-brand-text-primary)] tracking-wide pr-1">
                {user?.firstName || 'User'}
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="btn btn-sm h-9 bg-transparent border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 rounded-lg px-3 sm:px-4 transition-all shadow-none text-xs flex items-center gap-1.5 font-medium"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <NavLink to="/login" className="text-sm font-medium text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-text-primary)] px-3 py-1.5 rounded-lg hover:bg-[var(--color-brand-surface)] transition-colors">
              Log in
            </NavLink>
            <NavLink to="/signup" className="text-sm neo-btn px-5 py-2">
              Sign Up
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
