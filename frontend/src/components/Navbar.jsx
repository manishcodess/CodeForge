import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { Home, Code, ShieldCheck, LogOut, User } from 'lucide-react';

function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <nav className="flex items-center justify-between sticky top-0 z-[100] px-4 sm:px-8 border-b border-gray-100/10 bg-[#121212]/95 backdrop-blur-md min-h-[4rem] h-[4rem]">
      
      {/* Left: Logo */}
      <div className="flex-1 flex justify-start items-center gap-6">
        <NavLink to="/" className="text-xl font-extrabold tracking-tight hover:scale-105 transition-transform flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFC801] to-[#FF9932] flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Code size={18} className="text-[#121212]" />
          </div>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC801] to-[#FF9932]">AlgoForge</span>
        </NavLink>

        {/* Global Navigation Links */}
        <div className="hidden md:flex items-center gap-2 border-l border-gray-700/50 pl-6">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
          >
            <Home size={16} />
            <span>Home</span>
          </NavLink>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex-1 flex justify-end items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3"> 
            {/* Role Button */}
            {user?.role === 'admin' ? (
              <NavLink to="/admin" className="btn btn-sm h-9 bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 text-[#A78BFA] border border-[#7C3AED]/50 rounded-lg px-4 shadow-sm transition-all text-xs flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Admin
              </NavLink>
            ) : (
              <div className="flex items-center justify-center px-3 h-9 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 cursor-default transition-all shadow-sm gap-1.5">
                <User size={12} />
                User
              </div>
            )}

            {/* Profile / Name Component */}
            <div className="hidden sm:flex items-center gap-3 px-3 h-9 rounded-full bg-gray-800/40 border border-gray-700/50 cursor-default shadow-inner transition-colors hover:bg-gray-800/60 mx-1">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center shadow-sm border border-gray-600/50">
                <User size={14} className="text-gray-300" />
              </div>
              <div className="text-[13px] font-bold text-gray-200 tracking-wide pr-1">
                {user?.firstName || 'User'}
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="btn btn-sm h-9 bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 hover:text-red-300 rounded-lg px-3 sm:px-4 transition-all shadow-none text-xs flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <NavLink to="/login" className="text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              Log in
            </NavLink>
            <NavLink to="/signup" className="text-sm font-bold bg-gradient-to-r from-[#FFC801] to-[#FF9932] hover:from-[#FFD533] hover:to-[#FFA74D] text-[#121212] px-5 py-2 rounded-full shadow-lg hover:shadow-orange-500/25 transition-all transform hover:-translate-y-0.5">
              Sign Up
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
