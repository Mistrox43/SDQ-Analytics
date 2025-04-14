import React, { useState } from 'react';
import FilterBar from './filters/FilterBar';
import OverviewTab from './tabs/OverviewTab';
import TimelinesTab from './tabs/TimelinesTab';
import ResourcesTab from './tabs/ResourcesTab';
import DataQualityTab from './tabs/DataQualityTab';
import ProjectsTab from './tabs/ProjectsTab';
import OHGoLiveTab from './tabs/OHGoLiveTab';
import { getFilteredData } from '../../utils/dataProcessing';
import { useCSVData } from '../../hooks/useCSVData';

/**
 * Main Dashboard component that orchestrates the entire application
 */
const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Use our custom hook for CSV data management
  const {
    csvData,
    isLoading,
    error,
    dateRange,
    selectedDateRange,
    setSelectedDateRange,
    filters,
    setFilters,
    filterOptions,
    handleFileUpload
  } = useCSVData();

  // Get filtered data based on current filters
  const filteredData = getFilteredData(csvData, filters);

  // If no data, show upload prompt
  if (!csvData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="p-8 rounded-lg shadow-lg bg-white max-w-lg w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Service Delivery Queue Dashboard</h1>
          
          <p className="mb-6 text-gray-600">
            Upload your Service Delivery Queue CSV to visualize and analyze project data.
          </p>
          
          <div className="flex flex-col items-center">
            <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border border-blue-500 cursor-pointer hover:bg-blue-50">
              <svg className="w-8 h-8 text-blue-500" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
              </svg>
              <span className="mt-2 text-base leading-normal text-blue-500">Select a CSV file</span>
              <input type='file' className="hidden" accept=".csv" onChange={handleFileUpload} />
            </label>
            
            {isLoading && <p className="mt-4 text-gray-600">Loading data...</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard with tabs
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Service Delivery Queue Dashboard</h1>
          <div>
            <label className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
              Upload New CSV
              <input type='file' className="hidden" accept=".csv" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter controls */}
        <FilterBar 
          filters={filters}
          setFilters={setFilters}
          filterOptions={filterOptions}
        />
        
        {/* Navigation Tabs */}
        <div className="mb-6 bg-white shadow rounded-lg">
          <nav className="flex flex-wrap">
            <button 
              className={`px-4 py-3 font-medium text-sm rounded-t-lg ${activeTab === 'overview' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`px-4 py-3 font-medium text-sm rounded-t-lg ${activeTab === 'timelines' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('timelines')}
            >
              Timelines
            </button>
            <button 
              className={`px-4 py-3 font-medium text-sm rounded-t-lg ${activeTab === 'resources' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('resources')}
            >
              Resources
            </button>
            <button 
              className={`px-4 py-3 font-medium text-sm rounded-t-lg ${activeTab === 'ohGoLive' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('ohGoLive')}
            >
              OH Go-Live
            </button>
            <button 
              className={`px-4 py-3 font-medium text-sm rounded-t-lg ${activeTab === 'dataQuality' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('dataQuality')}
            >
              Data Quality
            </button>
            <button 
              className={`px-4 py-3 font-medium text-sm rounded-t-lg ${activeTab === 'projects' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('projects')}
            >
              Project List
            </button>
          </nav>
        </div>
        
        {/* Dashboard Content - Dynamic based on active tab */}
        {activeTab === 'overview' && (
          <OverviewTab filteredData={filteredData} />
        )}
        
        {activeTab === 'timelines' && (
          <TimelinesTab 
            filteredData={filteredData} 
            selectedDateRange={selectedDateRange} 
            setSelectedDateRange={setSelectedDateRange}
            dateRange={dateRange}
          />
        )}
        
        {activeTab === 'resources' && (
          <ResourcesTab filteredData={filteredData} />
        )}

        {activeTab === 'ohGoLive' && (
          <OHGoLiveTab 
            filteredData={filteredData}
            selectedDateRange={selectedDateRange}
            setSelectedDateRange={setSelectedDateRange}
            dateRange={dateRange}
          />
        )}
        
        {activeTab === 'dataQuality' && (
          <DataQualityTab filteredData={filteredData} />
        )}
        
        {activeTab === 'projects' && (
          <ProjectsTab filteredData={filteredData} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;