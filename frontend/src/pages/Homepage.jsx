import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
    searchQuery: ''
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]); // Clear solved problems on logout
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const isSolved = solvedProblems.some(sp => sp._id === problem._id);
    const statusMatch = filters.status === 'all' || 
                        (filters.status === 'solved' && isSolved) ||
                        (filters.status === 'todo' && !isSolved) ||
                        (filters.status === 'attempted' && false);
    const searchMatch = !filters.searchQuery || problem.title.toLowerCase().includes(filters.searchQuery.toLowerCase());
    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col relative text-gray-300 overflow-x-hidden">
      {/* Background Decorators */}
      <div className="bg-grid opacity-10"></div>

      {/* Navigation Bar */}
      <nav className="flex items-center justify-between sticky top-0 z-50 px-4 sm:px-8 border-b border-gray-100/80 bg-[#121212]/95 backdrop-blur-md min-h-[4rem] h-[4rem]">
        
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <NavLink to="/" className="text-xl font-extrabold tracking-tight hover:scale-105 transition-transform">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC801] to-[#FF9932]">AlgoForge</span>
          </NavLink>
        </div>

        {/* Middle: Premium Search Bar */}
        <div className="flex-1 hidden md:flex justify-center max-w-xl w-full mx-4">
          <div className="relative group w-full">
            <svg className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#FFC801] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Two Sum..." 
              className="w-full bg-[#1A1A1A] text-gray-200 placeholder-gray-500 border border-gray-800 hover:border-gray-700 focus:outline-none focus:border-[#FFC801] focus:ring-1 focus:ring-[#FFC801]/20 rounded-full py-2.5 pl-11 pr-4 text-sm transition-all shadow-sm"
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex justify-end items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3"> 
              {/* Role Button */}
              {user?.role === 'admin' ? (
                <NavLink to="/admin" className="btn btn-sm h-9 bg-[#7C3AED] hover:bg-[#6D28D9] text-white border-none rounded-lg px-4 shadow-sm transition-all text-xs">
                  Admin
                </NavLink>
              ) : (
                <div className="flex items-center justify-center px-4 h-9 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-default transition-all shadow-sm">
                  User
                </div>
              )}

              {/* Profile / Name Component */}
              <div className="flex items-center gap-3 px-4 h-9 rounded-full bg-gray-800/40 border border-gray-700/50 cursor-default shadow-inner transition-colors hover:bg-gray-800/60 mx-1">
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center shadow-sm border border-gray-600/50">
                  <svg className="w-3.5 h-3.5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-[13px] font-bold text-gray-200 tracking-wide">
                  {user?.firstName || 'User'}
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                className="btn btn-sm h-9 bg-transparent border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:border-[#EF4444] hover:text-white rounded-lg px-5 transition-all shadow-none text-xs"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <NavLink to="/login" className="btn btn-sm btn-ghost hover:bg-gray-800/50 text-gray-300 font-medium px-4 rounded-full transition-colors">Log in</NavLink>
              <NavLink to="/signup" className="btn btn-sm neo-btn rounded-full px-5 shadow-lg">Sign Up</NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content - 80% Width and Centered */}
      <div className="w-[95%] lg:w-[80%] mx-auto flex-1 relative z-10 flex flex-col mt-6 sm:mt-8">
        
        {/* Secondary Header / Control Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-[#141414] p-4 sm:px-6 rounded-xl border border-gray-800 shadow-md">
          
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-3 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FFC801]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Problem Set
          </h1>

          {/* Filters Right Next to Title */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            
            {/* Status Filter */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-sm border border-gray-800 hover:border-gray-700 bg-[#1A1A1A] text-gray-300 font-medium h-9 px-4 rounded-lg flex items-center gap-2 transition-all shadow-sm">
                Status: {filters.status === 'all' ? 'All' : filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[50] menu p-2 mt-2 shadow-xl bg-[#1A1A1A] border border-gray-800 rounded-lg w-48 text-gray-300 font-medium">
                <li>
                  <a onClick={() => { setFilters({...filters, status: 'all'}); document.activeElement?.blur(); }} className={`flex items-center gap-3 hover:bg-[#222] ${filters.status === 'all' ? 'bg-[#222]' : ''}`}>
                    <div className="w-4 h-4"></div> All
                  </a>
                </li>
                <li>
                  <a onClick={() => { setFilters({...filters, status: 'solved'}); document.activeElement?.blur(); }} className={`flex items-center gap-3 hover:bg-[#222] ${filters.status === 'solved' ? 'bg-[#222]' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#00D26A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Solved
                  </a>
                </li>
                <li>
                  <a onClick={() => { setFilters({...filters, status: 'attempted'}); document.activeElement?.blur(); }} className={`flex items-center gap-3 hover:bg-[#222] ${filters.status === 'attempted' ? 'bg-[#222]' : ''}`}>
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3"><circle cx="12" cy="12" r="9"></circle></svg>
                    Attempted
                  </a>
                </li>
                <li>
                  <a onClick={() => { setFilters({...filters, status: 'todo'}); document.activeElement?.blur(); }} className={`flex items-center gap-3 hover:bg-[#222] ${filters.status === 'todo' ? 'bg-[#222]' : ''}`}>
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"></circle></svg>
                    Todo
                  </a>
                </li>
              </ul>
            </div>

            {/* Difficulty Filter */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-sm border border-gray-800 hover:border-gray-700 bg-[#1A1A1A] text-gray-300 font-medium h-9 px-4 rounded-lg flex items-center gap-2 transition-all shadow-sm">
                Difficulty: {filters.difficulty === 'all' ? 'All' : filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1)}
                <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[50] menu p-2 mt-2 shadow-xl bg-[#1A1A1A] border border-gray-800 rounded-lg w-40 text-gray-300 font-medium">
                <li>
                  <a onClick={() => { setFilters({...filters, difficulty: 'all'}); document.activeElement?.blur(); }} className={`flex items-center gap-3 hover:bg-[#222] ${filters.difficulty === 'all' ? 'bg-[#222]' : ''}`}>
                    <div className="w-2.5 h-2.5"></div> All
                  </a>
                </li>
                <li>
                  <a onClick={() => { setFilters({...filters, difficulty: 'easy'}); document.activeElement?.blur(); }} className={`flex items-center gap-3 hover:bg-[#222] ${filters.difficulty === 'easy' ? 'bg-[#222]' : ''}`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00D26A]"></div> Easy
                  </a>
                </li>
                <li>
                  <a onClick={() => { setFilters({...filters, difficulty: 'medium'}); document.activeElement?.blur(); }} className={`flex items-center gap-3 hover:bg-[#222] ${filters.difficulty === 'medium' ? 'bg-[#222]' : ''}`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFC801]"></div> Medium
                  </a>
                </li>
                <li>
                  <a onClick={() => { setFilters({...filters, difficulty: 'hard'}); document.activeElement?.blur(); }} className={`flex items-center gap-3 hover:bg-[#222] ${filters.difficulty === 'hard' ? 'bg-[#222]' : ''}`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></div> Hard
                  </a>
                </li>
              </ul>
            </div>

            {/* Tags Filter */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-sm border border-gray-800 hover:border-gray-700 bg-[#1A1A1A] text-gray-300 font-medium h-9 px-4 rounded-lg flex items-center gap-2 transition-all shadow-sm">
                Tags: {filters.tag === 'all' ? 'All' : filters.tag.charAt(0).toUpperCase() + filters.tag.slice(1)}
                <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[50] menu p-2 mt-2 shadow-xl bg-[#1A1A1A] border border-gray-800 rounded-lg w-40 text-gray-300 font-medium">
                {['all', 'array', 'linkedList', 'graph', 'dp'].map(t => (
                  <li key={t}>
                    <a onClick={() => { setFilters({...filters, tag: t}); document.activeElement?.blur(); }} className={`hover:bg-[#222] ${filters.tag === t ? 'bg-[#222]' : ''}`}>
                      {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Problems Table Layout */}
        <div className="w-full pb-10 overflow-x-auto">
          {filteredProblems.length === 0 ? (
            <div className="card glass-card p-8 text-center border border-gray-800 rounded-xl bg-[#141414]">
              <h3 className="text-lg font-bold text-gray-300 mb-1">No problems found</h3>
              <p className="text-gray-500 font-medium text-sm">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="min-w-[800px] rounded-lg overflow-hidden border border-gray-800 bg-[#121212]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1A1A1A] border-b border-gray-800 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <th className="py-5 px-6 w-24">PROB NO.</th>
                    <th className="py-5 px-6">TITLE</th>
                    <th className="py-5 px-6 w-32">DIFFICULTY</th>
                    <th className="py-5 px-6">TAGS</th>
                    <th className="py-5 px-6 w-36">CREATED AT</th>
                    <th className="py-5 px-6 w-28 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredProblems.map((problem, idx) => (
                    <tr key={problem._id} className="border-b border-gray-800/50 hover:bg-[#FFC801]/5 transition-colors group">
                      <td className="py-4 px-6 text-gray-400 font-bold group-hover:text-[#FFC801] transition-colors">
                        {idx + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <NavLink to={`/problem/${problem._id}`} className="font-semibold text-gray-300 group-hover:text-[#FFC801] transition-colors">
                            {problem.title}
                          </NavLink>
                          {solvedProblems.some(sp => sp._id === problem._id) && (
                            <span className="ml-3 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#FFC801]/20 text-[#FFC801]" title="Solved">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${
                          problem.difficulty?.toLowerCase() === 'easy' ? 'bg-[#1A1A1A] text-[#00D26A] border-[#00D26A]/30' :
                          problem.difficulty?.toLowerCase() === 'medium' ? 'bg-[#1A1A1A] text-[#FFC801] border-[#FFC801]/30' :
                          'bg-[#1A1A1A] text-[#EF4444] border-[#EF4444]/30'
                        }`}>
                          {problem.difficulty ? problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1).toLowerCase() : 'Easy'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-2">
                          {problem.tags && problem.tags.split(',').map((tag, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#222] text-gray-400 border border-gray-800 whitespace-nowrap">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-[13px] font-medium leading-tight">
                        {problem._id 
                          ? new Date(parseInt(problem._id.substring(0, 8), 16) * 1000).toISOString().split('T')[0] 
                          : '2025-07-28'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <NavLink to={`/problem/${problem._id}`} className="text-gray-500 hover:text-[#FFC801] transition-colors" title="Solve/Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.14l-2.815.83.83-2.815a4.5 4.5 0 011.14-1.89l8.931-8.931zm0 0L19.5 7.125" />
                            </svg>
                          </NavLink>
                          {user?.role === 'admin' && (
                            <button className="text-gray-500 hover:text-red-400 transition-colors" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-5 pb-6 text-[10px] sm:text-[11px] text-gray-500/70 font-semibold tracking-wider select-none z-20 mt-auto border-t border-gray-800/30">
        © {new Date().getFullYear()} AlgoForge. All rights reserved. • Made with <span className="text-[#FF9932] animate-pulse inline-block">♥</span> by <a href="https://github.com/manishcodess" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFC801] transition-colors pointer-events-auto underline decoration-gray-500/50 hover:decoration-[#FFC801] underline-offset-2">Manish Kr. Sharma</a>
      </footer>

    </div>
  );
}

const getDifficultyBadgeStyle = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'bg-success/10 text-success border-success/20 shadow-[0_0_8px_rgba(0,169,110,0.1)]';
    case 'medium': return 'bg-warning/10 text-warning border-warning/20 shadow-[0_0_8px_rgba(251,189,35,0.1)]';
    case 'hard': return 'bg-error/10 text-error border-error/20 shadow-[0_0_8px_rgba(248,114,114,0.1)]';
    default: return 'bg-gray-700/20 text-gray-400 border-gray-600/30';
  }
};

export default Homepage;