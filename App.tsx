
import React, { useState } from 'react';
import { UserPreferences, JobPosting, EvaluationResult } from './types';
import { getManualJobDetails } from './services/geminiService';
import { evaluateJobsWithOpenAI } from './services/openaiService';
import { PreferenceSlider } from './components/PreferenceSlider';
import { JobCard } from './components/JobCard';
import { ResultDashboard } from './components/ResultDashboard';
import { ResumeInput } from './components/ResumeInput';

const App: React.FC = () => {
  const [openaiKey, setOpenaiKey] = useState<string>('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    salaryWeight: 7,
    remoteWeight: 8,
    cultureWeight: 5,
    growthWeight: 6,
    techStackWeight: 9,
    customNotes: '',
  });

  const [resumeText, setResumeText] = useState<string>('');
  const [jobs, setJobs] = useState<JobPosting[]>([
    { id: '1', description: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddJob = () => {
    setJobs([...jobs, { id: Math.random().toString(36).substr(2, 9), description: '' }]);
  };

  const handleUpdateJob = (index: number, updatedJob: JobPosting) => {
    const newJobs = [...jobs];
    newJobs[index] = updatedJob;
    setJobs(newJobs);
  };

  const handleRemoveJob = (index: number) => {
    if (jobs.length <= 1) return;
    setJobs(jobs.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!openaiKey.trim()) {
      setError("Please provide your OpenAI API Key.");
      return;
    }
    if (!resumeText.trim()) {
      setError("Please provide your resume first.");
      return;
    }
    if (jobs.some(j => !j.description?.trim())) {
      setError("Each job must have a manual description.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setLoadingStage("Analyzing matches and generating materials...");
      const scrapedData = await getManualJobDetails(jobs);
      let evaluationResult: any = null;
      try {
        evaluationResult = await evaluateJobsWithOpenAI(
          { ...preferences, openaiKey },
          scrapedData,
          resumeText
        );
      } catch (openaiError: any) {
        console.error('[OpenAI error]', {
          message: openaiError.message || openaiError,
          apiKey: openaiKey,
          resume: resumeText,
          jobs: scrapedData,
          stack: openaiError.stack || ''
        });
        setError('OpenAI error: Failed to analyze jobs. See console for details.');
        setResult(null);
        return;
      }
      if (!evaluationResult || !evaluationResult.evaluations || evaluationResult.evaluations.length === 0) {
        console.error('[No evaluation results]', {
          apiKey: openaiKey,
          resume: resumeText,
          jobs: scrapedData,
          rawResult: evaluationResult
        });
        setError('No evaluation results were generated. See console for details.');
        setResult(null);
      } else {
        setResult(evaluationResult);
      }
    } catch (err: any) {
      console.error('[General error]', {
        message: err.message || err,
        apiKey: openaiKey,
        resume: resumeText,
        jobs,
        stack: err.stack || ''
      });
      setError('General error: Analysis failed. See console for details.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const resetForm = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <i className="fa-solid fa-briefcase text-white text-xl"></i>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent italic">Job6Match Hybrid</span>
            </div>
            <button 
              onClick={resetForm}
              className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {!result ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-key text-amber-500"></i>
                  Configuration
                </h2>
                <input
                  type="password"
                  placeholder="OpenAI API Key (sk-...)"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-700 font-medium placeholder:text-gray-300 shadow-inner"
                />
              </div>

              <ResumeInput resumeText={resumeText} onUpdate={setResumeText} />
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-sliders text-indigo-500"></i>
                  Priority weights
                </h2>
                <div className="space-y-1">
                  <PreferenceSlider label="Salary" icon="fa-solid fa-money-bill-wave" value={preferences.salaryWeight} onChange={(v) => setPreferences({ ...preferences, salaryWeight: v })} />
                  <PreferenceSlider label="Remote" icon="fa-solid fa-house-laptop" value={preferences.remoteWeight} onChange={(v) => setPreferences({ ...preferences, remoteWeight: v })} />
                  <PreferenceSlider label="Culture" icon="fa-solid fa-heart" value={preferences.cultureWeight} onChange={(v) => setPreferences({ ...preferences, cultureWeight: v })} />
                  <PreferenceSlider label="Growth" icon="fa-solid fa-arrow-trend-up" value={preferences.growthWeight} onChange={(v) => setPreferences({ ...preferences, growthWeight: v })} />
                  <PreferenceSlider label="Tech Stack" icon="fa-solid fa-code" value={preferences.techStackWeight} onChange={(v) => setPreferences({ ...preferences, techStackWeight: v })} />
                  
                  {/* Custom Preferences Text Box directly below Tech Stack */}
                  <div className="py-6 border-t border-indigo-50 mt-4">
                    <label className="block text-[10px] font-black text-indigo-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                      Additional Preferences & Dealbreakers
                    </label>
                    <div className="relative">
                      <textarea
                        placeholder="e.g. 'Must use React 19', 'No early meetings', 'Pet-friendly office', 'No web3 companies'..."
                        value={preferences.customNotes}
                        onChange={(e) => setPreferences({ ...preferences, customNotes: e.target.value })}
                        className="w-full h-32 px-4 py-3 bg-indigo-50/30 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-xs text-gray-700 resize-none leading-relaxed transition-all placeholder:text-indigo-300 shadow-sm"
                      />
                      <div className="absolute bottom-3 right-3 text-indigo-200">
                        <i className="fa-solid fa-feather-pointed"></i>
                      </div>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-2 italic">* Mention anything else you care about. AI will adjust scores based on these notes.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 italic tracking-tight uppercase">Job Postings</h1>
                  <p className="text-gray-500 mt-1 text-sm font-medium italic">Gemini visits external URLs to automatically extract descriptions.</p>
                </div>
                <button
                  onClick={handleAddJob}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <i className="fa-solid fa-plus"></i>
                  Add Opportunity
                </button>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl flex items-center gap-3 animate-pulse">
                  <i className="fa-solid fa-circle-exclamation text-xl"></i>
                  <span className="font-bold text-xs uppercase tracking-wide">{error}</span>
                </div>
              )}

              <div className="space-y-6">
                {jobs.map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    index={index}
                    onUpdate={(updatedJob) => handleUpdateJob(index, updatedJob)}
                    onRemove={() => handleRemoveJob(index)}
                  />
                ))}
              </div>

              <div className="pt-6 sticky bottom-6 z-40">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex flex-col items-center justify-center gap-2 ${
                    loading 
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:-translate-y-1'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mb-1"></div>
                      <span className="text-[10px] tracking-normal font-bold uppercase">{loadingStage}</span>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-bolt-lightning text-lg"></i>
                      Tailor & Analyze Everything
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <button onClick={resetForm} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline group">
                <i className="fa-solid fa-chevron-left group-hover:-translate-x-1 transition-transform"></i>
                Back to Dashboard
              </button>
              <div className="text-right">
                <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight italic">Hybrid AI Report</h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Tailored Specifically for your profile</p>
              </div>
            </div>
            <ResultDashboard result={result} jobs={jobs} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
