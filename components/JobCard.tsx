
import React from 'react';
import { JobPosting } from '../types';

interface JobCardProps {
  job: JobPosting;
  onUpdate: (updatedJob: JobPosting) => void;
  onRemove: () => void;
  index: number;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onUpdate, onRemove, index }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md border-l-4 border-l-indigo-500">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600">
            {index + 1}
          </div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opportunity Entry</h3>
        </div>
        <button 
          onClick={onRemove}
          className="text-gray-300 hover:text-rose-500 transition-colors p-1"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>
      
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">Company (Optional Override)</label>
            <input
              type="text"
              placeholder="Inferred automatically if empty"
              value={job.company || ''}
              onChange={(e) => onUpdate({ ...job, company: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-gray-600"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">Job Title (Optional Override)</label>
            <input
              type="text"
              placeholder="Inferred automatically if empty"
              value={job.title || ''}
              onChange={(e) => onUpdate({ ...job, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">Manual Description</label>
          <textarea
            placeholder="Paste the job description here..."
            value={job.description || ''}
            onChange={(e) => onUpdate({ ...job, description: e.target.value })}
            className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-gray-600 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
