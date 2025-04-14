import React, { useState } from 'react';
import { calculateDataQualityIssues } from '../../../utils/dataProcessing';
import { ProjectData, DataQualityIssue } from '../../../types';

interface DataQualityTabProps {
  filteredData: ProjectData[];
}

const DataQualityTab: React.FC<DataQualityTabProps> = ({ filteredData }) => {
  const [selectedDataQualityIssue, setSelectedDataQualityIssue] = useState<string | null>(null);
  
  // Calculate data quality issues
  const dataQualityIssues = calculateDataQualityIssues(filteredData);

  return (
    <div className="space-y-6">
      {selectedDataQualityIssue ? (
        // Detailed view of selected data quality issue
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {dataQualityIssues.find(issue => issue.id === selectedDataQualityIssue)?.title}
            </h3>
            <button 
              onClick={() => setSelectedDataQualityIssue(null)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              Back to Summary
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            {dataQualityIssues.find(issue => issue.id === selectedDataQualityIssue)?.description}
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kick-Off</th>
                  {selectedDataQualityIssue === 'missingGoLive' && (
                    <>
                      <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kick-Off Date</th>
                      <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital Go-Live</th>
                      <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OH Go-Live</th>
                    </>
                  )}
                  {selectedDataQualityIssue === 'missingKickOff' && (
                    <>
                      <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kick-Off Date</th>
                      <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital Go-Live</th>
                      <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OH Go-Live</th>
                    </>
                  )}
                  {selectedDataQualityIssue === 'missingTestingDate' && (
                    <>
                      <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Testing Start</th>
                      <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Testing End</th>
                    </>
                  )}
                  {selectedDataQualityIssue === 'charterIrregularity' && (
                    <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charter Status</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dataQualityIssues.find(issue => issue.id === selectedDataQualityIssue)?.data.map((project, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-4 text-sm">{project['Project Short Name']}</td>
                    <td className="py-2 px-4 text-sm">{project['Facility Name']}</td>
                    <td className="py-2 px-4 text-sm">{project['Project Status']}</td>
                    <td className="py-2 px-4 text-sm">{project['Project Type']}</td>
                    <td className="py-2 px-4 text-sm">{project['OH Region']}</td>
                    <td className="py-2 px-4 text-sm">{project['Kick-Off Date']}</td>
                    {selectedDataQualityIssue === 'missingGoLive' && (
                      <>
                        <td className="py-2 px-4 text-sm">{project['Kick-Off Date']}</td>
                        <td className="py-2 px-4 text-sm">{project['Hospital Go-Live Date'] || <span className="text-red-500">Missing</span>}</td>
                        <td className="py-2 px-4 text-sm">{project['OH Go-Live Date'] || <span className="text-red-500">Missing</span>}</td>
                      </>
                    )}
                    {selectedDataQualityIssue === 'missingKickOff' && (
                      <>
                        <td className="py-2 px-4 text-sm">{project['Kick-Off Date'] || <span className="text-red-500">Missing</span>}</td>
                        <td className="py-2 px-4 text-sm">{project['Hospital Go-Live Date'] || <span className="text-red-500">Missing</span>}</td>
                        <td className="py-2 px-4 text-sm">{project['OH Go-Live Date'] || <span className="text-red-500">Missing</span>}</td>
                      </>
                    )}
                    {selectedDataQualityIssue === 'missingTestingDate' && (
                      <>
                        <td className="py-2 px-4 text-sm">{project['Testing Start'] || <span className="text-red-500">Missing</span>}</td>
                        <td className="py-2 px-4 text-sm">{project['Testing End'] || <span className="text-red-500">Missing</span>}</td>
                      </>
                    )}
                    {selectedDataQualityIssue === 'charterIrregularity' && (
                      <td className="py-2 px-4 text-sm">{project['Charter Status'] || <span className="text-red-500">Missing</span>}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Summary cards view
        <>
          <h3 className="text-lg font-medium">Data Quality Issues</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dataQualityIssues.map((issue) => (
              <div 
                key={issue.id}
                className={`${issue.color} rounded-lg p-6 shadow cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => setSelectedDataQualityIssue(issue.id)}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${issue.color} mr-4`}>
                    <svg className={`w-6 h-6 ${issue.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{issue.count}</p>
                    <p className="text-sm font-medium">{issue.title}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm">{issue.description}</p>
                <div className="mt-4 text-right">
                  <span className="text-xs font-medium underline">View Details</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DataQualityTab;