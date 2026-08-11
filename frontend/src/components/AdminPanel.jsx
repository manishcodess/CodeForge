import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { FileText, Terminal, Code, Plus, Trash2, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';

// Zod schema matching the problem schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await axiosClient.post('/problem/create', data);
      toast.success('Problem created successfully!');
      navigate('/admin');
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors) => {
    if (Object.keys(errors).length > 0) {
      toast.error('Form Validation Failed. Please check all required fields.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-sans pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/80 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin')}
              className="p-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-gray-100"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
                Create New Problem
              </h1>
              <p className="text-xs text-gray-500 font-medium">Add a new challenge to CodeForge</p>
            </div>
          </div>
          
          <button 
            onClick={handleSubmit(onSubmit, onError)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FFC801] text-black font-bold rounded-xl hover:bg-[#FFD53D] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_15px_rgba(255,200,1,0.3)]"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSubmitting ? 'Saving...' : 'Publish Problem'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10 space-y-10">
        <form id="problem-form" onSubmit={handleSubmit(onSubmit, onError)} className="space-y-10">
          
          {/* Basic Information */}
          <section className="bg-amber-900/30 rounded-2xl border border-amber-500/40 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#FFC801] to-transparent"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-gray-800">
                <FileText className="text-[#FFC801]" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-100">Basic Information</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Problem Title</label>
                <input
                  {...register('title')}
                  placeholder="e.g. Two Sum"
                  className={`w-full bg-[#0A0A0A] border ${errors.title ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-800 focus:border-[#FFC801] focus:ring-[#FFC801]/20'} rounded-xl px-5 py-3 text-gray-200 outline-none transition-all focus:ring-2`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-2 font-medium">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Problem Description (Supports Markdown/HTML)</label>
                <textarea
                  {...register('description')}
                  placeholder="Describe the problem clearly..."
                  className={`w-full bg-[#0A0A0A] border ${errors.description ? 'border-red-500/50 focus:border-red-500' : 'border-gray-800 focus:border-[#FFC801]'} rounded-xl px-5 py-4 text-gray-200 outline-none transition-all focus:ring-2 focus:ring-[#FFC801]/20 min-h-[160px] resize-y`}
                />
                {errors.description && <p className="text-red-500 text-xs mt-2 font-medium">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Difficulty</label>
                  <select
                    {...register('difficulty')}
                    className={`w-full bg-[#0A0A0A] border ${errors.difficulty ? 'border-red-500/50' : 'border-gray-800 focus:border-[#FFC801]'} rounded-xl px-5 py-3 text-gray-200 outline-none transition-all focus:ring-2 focus:ring-[#FFC801]/20 appearance-none`}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Tag / Category</label>
                  <select
                    {...register('tags')}
                    className={`w-full bg-[#0A0A0A] border ${errors.tags ? 'border-red-500/50' : 'border-gray-800 focus:border-[#FFC801]'} rounded-xl px-5 py-3 text-gray-200 outline-none transition-all focus:ring-2 focus:ring-[#FFC801]/20 appearance-none`}
                  >
                    <option value="array">Array</option>
                    <option value="linkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">Dynamic Programming</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Test Cases */}
          <section className="bg-emerald-900/30 rounded-2xl border border-emerald-500/40 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#00D26A] to-transparent"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-gray-800">
                <Terminal className="text-[#00D26A]" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-100">Test Cases</h2>
                <p className="text-xs text-gray-500 mt-1">Define the inputs and expected outputs for validation.</p>
              </div>
            </div>

            <div className="space-y-12">
              {/* Visible Test Cases */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gray-200">Visible Test Cases</h3>
                  <button
                    type="button"
                    onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors text-gray-200"
                  >
                    <Plus size={16} /> Add Case
                  </button>
                </div>
                
                {errors.visibleTestCases?.root && (
                  <p className="text-red-500 text-sm mb-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{errors.visibleTestCases.root.message}</p>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {visibleFields.map((field, index) => (
                    <div key={field.id} className="group bg-[#0A0A0A] border border-gray-800 rounded-xl p-5 relative transition-all hover:border-gray-600">
                      <button
                        type="button"
                        onClick={() => removeVisible(index)}
                        className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                        title="Remove Test Case"
                      >
                        <Trash2 size={16} />
                      </button>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Example {index + 1}</h4>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Input</label>
                            <input
                              {...register(`visibleTestCases.${index}.input`)}
                              placeholder="e.g. [2,7,11,15], 9"
                              className="w-full bg-[#141414] border border-gray-800 focus:border-[#FFC801] rounded-lg px-4 py-2 text-sm text-gray-200 outline-none font-mono"
                            />
                            {errors.visibleTestCases?.[index]?.input && <span className="text-red-500 text-xs mt-1 block">{errors.visibleTestCases[index].input.message}</span>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Expected Output</label>
                            <input
                              {...register(`visibleTestCases.${index}.output`)}
                              placeholder="e.g. [0,1]"
                              className="w-full bg-[#141414] border border-gray-800 focus:border-[#FFC801] rounded-lg px-4 py-2 text-sm text-gray-200 outline-none font-mono"
                            />
                            {errors.visibleTestCases?.[index]?.output && <span className="text-red-500 text-xs mt-1 block">{errors.visibleTestCases[index].output.message}</span>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Explanation</label>
                          <input
                            {...register(`visibleTestCases.${index}.explanation`)}
                            placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                            className="w-full bg-[#141414] border border-gray-800 focus:border-[#FFC801] rounded-lg px-4 py-2 text-sm text-gray-200 outline-none"
                          />
                          {errors.visibleTestCases?.[index]?.explanation && <span className="text-red-500 text-xs mt-1 block">{errors.visibleTestCases[index].explanation.message}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {visibleFields.length === 0 && (
                    <div className="text-center p-8 border border-dashed border-gray-800 rounded-xl text-gray-500">
                      No visible test cases added yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full h-px bg-gray-800/50"></div>

              {/* Hidden Test Cases */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gray-200">Hidden Test Cases</h3>
                  <button
                    type="button"
                    onClick={() => appendHidden({ input: '', output: '' })}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors text-gray-200"
                  >
                    <Plus size={16} /> Add Hidden Case
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hiddenFields.map((field, index) => (
                    <div key={field.id} className="group bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 relative transition-all hover:border-gray-600 flex flex-col gap-3">
                       <button
                        type="button"
                        onClick={() => removeHidden(index)}
                        className="absolute top-3 right-3 p-1.5 bg-red-500/10 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                        title="Remove Test Case"
                      >
                        <Trash2 size={14} />
                      </button>
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hidden Case {index + 1}</h4>
                      
                      <div>
                        <input
                          {...register(`hiddenTestCases.${index}.input`)}
                          placeholder="Input"
                          className="w-full bg-[#141414] border border-gray-800 focus:border-[#FFC801] rounded-lg px-3 py-2 text-sm text-gray-200 outline-none font-mono"
                        />
                         {errors.hiddenTestCases?.[index]?.input && <span className="text-red-500 text-xs mt-1 block">{errors.hiddenTestCases[index].input.message}</span>}
                      </div>
                      <div>
                        <input
                          {...register(`hiddenTestCases.${index}.output`)}
                          placeholder="Expected Output"
                          className="w-full bg-[#141414] border border-gray-800 focus:border-[#FFC801] rounded-lg px-3 py-2 text-sm text-gray-200 outline-none font-mono"
                        />
                         {errors.hiddenTestCases?.[index]?.output && <span className="text-red-500 text-xs mt-1 block">{errors.hiddenTestCases[index].output.message}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                 {hiddenFields.length === 0 && (
                    <div className="text-center p-8 border border-dashed border-gray-800 rounded-xl text-gray-500">
                      No hidden test cases added yet.
                    </div>
                  )}
              </div>
            </div>
          </section>

          {/* Code Templates */}
          <section className="bg-blue-900/30 rounded-2xl border border-blue-500/40 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-transparent"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-gray-800">
                <Code className="text-blue-500" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-100">Code Templates</h2>
                <p className="text-xs text-gray-500 mt-1">Provide the starter code and your reference solution for Judge0.</p>
              </div>
            </div>
            
            {errors.startCode?.root && <p className="text-red-500 text-sm mb-4">{errors.startCode.root.message}</p>}
            {errors.referenceSolution?.root && <p className="text-red-500 text-sm mb-4">{errors.referenceSolution.root.message}</p>}

            <div className="space-y-10">
              {[0, 1, 2].map((index) => {
                const langName = index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript';
                const langColor = index === 0 ? 'text-blue-400' : index === 1 ? 'text-red-400' : 'text-yellow-400';
                
                return (
                <div key={index} className="bg-[#0A0A0A] border border-gray-800 rounded-xl overflow-hidden shadow-inner">
                  <div className="bg-[#111] px-5 py-3 border-b border-gray-800 flex items-center justify-between">
                    <h3 className={`font-bold ${langColor} flex items-center gap-2`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      {langName}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
                    {/* Initial Code */}
                    <div className="p-4 flex flex-col">
                      <label className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider flex justify-between items-center">
                        Initial Starter Code
                        {errors.startCode?.[index]?.initialCode && <span className="text-red-500 lowercase normal-case tracking-normal">Required</span>}
                      </label>
                      <textarea
                        {...register(`startCode.${index}.initialCode`)}
                        placeholder={`// Write ${langName} starter code here...`}
                        className="flex-1 w-full bg-[#141414] border border-gray-800/50 rounded-lg p-4 text-sm text-gray-300 font-mono outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-y min-h-[200px]"
                        spellCheck="false"
                      />
                    </div>
                    
                    {/* Reference Solution */}
                    <div className="p-4 flex flex-col">
                      <label className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider flex justify-between items-center">
                        Reference Complete Solution
                        {errors.referenceSolution?.[index]?.completeCode && <span className="text-red-500 lowercase normal-case tracking-normal">Required</span>}
                      </label>
                      <textarea
                        {...register(`referenceSolution.${index}.completeCode`)}
                        placeholder={`// Write complete working ${langName} solution here...`}
                        className="flex-1 w-full bg-[#141414] border border-gray-800/50 rounded-lg p-4 text-sm text-[#00D26A] font-mono outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-y min-h-[200px]"
                        spellCheck="false"
                      />
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </section>

        </form>
      </div>
    </div>
  );
}

export default AdminPanel;