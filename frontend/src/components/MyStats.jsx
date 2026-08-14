import React from 'react';

const MyStats = ({ problems = [], solvedProblems = [] }) => {
  const total = problems.length;
  const solved = solvedProblems.length;
  // Placeholder for attempted, as it requires a different API to track submissions
  const attempted = 0; 

  const getDifficultyStats = (difficulty) => {
    const dTotal = problems.filter(p => p.difficulty?.toLowerCase() === difficulty.toLowerCase()).length;
    const dSolved = solvedProblems.filter(p => p.difficulty?.toLowerCase() === difficulty.toLowerCase()).length;
    return { total: dTotal, solved: dSolved };
  };

  const easy = getDifficultyStats('easy');
  const medium = getDifficultyStats('medium');
  const hard = getDifficultyStats('hard');

  return (
    <div className="bg-[#141414] rounded-xl border border-gray-800 shadow-md p-6 flex flex-col w-full h-fit">
      <h2 className="text-lg font-bold text-gray-200 mb-6 flex items-center gap-2 tracking-wide">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FFC801]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        MY STATS
      </h2>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-800/80 flex flex-col items-center justify-center">
          <div className="text-2xl font-black text-[#00D26A]">{solved}</div>
          <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1">Solved</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-800/80 flex flex-col items-center justify-center">
          <div className="text-2xl font-black text-[#FFC801]">{attempted}</div>
          <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1">Attempted</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Total Questions</span>
          <span className="text-sm font-bold text-gray-300">{solved} / {total}</span>
        </div>
        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-[#FFC801] to-[#FF9932] h-full rounded-full" style={{ width: `${total === 0 ? 0 : (solved / total) * 100}%` }}></div>
        </div>
      </div>

      <div className="divider before:bg-gray-800/50 after:bg-gray-800/50 my-2"></div>

      {/* Difficulty Breakdown */}
      <div className="space-y-5 mt-4">
        {/* Easy */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-[#00D26A]">Easy</span>
            <span className="text-xs font-bold text-gray-400">{easy.solved} <span className="text-gray-600 font-medium">/ {easy.total}</span></span>
          </div>
          <div className="w-full bg-[#00D26A]/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#00D26A] h-full rounded-full" style={{ width: `${easy.total === 0 ? 0 : (easy.solved / easy.total) * 100}%` }}></div>
          </div>
        </div>

        {/* Medium */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-[#FFC801]">Medium</span>
            <span className="text-xs font-bold text-gray-400">{medium.solved} <span className="text-gray-600 font-medium">/ {medium.total}</span></span>
          </div>
          <div className="w-full bg-[#FFC801]/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#FFC801] h-full rounded-full" style={{ width: `${medium.total === 0 ? 0 : (medium.solved / medium.total) * 100}%` }}></div>
          </div>
        </div>

        {/* Hard */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-[#EF4444]">Hard</span>
            <span className="text-xs font-bold text-gray-400">{hard.solved} <span className="text-gray-600 font-medium">/ {hard.total}</span></span>
          </div>
          <div className="w-full bg-[#EF4444]/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#EF4444] h-full rounded-full" style={{ width: `${hard.total === 0 ? 0 : (hard.solved / hard.total) * 100}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyStats;
