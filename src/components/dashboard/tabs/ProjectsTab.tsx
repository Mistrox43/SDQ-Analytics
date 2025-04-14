import React, { useMemo, useState } from 'react';
import { ProjectData } from '../../../types';
import VirtualizedTable from '../../ui/VirtualizedTable';

interface ProjectsTabProps {
  filteredData: ProjectData[];
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({ filteredData }) => {
  const [sortField, setSortField] = useState<string>('Project Short Name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Define table columns
  const columns = [
    { key: 'Project Short Name', header: 'Project' },
    { key: 'Facility Name', header: 'Facility' },
    { key: 'Project Status', header: 'Status' },
    { key: 'Project Type', header: 'Type' },
    { key: 'LOB', header: 'LOB' },
    { key: 'OH Region', header: 'Region' },
    { key: 'OH Specialist(s)', header: 'Specialist' },
    { key: 'Kick-Off Date', header: 'Kick-Off' },
    { 
      key: 'Hospital Go-Live Date', 
      header: 'Hospital Go-Live',
      render: (value: string) => value || <span className="text-gray-400">Not Set</span>
    },
    { 
      key: 'OH Go-Live Date', 
      header: 'OH Go-Live',
      render: (value: string) => value || <span className="text-gray-400">Not Set</span>
    }
  ];
  
  // Apply search and sorting to data
  const processedData = useMemo(() => {
    // Filter by search term
    let result = filteredData;
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(project => {
        // Search in common fields
        return (
          (project['Project Short Name']?.toLowerCase().includes(lowerSearchTerm) || false) ||
          (project['Facility Name']?.toLowerCase().includes(lowerSearchTerm) || false) ||
          (project['Project Type']?.toLowerCase().includes(lowerSearchTerm) || false) ||
          (project['OH Region']?.toLowerCase().includes(lowerSearchTerm) || false) ||
          (project['OH Specialist(s)']?.toLowerCase().includes(lowerSearchTerm) || false) ||
          (project['LOB']?.toLowerCase().includes(lowerSearchTerm) || false)
        );
      });
    }
    
    // Sort data
    return [...result].sort((a, b) => {
      // Get values to compare
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Handle nulls and undefined
      if (!aValue && !bValue) return 0;
      if (!aValue) return sortDirection === 'asc' ? -1 : 1;
      if (!bValue) return sortDirection === 'asc' ? 1 : -1;
      
      // Try to compare as dates first
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        return sortDirection === 'asc' 
          ? aDate.getTime() - bDate.getTime() 
          : bDate.getTime() - aDate.getTime();
      }
      
      // Fall back to string comparison
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, searchTerm, sortField, sortDirection]);
  
  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and reset to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Project List</h3>
        
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects..."
            className="pl-8 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg 
            className="w-5 h-5 text-gray-400 absolute left-2 top-2.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
      
      {/* Sortable column headers */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex bg-gray-100 p-2 rounded-t-md">
          {columns.map((column) => (
            <div 
              key={column.key}
              className="flex-1 min-w-0 px-2 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => handleSort(column.key)}
            >
              <div className="flex items-center">
                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {column.header}
                </span>
                {sortField === column.key && (
                  <svg 
                    className={`w-4 h-4 ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Virtualized table */}
      {processedData.length > 0 ? (
        <VirtualizedTable 
          data={processedData} 
          columns={columns}
          visibleRows={20}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          No projects match your search criteria
        </div>
      )}
    </div>
  );
};

export default React.memo(ProjectsTab);