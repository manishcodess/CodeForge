import React from 'react';

const FilterBar = ({ filters, setFilters, availableTags = [] }) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full bg-[#141414] p-4 sm:px-6 rounded-xl border border-gray-800 shadow-md mb-6">
      <div className="flex-1 w-full md:max-w-md">
        <div className="relative group w-full">
          <svg className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#FFC801] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search problems..." 
            className="w-full bg-[#1A1A1A] text-gray-200 placeholder-gray-500 border border-gray-800 hover:border-gray-700 focus:outline-none focus:border-[#FFC801] focus:ring-1 focus:ring-[#FFC801]/20 rounded-full py-2 pl-11 pr-4 text-sm transition-all shadow-sm"
            value={filters.searchQuery || ''}
            onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
          />
        </div>
      </div>

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
              <a onClick={() => { setFilters({...filters, status: 'unsolved'}); document.activeElement?.blur(); }} className={`flex items-center gap-3 hover:bg-[#222] ${filters.status === 'unsolved' ? 'bg-[#222]' : ''}`}>
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"></circle></svg>
                Unsolved
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

        {/* Topics Filter */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-sm border border-gray-800 hover:border-gray-700 bg-[#1A1A1A] text-gray-300 font-medium h-9 px-4 rounded-lg flex items-center gap-2 transition-all shadow-sm">
            Topics: {filters.tag === 'all' ? 'All' : filters.tag.charAt(0).toUpperCase() + filters.tag.slice(1)}
            <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          <ul tabIndex={0} className="dropdown-content z-[50] menu p-2 mt-2 shadow-xl bg-[#1A1A1A] border border-gray-800 rounded-lg w-40 text-gray-300 font-medium max-h-60 overflow-y-auto">
            <li>
              <a onClick={() => { setFilters({...filters, tag: 'all'}); document.activeElement?.blur(); }} className={`hover:bg-[#222] ${filters.tag === 'all' ? 'bg-[#222]' : ''}`}>
                All
              </a>
            </li>
            {availableTags.map(t => (
              <li key={t}>
                <a onClick={() => { setFilters({...filters, tag: t}); document.activeElement?.blur(); }} className={`hover:bg-[#222] ${filters.tag === t ? 'bg-[#222]' : ''}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
