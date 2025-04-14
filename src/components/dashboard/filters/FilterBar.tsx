import React from 'react';
import MultiSelect from '../../ui/MultiSelect';
import { Filters, FilterOptions } from '../../../types';

interface FilterBarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filterOptions: FilterOptions;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, filterOptions }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h2 className="text-lg font-medium mb-4">Filters</h2>
      <div className="flex flex-wrap items-end space-x-4">
        <div className="flex-1 min-w-0">
          <MultiSelect
            label="OH Region"
            options={filterOptions.regions}
            value={filters.region}
            onChange={(value) => setFilters({...filters, region: value})}
            placeholder="All Regions"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <MultiSelect
            label="Project Type"
            options={filterOptions.projectTypes}
            value={filters.projectType}
            onChange={(value) => setFilters({...filters, projectType: value})}
            placeholder="All Types"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <MultiSelect
            label="Line of Business"
            options={filterOptions.lobs}
            value={filters.lob}
            onChange={(value) => setFilters({...filters, lob: value})}
            placeholder="All LOBs"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <MultiSelect
            label="Project Status"
            options={filterOptions.statuses}
            value={filters.status}
            onChange={(value) => setFilters({...filters, status: value})}
            placeholder="All Statuses"
          />
        </div>
        
        <div>
          <button 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
            onClick={() => {
              setFilters({
                region: [],
                projectType: [],
                lob: [],
                status: []
              });
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;