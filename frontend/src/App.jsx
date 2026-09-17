import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';
import ForecastPage from './pages/ForecastPage';
import ExplainabilityPage from './pages/ExplainabilityPage';
import AboutPage from './pages/AboutPage';

import { 
  loadSampleData, 
  uploadCSV, 
  getAnalysis, 
  getForecast, 
  getExplainability 
} from './api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [datasetSummary, setDatasetSummary] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [edaData, setEdaData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [explainData, setExplainData] = useState(null);

  // Status States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Initial Mount: Automatically load synthetic sample dataset
  useEffect(() => {
    handleLoadSample();
  }, []);

  // Helper to load sample dataset
  const handleLoadSample = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await loadSampleData();
      if (res.status === 'success') {
        setDatasetSummary(res.summary);
        setPreviewData(res.preview);
        
        // Fetch EDA and Forecast automatically for immediate demo
        await fetchAllDerivedData(14);
      }
    } catch (err) {
      console.error("Failed to load sample dataset:", err);
      setErrorMessage(err.response?.data?.detail || "Could not connect to backend server (http://127.0.0.1:8000). Please verify FastAPI server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to upload custom CSV file
  const handleUploadFile = async (file) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await uploadCSV(file);
      if (res.status === 'success') {
        setDatasetSummary(res.summary);
        setPreviewData(res.preview);

        // Fetch EDA and Forecast automatically
        await fetchAllDerivedData(14);
      }
    } catch (err) {
      console.error("Failed to upload CSV:", err);
      setErrorMessage(err.response?.data?.detail || "CSV upload failed. Please verify CSV format and column types.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to fetch EDA, Forecast, and Explainability
  const fetchAllDerivedData = async (horizon = 14) => {
    try {
      const [analysisRes, forecastRes, explainRes] = await Promise.all([
        getAnalysis(),
        getForecast(horizon),
        getExplainability()
      ]);

      if (analysisRes.status === 'success') setEdaData(analysisRes.eda);
      if (forecastRes.status === 'success') setForecastData(forecastRes.results);
      if (explainRes.status === 'success') setExplainData(explainRes.explainability);
    } catch (err) {
      console.error("Error fetching derived analysis:", err);
    }
  };

  // Helper to re-run forecast with custom horizon
  const handleRunForecast = async (horizon) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await getForecast(horizon);
      if (res.status === 'success') {
        setForecastData(res.results);
      }
    } catch (err) {
      console.error("Error executing forecast:", err);
      setErrorMessage(err.response?.data?.detail || "Forecast execution failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to re-run explainability
  const handleRunExplain = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await getExplainability();
      if (res.status === 'success') {
        setExplainData(res.explainability);
      }
    } catch (err) {
      console.error("Error executing explainability:", err);
      setErrorMessage(err.response?.data?.detail || "Explainability execution failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <Header 
          datasetSummary={datasetSummary} 
          onReloadSample={handleLoadSample} 
        />

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mx-8 mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button 
              onClick={() => setErrorMessage('')}
              className="font-bold underline text-rose-900 ml-4 hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              datasetSummary={datasetSummary}
              edaData={edaData}
              forecastData={forecastData}
              setActiveTab={setActiveTab}
              onLoadSample={handleLoadSample}
            />
          )}

          {activeTab === 'upload' && (
            <UploadPage 
              datasetSummary={datasetSummary}
              previewData={previewData}
              onUploadFile={handleUploadFile}
              onLoadSample={handleLoadSample}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'analysis' && (
            <AnalysisPage 
              edaData={edaData}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastPage 
              forecastData={forecastData}
              onRunForecast={handleRunForecast}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'explainability' && (
            <ExplainabilityPage 
              explainData={explainData}
              isLoading={isLoading}
              onRunExplain={handleRunExplain}
            />
          )}

          {activeTab === 'about' && (
            <AboutPage />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
