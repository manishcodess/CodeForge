import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import toast from 'react-hot-toast';

const langMap = {
        cpp: 'C++',
        java: 'Java',
        javascript: 'JavaScript'
};


const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let {problemId}  = useParams();

  

  const { handleSubmit } = useForm();

 useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
       
        
        const initialCode = response.data.startCode?.find(sc => sc.language === langMap[selectedLanguage])?.initialCode || '';

        setProblem(response.data);
        
        setCode(initialCode);
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode?.find(sc => sc.language === langMap[selectedLanguage])?.initialCode || '';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      if (response.data.success) toast.success('Code executed successfully!');
      else toast.error('Code execution failed or returned wrong output.');
      setLoading(false);
      setActiveRightTab('testcase');
      
    } catch (error) {
      console.error('Error running code:', error);
      toast.error('Failed to run code. Please try again.');
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    
    try {
        const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code:code,
        language: selectedLanguage
      });

       setSubmitResult(response.data);
       if (response.data.accepted) toast.success('Solution Accepted! 🎉');
       else toast.error(response.data.error || 'Solution Failed');
       setLoading(false);
       setActiveRightTab('result');
      
    } catch (error) {
      console.error('Error submitting code:', error);
      toast.error('Failed to submit code. Please try again.');
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-[var(--color-brand-dark)] text-[var(--color-brand-text-primary)]">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-[var(--color-brand-border)]">
        {/* Left Tabs */}
        <div className="flex bg-[var(--color-brand-surface)] px-4 border-b border-[var(--color-brand-border)] overflow-x-auto scrollbar-hide shadow-sm">
          {['description', 'editorial', 'solutions', 'submissions', 'chatAI'].map((tab) => (
            <button 
              key={tab}
              className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${activeLeftTab === tab ? 'border-[var(--color-brand-orange)] text-[var(--color-brand-orange)]' : 'border-transparent text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-text-primary)] hover:bg-[var(--color-brand-dark)]/50'}`}
              onClick={() => setActiveLeftTab(tab)}
            >
              {tab === 'chatAI' ? 'ChatAI' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-transparent">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-[var(--color-brand-text-primary)] font-outfit">{problem.title}</h1>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border shadow-sm ${
                      problem.difficulty?.toLowerCase() === 'easy' ? 'bg-[#00D26A]/10 text-[#00D26A] border-[#00D26A]/30' :
                      problem.difficulty?.toLowerCase() === 'medium' ? 'bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] border-[var(--color-brand-orange)]/30' :
                      'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                    }`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </div>
                    <div className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[var(--color-brand-surface)] text-[var(--color-brand-text-secondary)] border border-[var(--color-brand-border)] shadow-sm">
                      {problem.tags}
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none text-gray-300/90">
                    <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                      {problem.description}
                    </div>
                  </div>

                  <div className="mt-10">
                    <h3 className="text-lg font-bold mb-5 text-[var(--color-brand-text-primary)]">Examples:</h3>
                    <div className="space-y-5">
                      {problem.visibleTestCases.map((example, index) => (
                        <div key={index} className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] p-5 rounded-xl shadow-md relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-brand-border)]"></div>
                          <h4 className="font-bold mb-3 text-[var(--color-brand-text-primary)]">Example {index + 1}:</h4>
                          <div className="space-y-2 text-sm font-mono text-[var(--color-brand-text-secondary)] ml-2">
                            <div><strong className="text-[var(--color-brand-text-primary)]">Input:</strong> <span className="text-[var(--color-brand-text-secondary)]">{example.input}</span></div>
                            <div><strong className="text-[var(--color-brand-text-primary)]">Output:</strong> <span className="text-[var(--color-brand-text-secondary)]">{example.output}</span></div>
                            {example.explanation && <div className="mt-2 pt-2 border-t border-[var(--color-brand-border)]"><strong className="text-[var(--color-brand-text-primary)]">Explanation:</strong> <span className="text-[var(--color-brand-text-secondary)] font-sans">{example.explanation}</span></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4 text-[var(--color-brand-text-primary)]">Editorial</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div>
                  <h2 className="text-xl font-bold mb-6 text-[var(--color-brand-text-primary)]">Reference Solutions</h2>
                  <div className="space-y-8">
                    {problem.referenceSolution?.map((solution, index) => (
                      <div key={index} className="border border-[var(--color-brand-border)] rounded-xl bg-transparent shadow-lg overflow-hidden">
                        <div className="bg-[var(--color-brand-surface)] px-5 py-3 border-b border-[var(--color-brand-border)] flex items-center justify-between">
                          <h3 className="font-bold text-[var(--color-brand-text-primary)] text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-orange)]"></span>
                            {problem?.title}
                          </h3>
                          <span className="text-xs font-mono px-2.5 py-1 bg-[var(--color-brand-dark)] rounded-md text-[var(--color-brand-text-secondary)] border border-[var(--color-brand-border)]">{solution?.language}</span>
                        </div>
                        <div className="p-5">
                          <pre className="bg-transparent border border-[var(--color-brand-border)] p-5 rounded-lg text-sm overflow-x-auto text-[var(--color-brand-text-secondary)] font-mono shadow-inner">
                            <code>{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    )) || <p className="text-[var(--color-brand-text-secondary)] italic p-6 text-center border border-dashed border-[var(--color-brand-border)] rounded-xl">Solutions will be available after you solve the problem.</p>}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-gray-200">My Submissions</h2>
                  <div className="text-gray-500">
                    <SubmissionHistory problemId={problemId} />
                  </div>
                </div>
              )}

              {activeLeftTab === 'chatAI' && (
                <div className="prose prose-invert max-w-none">
                  <h2 className="text-xl font-bold mb-4 text-gray-200">CHAT with AI</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <ChatAi problem={problem}></ChatAi>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col bg-transparent">
        {/* Right Tabs */}
        <div className="flex bg-[var(--color-brand-surface)] px-4 overflow-x-auto scrollbar-hide border-b border-[var(--color-brand-border)]">
          {['code', 'testcase', 'result'].map((tab) => (
            <button 
              key={tab}
              className={`px-5 py-3 text-sm font-semibold transition-all border-t-[3px] whitespace-nowrap ${activeRightTab === tab ? 'border-[var(--color-brand-orange)] text-[var(--color-brand-text-primary)] bg-[var(--color-brand-dark)]' : 'border-transparent text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-text-primary)] hover:bg-[var(--color-brand-dark)]/50'}`}
              onClick={() => setActiveRightTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col relative">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col h-full">
              {/* Language Selector */}
              <div className="flex justify-between items-center px-4 py-2 bg-[var(--color-brand-dark)] border-b border-[var(--color-brand-border)]">
                <div className="flex gap-1.5 bg-[var(--color-brand-surface)] p-1 rounded-lg border border-[var(--color-brand-border)] shadow-inner">
                  {['javascript', 'java', 'cpp'].map((lang) => (
                    <button
                      key={lang}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${selectedLanguage === lang ? 'bg-[var(--color-brand-dark)] text-[var(--color-brand-text-primary)] shadow-sm' : 'text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-text-primary)] hover:bg-[var(--color-brand-dark)]'}`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-[var(--color-brand-surface)] flex justify-between items-center border-t border-[var(--color-brand-border)]">
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-1.5 text-sm font-semibold text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-text-primary)] hover:bg-[var(--color-brand-dark)] rounded-lg transition-colors flex items-center gap-2"
                    onClick={() => setActiveRightTab('testcase')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                    Console
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    className={`px-6 py-2 text-sm font-semibold rounded-lg bg-[var(--color-brand-dark)] text-[var(--color-brand-text-primary)] border border-[var(--color-brand-border)] hover:border-[var(--color-brand-orange)] transition-all flex items-center justify-center min-w-[90px] shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Run Code'}
                  </button>
                  <button
                    className={`px-6 py-2 text-sm font-bold rounded-lg bg-[var(--color-brand-orange)] text-[#110F0D] hover:bg-[var(--color-brand-orange-hover)] transition-all flex items-center justify-center min-w-[100px] shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-6 overflow-y-auto bg-transparent">
              <h3 className="font-bold text-lg text-[var(--color-brand-text-primary)] mb-6">Test Results</h3>
              {runResult ? (
                <div className={`p-6 rounded-2xl shadow-lg border ${runResult.success ? 'bg-[var(--color-brand-surface)] border-[#00D26A]/20' : 'bg-[var(--color-brand-surface)] border-[#EF4444]/20'} mb-4`}>
                  <div>
                    {runResult.success ? (
                      <div>
                        <h4 className="font-bold text-[#00D26A] flex items-center gap-3 text-xl">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          All test cases passed!
                        </h4>
                        <div className="flex gap-4 mt-5 text-sm font-medium">
                          <span className="bg-[var(--color-brand-dark)] px-4 py-2 rounded-lg border border-[var(--color-brand-border)] shadow-sm text-[var(--color-brand-text-secondary)]">Runtime: <span className="text-[var(--color-brand-text-primary)]">{runResult.runtime+" sec"}</span></span>
                          <span className="bg-[var(--color-brand-dark)] px-4 py-2 rounded-lg border border-[var(--color-brand-border)] shadow-sm text-[var(--color-brand-text-secondary)]">Memory: <span className="text-[var(--color-brand-text-primary)]">{runResult.memory+" KB"}</span></span>
                        </div>
                        
                        <div className="mt-8 space-y-5">
                          {runResult.testCases.map((tc, i) => (
                            <div key={i} className="bg-[var(--color-brand-dark)] border border-[var(--color-brand-border)] p-5 rounded-xl text-sm shadow-md">
                              <div className="font-mono space-y-3 text-[var(--color-brand-text-secondary)]">
                                <div className="flex items-start"><strong className="text-[var(--color-brand-text-primary)] w-24 flex-shrink-0">Input:</strong> <span>{tc.stdin}</span></div>
                                <div className="flex items-start"><strong className="text-[var(--color-brand-text-primary)] w-24 flex-shrink-0">Expected:</strong> <span>{tc.expected_output}</span></div>
                                <div className="flex items-start"><strong className="text-[var(--color-brand-text-primary)] w-24 flex-shrink-0">Output:</strong> <span>{tc.stdout}</span></div>
                                <div className="text-[#00D26A] font-bold mt-4 pt-4 border-t border-[var(--color-brand-border)] flex items-center gap-2">
                                  ✓ Passed
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-[#EF4444] flex items-center gap-3 text-xl">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                          Error or Failed Test Case
                        </h4>
                        <div className="mt-8 space-y-5">
                          {runResult.testCases.map((tc, i) => (
                            <div key={i} className="bg-[var(--color-brand-dark)] border border-[var(--color-brand-border)] p-5 rounded-xl text-sm shadow-md">
                              <div className="font-mono space-y-3 text-[var(--color-brand-text-secondary)]">
                                <div className="flex items-start"><strong className="text-[var(--color-brand-text-primary)] w-24 flex-shrink-0">Input:</strong> <span>{tc.stdin}</span></div>
                                <div className="flex items-start"><strong className="text-[var(--color-brand-text-primary)] w-24 flex-shrink-0">Expected:</strong> <span>{tc.expected_output}</span></div>
                                <div className="flex items-start"><strong className="text-[var(--color-brand-text-primary)] w-24 flex-shrink-0">Output:</strong> <span>{tc.stdout}</span></div>
                                <div className={`font-bold mt-4 pt-4 border-t border-[var(--color-brand-border)] flex items-center gap-2 ${tc.status_id==3 ? 'text-[#00D26A]' : 'text-[#EF4444]'}`}>
                                  {tc.status_id==3 ? '✓ Passed' : '✗ Failed'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-[var(--color-brand-text-secondary)] flex flex-col items-center justify-center h-48 bg-[var(--color-brand-surface)] border border-dashed border-[var(--color-brand-border)] rounded-2xl shadow-sm">
                  <svg className="w-10 h-10 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  <span>Click <strong className="text-[var(--color-brand-text-primary)]">Run Code</strong> to test your solution with example inputs.</span>
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-6 overflow-y-auto bg-transparent">
              <h3 className="font-bold text-lg text-[var(--color-brand-text-primary)] mb-6">Submission Result</h3>
              {submitResult ? (
                <div className={`p-6 rounded-xl border ${submitResult.accepted ? 'bg-[var(--color-brand-surface)] border-[#00D26A]/30' : 'bg-[var(--color-brand-surface)] border-[#EF4444]/30'}`}>
                  <div>
                    {submitResult.accepted ? (
                      <div>
                        <h4 className="font-bold text-2xl text-[#00D26A] flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          Accepted!
                        </h4>
                        <div className="mt-6 flex flex-col gap-3 font-mono text-[var(--color-brand-text-primary)]">
                          <div className="flex justify-between p-3 bg-[var(--color-brand-dark)] rounded-lg border border-[var(--color-brand-border)]">
                            <span className="text-[var(--color-brand-text-secondary)]">Test Cases Passed</span>
                            <span className="font-bold text-[#00D26A]">{submitResult.passedTestCases}/{submitResult.totalTestCases}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-[var(--color-brand-dark)] rounded-lg border border-[var(--color-brand-border)]">
                            <span className="text-[var(--color-brand-text-secondary)]">Runtime</span>
                            <span className="font-bold text-[var(--color-brand-orange)]">{submitResult.runtime + " sec"}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-[var(--color-brand-dark)] rounded-lg border border-[var(--color-brand-border)]">
                            <span className="text-[var(--color-brand-text-secondary)]">Memory</span>
                            <span className="font-bold text-blue-400">{submitResult.memory + " KB"}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-xl text-[#EF4444] flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                          {submitResult.error || 'Wrong Answer'}
                        </h4>
                        <div className="mt-6 flex flex-col gap-3 font-mono text-[var(--color-brand-text-primary)]">
                          <div className="flex justify-between p-3 bg-[var(--color-brand-dark)] rounded-lg border border-[var(--color-brand-border)]">
                            <span className="text-[var(--color-brand-text-secondary)]">Test Cases Passed</span>
                            <span className="font-bold text-[#EF4444]">{submitResult.passedTestCases}/{submitResult.totalTestCases}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-[var(--color-brand-text-secondary)] flex flex-col items-center justify-center h-40 border border-dashed border-[var(--color-brand-border)] rounded-xl">
                  <svg className="w-8 h-8 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Click "Submit" to evaluate your solution against all test cases.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;