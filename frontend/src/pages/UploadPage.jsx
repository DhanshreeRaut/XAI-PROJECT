import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Database } from 'lucide-react';

const UploadPage = ({ 
  datasetSummary, 
  previewData, 
  onUploadFile, 
  onLoadSample, 
  isLoading 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorMessage('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        onUploadFile(file);
      } else {
        setErrorMessage('Invalid file format. Please upload a valid CSV file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        onUploadFile(file);
      } else {
        setErrorMessage('Invalid file format. Please upload a valid CSV file.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dataset Upload & Preprocessing</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload a time-series CSV dataset or click "Use Sample Dataset" to populate synthetic daily sales.
        </p>
      </div>

      {/* Upload Zone & Sample Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drag & Drop Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Upload Custom CSV Dataset</h3>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors flex flex-col items-center justify-center cursor-pointer ${
              dragActive 
                ? 'border-blue-500 bg-blue-50/50' 
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
            }`}
          >
            <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-3">
              <Upload className="w-6 h-6" />
            </div>

            <p className="text-sm font-semibold text-slate-700">
              Drag and drop your CSV file here, or{' '}
              <label htmlFor="file-upload" className="text-blue-600 hover:underline cursor-pointer">
                browse files
              </label>
            </p>
            <p className="text-xs text-slate-400 mt-1">Accepts standard time-series CSV with date and numerical target columns</p>

            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile && (
              <div className="mt-4 flex items-center space-x-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <FileText className="w-4 h-4" />
                <span>Selected: {selectedFile.name}</span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Quick Sample Dataset Action Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base mb-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h3>Sample Dataset</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Don't have a dataset ready? Load our pre-configured synthetic sales dataset containing 130 observations with trend, weekly seasonality, and realistic variance.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={onLoadSample}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Loading...' : 'Use Sample Dataset'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Summary & Data Cleaning Table */}
      {datasetSummary && (
        <div className="space-y-6">
          {/* Quick Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Rows Processed</p>
              <h4 className="text-xl font-bold text-slate-900 mt-1">{datasetSummary.clean_records}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Original: {datasetSummary.original_records}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Detected Date Col</p>
              <h4 className="text-xl font-bold text-blue-600 mt-1 truncate">{datasetSummary.date_column}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Format: YYYY-MM-DD</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Detected Target Col</p>
              <h4 className="text-xl font-bold text-indigo-600 mt-1 truncate">{datasetSummary.target_column}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Numerical Float</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Data Frequency</p>
              <h4 className="text-xl font-bold text-emerald-600 mt-1">{datasetSummary.data_frequency}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{datasetSummary.date_start} to {datasetSummary.date_end}</p>
            </div>
          </div>

          {/* Data Cleaning Detailed Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Data Cleaning Summary</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Original Records</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{datasetSummary.original_records}</span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700 block">Clean Records</span>
                <span className="font-bold text-emerald-900 text-sm mt-0.5 block">{datasetSummary.clean_records}</span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-blue-700 block">Missing Values Handled</span>
                <span className="font-bold text-blue-900 text-sm mt-0.5 block">{datasetSummary.missing_values_handled} (Linear)</span>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                <span className="text-indigo-700 block">Duplicates Removed</span>
                <span className="font-bold text-indigo-900 text-sm mt-0.5 block">{datasetSummary.duplicate_rows_removed}</span>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                <span className="text-purple-700 block">Date Range</span>
                <span className="font-bold text-purple-900 text-xs mt-0.5 block truncate">{datasetSummary.date_start} to {datasetSummary.date_end}</span>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-amber-700 block">Total Columns</span>
                <span className="font-bold text-amber-900 text-sm mt-0.5 block">{datasetSummary.num_columns}</span>
              </div>
            </div>
          </div>

          {/* Dataset Preview Table */}
          {previewData && previewData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Dataset Preview</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Displaying first 20 processed rows</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                  Sorted Chronologically
                </span>
              </div>

              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="py-3 px-6">Row #</th>
                      <th className="py-3 px-6">Date ({datasetSummary.date_column})</th>
                      <th className="py-3 px-6">Target Value ({datasetSummary.target_column})</th>
                      <th className="py-3 px-6">Cleaning Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-6 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-6 font-medium text-slate-900">{row.Date_Str}</td>
                        <td className="py-2.5 px-6 font-bold text-blue-600">{row.Value}</td>
                        <td className="py-2.5 px-6">
                          <span className="inline-flex items-center space-x-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Valid</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
