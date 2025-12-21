
import React, { useState } from 'react';
import { EvaluationResult, JobPosting, WorthApplyingStatus } from '../types';

interface ResultDashboardProps {
  result: EvaluationResult;
  jobs: JobPosting[];
}

type TabType = 'verdict' | 'coverLetter' | 'resume';

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ result, jobs }) => {
  const initialTabId = (result?.evaluations && Array.isArray(result.evaluations) && result.evaluations.length > 0) 
    ? result.evaluations[0].jobId 
    : '';
    
  const [activeTabId, setActiveTabId] = useState<string>(initialTabId);
  const [activeSubTab, setActiveSubTab] = useState<TabType>('verdict');

  if (!result || !result.evaluations || !Array.isArray(result.evaluations) || result.evaluations.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <i className="fa-solid fa-circle-info text-indigo-300 text-4xl mb-4"></i>
        <p className="text-gray-500 font-medium">No evaluation results were generated. Please check your inputs and try again.</p>
      </div>
    );
  }

  const getJobInput = (id: string) => jobs.find(j => j.id === id);

  const getStatusColor = (status: WorthApplyingStatus) => {
    switch (status) {
      case 'Highly Recommended': return 'bg-emerald-500 text-white';
      case 'Worth Applying': return 'bg-blue-500 text-white';
      case 'Maybe': return 'bg-amber-500 text-white';
      case 'Skip It': return 'bg-rose-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const currentEval = result.evaluations.find(e => e.jobId === activeTabId);
  const currentJobInput = getJobInput(activeTabId);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <i className="fa-solid fa-robot text-6xl text-indigo-200"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i>
          Executive Summary
        </h2>
        <p className="text-gray-600 leading-relaxed text-sm">{result.overallInsight}</p>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {result.evaluations.map((evalItem) => {
          return (
            <button
              key={evalItem.jobId}
              onClick={() => { setActiveTabId(evalItem.jobId); setActiveSubTab('verdict'); }}
              className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-3 border ${
                activeTabId === evalItem.jobId 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md translate-y-[-2px]' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              <span className="max-w-[120px] truncate">{evalItem.detectedCompany || 'Company'}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${getStatusColor(evalItem.status as WorthApplyingStatus)}`}>
                {evalItem.worthApplyingScore}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Detailed Analysis Area */}
      {currentEval ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Score & Breakdown */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-indigo-50 mb-4 relative">
                <span className="text-3xl font-black text-indigo-600">{currentEval.worthApplyingScore}</span>
                <span className="text-[10px] absolute -bottom-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Match</span>
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-1 leading-tight">{currentEval.detectedTitle || 'Opportunity'}</h3>
              <p className="text-sm font-semibold text-indigo-500 mb-4">{currentEval.detectedCompany || 'Unknown'}</p>
              
              <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(currentEval.status as WorthApplyingStatus)}`}>
                {currentEval.status}
              </div>

              {/* url相关展示已移除 */}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Factor Breakdown</h4>
              <div className="space-y-5">
                {Array.isArray(currentEval.metrics) && currentEval.metrics.length > 0 ? (
                  currentEval.metrics.map((m, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[11px] font-bold mb-1.5">
                        <span className="text-gray-600">{m.category}</span>
                        <span className="text-indigo-600">{m.score}/100</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${m.score}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed italic">{m.reasoning}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-400">No detailed metrics available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Content Tabs */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                <button 
                  onClick={() => setActiveSubTab('verdict')}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'verdict' ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Analysis
                </button>
                <button 
                  onClick={() => setActiveSubTab('coverLetter')}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'coverLetter' ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Cover Letter
                </button>
                <button 
                  onClick={() => setActiveSubTab('resume')}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'resume' ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Tailored Resume
                </button>
              </div>

              <div className="p-8 flex-1">
                {activeSubTab === 'verdict' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div>
                      <h5 className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-gavel"></i>
                        Strategic Verdict
                      </h5>
                      <p className="text-gray-700 leading-relaxed font-medium italic border-l-4 border-indigo-100 pl-4 bg-indigo-50/20 py-3 rounded-r-lg">
                        {currentEval.verdict}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
                        <h6 className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                          <i className="fa-solid fa-circle-check"></i> Key Strengths
                        </h6>
                        <ul className="text-xs text-emerald-800 space-y-3">
                          {Array.isArray(currentEval.pros) && currentEval.pros.map((p, i) => (
                            <li key={i} className="flex gap-2"><span className="text-emerald-400 font-black">✓</span>{p}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-100">
                        <h6 className="text-rose-700 font-bold text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                          <i className="fa-solid fa-circle-exclamation"></i> Potential Risks
                        </h6>
                        <ul className="text-xs text-rose-800 space-y-3">
                          {Array.isArray(currentEval.cons) && currentEval.cons.map((c, i) => (
                            <li key={i} className="flex gap-2"><span className="text-rose-400 font-black">!</span>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-gray-800 font-black text-xs uppercase tracking-widest mb-2">Detailed Context</h5>
                      <p className="text-gray-600 text-sm leading-relaxed">{currentEval.summary}</p>
                    </div>
                  </div>
                )}

                {activeSubTab === 'coverLetter' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h5 className="text-indigo-600 font-black text-xs uppercase tracking-widest">Custom Cover Letter</h5>
                      <button 
                        onClick={() => copyToClipboard(currentEval.coverLetter, 'Cover Letter')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        <i className="fa-solid fa-copy"></i>
                        Copy Letter
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-8 font-serif text-gray-700 text-sm leading-relaxed whitespace-pre-wrap border border-gray-100 shadow-inner h-[400px] overflow-y-auto">
                      {currentEval.coverLetter}
                    </div>
                  </div>
                )}

                {activeSubTab === 'resume' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h5 className="text-indigo-600 font-black text-xs uppercase tracking-widest">Keyword-Optimized Resume</h5>
                      <button 
                        onClick={() => copyToClipboard(currentEval.tailoredResume, 'Tailored Resume')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        <i className="fa-solid fa-copy"></i>
                        Copy Resume
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-8 font-mono text-gray-700 text-[11px] leading-relaxed whitespace-pre-wrap border border-gray-100 shadow-inner h-[400px] overflow-y-auto">
                      {currentEval.tailoredResume}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center text-gray-400">Select a company tab to see detailed analysis.</div>
      )}
    </div>
  );
};
