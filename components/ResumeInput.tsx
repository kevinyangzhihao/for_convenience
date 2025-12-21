
import React, { useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs`;

interface ResumeInputProps {
  resumeText: string;
  onUpdate: (text: string) => void;
}

export const ResumeInput: React.FC<ResumeInputProps> = ({ resumeText, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);

    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractTextFromPDF(arrayBuffer);
        onUpdate(text);
        setIsEditing(true);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          onUpdate(text);
          setIsEditing(true);
          setIsParsing(false);
        };
        reader.readAsText(file);
        return; // handle async inside onload
      }
    } catch (err) {
      console.error("PDF Parsing Error:", err);
      setError("Failed to parse PDF. Please try a different file or paste text manually.");
    } finally {
      setIsParsing(false);
    }
  };

  const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <i className="fa-solid fa-file-invoice text-indigo-500"></i>
          Professional Profile
        </h2>
        {resumeText && !isParsing && (
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">
            {wordCount} Words Ready
          </span>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i>
            {error}
          </div>
        )}

        {isParsing ? (
          <div className="border-2 border-dashed border-indigo-100 rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-indigo-50/20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
              <p className="text-sm font-bold text-indigo-700">Analyzing PDF Structure</p>
              <p className="text-xs text-indigo-400 mt-1">Extracting experience and skills...</p>
            </div>
          </div>
        ) : !resumeText && !isEditing ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-file-pdf text-xl"></i>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-700">Upload PDF or Text</p>
              <p className="text-xs text-gray-400 mt-1">Drag & drop your resume here</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".pdf,.txt,.md" 
              className="hidden" 
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Extracted Content</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 px-2 py-1 hover:bg-indigo-50 rounded"
                >
                  {isEditing ? 'Save Preview' : 'Edit Text'}
                </button>
                <button 
                  onClick={() => { onUpdate(''); setIsEditing(false); }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 px-2 py-1 hover:bg-rose-50 rounded"
                >
                  Reset
                </button>
              </div>
            </div>
            
            {isEditing ? (
              <textarea
                value={resumeText}
                onChange={(e) => onUpdate(e.target.value)}
                placeholder="Paste your resume content here..."
                className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-600 font-mono leading-relaxed resize-none"
              />
            ) : (
              <div className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500 overflow-y-auto italic whitespace-pre-wrap">
                {resumeText || "No content provided yet..."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
