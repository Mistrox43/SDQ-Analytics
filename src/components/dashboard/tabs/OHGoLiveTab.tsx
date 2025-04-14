import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ProjectData, SelectedDateRange, DateRange } from '../../../types';
import { safeDate } from '../../../utils/dateUtils';
import { isGoLiveDateConfirmed } from '../../../utils/dataProcessing';

interface OHGoLiveTabProps {
  filteredData: ProjectData[];
  selectedDateRange?: SelectedDateRange;
  setSelectedDateRange?: React.Dispatch<React.SetStateAction<SelectedDateRange>>;
  dateRange?: DateRange;
}

const OHGoLiveTab: React.FC<OHGoLiveTabProps> = ({ 
  filteredData,
  selectedDateRange: externalSelectedDateRange,
  setSelectedDateRange: externalSetSelectedDateRange,
  dateRange: externalDateRange
}) => {
  const [timeframe, setTimeframe] = useState<string>('monthly');
  const [stackBy, setStackBy] = useState<string | null>(null);
  const [showOnlyConfirmed, setShowOnlyConfirmed] = useState<boolean>(false);
  const [internalSelectedDateRange, setInternalSelectedDateRange] = useState<SelectedDateRange>({ 
    start: null, 
    end: null 
  });
  const [internalDateRange, setInternalDateRange] = useState<DateRange>({ 
    min: null, 
    max: null 
  });

  // Use either external date range props or internal state
  const selectedDateRange = externalSelectedDateRange || internalSelectedDateRange;
  const setSelectedDateRange = externalSetSelectedDateRange || setInternalSelectedDateRange;
  const dateRange = externalDateRange || internalDateRange;

  // Initialize date ranges if using internal state
  React.useEffect(() => {
    if (!externalDateRange && !externalSelectedDateRange) {
      // Calculate date range from OH Go-Live dates
      const dates = filteredData
        .map(row => row['OH Go-Live Date'])
        .filter(Boolean)
        .map(d => safeDate(d))
        .filter(Boolean) as Date[];
      
      if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        
        setInternalDateRange({
          min: minDate,
          max: maxDate
        });
        
        // Initialize selected date range to the last 3 months by default
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        
        // Make sure we're within the actual data range
        const finalStartDate = startDate > minDate ? startDate : minDate;
        const finalEndDate = endDate < maxDate ? endDate : maxDate;
        
        setInternalSelectedDateRange({
          start: finalStartDate,
          end: finalEndDate
        });
      }
    }
  }, [filteredData, externalDateRange, externalSelectedDateRange]);
  
  // Filter data by date range and confirmation status
  const dateFilteredData = useMemo(() => {
    if (!selectedDateRange.start || !selectedDateRange.end) {
      // First filter by date range
      return showOnlyConfirmed 
        ? filteredData.filter(project => isGoLiveDateConfirmed(project))
        : filteredData;
    }
    
    // Filter by date range
    const dateFiltered = filteredData.filter(project => {
      const goLiveDate = safeDate(project['OH Go-Live Date']);
      if (!goLiveDate) return false;
      
      return goLiveDate >= selectedDateRange.start! && goLiveDate <= selectedDateRange.end!;
    });
    
    // Then filter by confirmation status if needed
    return showOnlyConfirmed 
      ? dateFiltered.filter(project => isGoLiveDateConfirmed(project))
      : dateFiltered;
  }, [filteredData, selectedDateRange, showOnlyConfirmed]);
  
  // Calculate OH Go-live date distribution by timeframe
  const goLiveDistribution = useMemo(() => {
    if (!dateFilteredData.length) return [];
    
    // Filter projects with valid OH Go-live dates
    const projectsWithGoLive = dateFilteredData.filter(project => {
      const goLiveDate = safeDate(project['OH Go-Live Date']);
      return goLiveDate !== null;
    });
    
    if (!projectsWithGoLive.length) return [];
    
    if (stackBy) {
      // Create a stacked bar chart data structure
      // First group by time period, then by region, project type, or LOB
      const groupedByTimePeriod: Record<string, Record<string, number>> = {};
      const stackValues = new Set<string>();

      projectsWithGoLive.forEach(project => {
        const goLiveDate = safeDate(project['OH Go-Live Date'])!;
        let timePeriod = '';
        
        // Determine time period key
        if (timeframe === 'monthly') {
          timePeriod = `${goLiveDate.getFullYear()}-${String(goLiveDate.getMonth() + 1).padStart(2, '0')}`;
        } else if (timeframe === 'quarterly') {
          const quarter = Math.floor(goLiveDate.getMonth() / 3) + 1;
          timePeriod = `${goLiveDate.getFullYear()} Q${quarter}`;
        } else if (timeframe === 'yearly') {
          timePeriod = goLiveDate.getFullYear().toString();
        }

        // Get the stack value (region, project type, or LOB)
        let stackValue = 'Unknown';
        if (stackBy === 'region') {
          stackValue = project['OH Region'] || 'Unknown';
        } else if (stackBy === 'projectType') {
          stackValue = project['Project Type'] || 'Unknown';
        } else if (stackBy === 'lob') {
          stackValue = project['LOB'] || 'Unknown';
        }
        
        stackValues.add(stackValue);
        
        // Initialize if needed
        if (!groupedByTimePeriod[timePeriod]) {
          groupedByTimePeriod[timePeriod] = {};
        }
        
        // Increment count
        groupedByTimePeriod[timePeriod][stackValue] = (groupedByTimePeriod[timePeriod][stackValue] || 0) + 1;
      });

      // Convert to array format for recharts
      const result = Object.entries(groupedByTimePeriod).map(([timePeriod, counts]) => {
        const entry: Record<string, any> = { name: timePeriod };
        // Add count for each stack value
        stackValues.forEach(stackValue => {
          entry[stackValue] = counts[stackValue] || 0;
        });
        return entry;
      });

      // Sort chronologically
      return result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Standard non-stacked chart data
      // Group by the selected timeframe
      const distribution: Record<string, number> = {};
      
      projectsWithGoLive.forEach(project => {
        const goLiveDate = safeDate(project['OH Go-Live Date'])!;
        let key = '';
        
        if (timeframe === 'monthly') {
          // Format: "YYYY-MM"
          key = `${goLiveDate.getFullYear()}-${String(goLiveDate.getMonth() + 1).padStart(2, '0')}`;
        } else if (timeframe === 'quarterly') {
          // Determine quarter (Q1: 0-2, Q2: 3-5, Q3: 6-8, Q4: 9-11)
          const quarter = Math.floor(goLiveDate.getMonth() / 3) + 1;
          key = `${goLiveDate.getFullYear()} Q${quarter}`;
        } else if (timeframe === 'yearly') {
          key = goLiveDate.getFullYear().toString();
        }
        
        distribution[key] = (distribution[key] || 0) + 1;
      });
      
      // Convert to array for chart
      return Object.keys(distribution)
        .map(key => ({
          name: key,
          value: distribution[key]
        }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort chronologically
    }
  }, [dateFilteredData, timeframe, stackBy]);
  
  // Get unique stack values (regions, project types, or LOBs)
  const stackKeys = useMemo(() => {
    if (!stackBy || !goLiveDistribution.length) return [];
    
    // Get all keys except 'name'
    const allKeys = Object.keys(goLiveDistribution[0]);
    return allKeys.filter(key => key !== 'name');
  }, [goLiveDistribution, stackBy]);
  
  // Colors for stacked bars
  const colors = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', 
    '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'
  ];
  
  // Format labels for better display
  const formatLabel = (label: string) => {
    if (timeframe === 'monthly') {
      const [year, month] = label.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }
    return label;
  };
  
  // Toggle stack by region, project type, or LOB
  const toggleStackBy = (stackType: string) => {
    if (stackBy === stackType) {
      setStackBy(null); // Turn off if already selected
    } else {
      setStackBy(stackType);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex-shrink-0 mb-3 md:mb-0">
            <h3 className="text-lg font-medium">Date Range Filter</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">From:</label>
              <input 
                type="date" 
                className="p-2 border border-gray-300 rounded-md shadow-sm"
                value={selectedDateRange.start ? selectedDateRange.start.toISOString().split('T')[0] : ''}
                min={dateRange.min ? dateRange.min.toISOString().split('T')[0] : ''}
                max={dateRange.max ? dateRange.max.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setSelectedDateRange(prev => ({ ...prev, start: date }));
                }}
              />
              
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">To:</label>
              <input 
                type="date" 
                className="p-2 border border-gray-300 rounded-md shadow-sm"
                value={selectedDateRange.end ? selectedDateRange.end.toISOString().split('T')[0] : ''}
                min={dateRange.min ? dateRange.min.toISOString().split('T')[0] : ''}
                max={dateRange.max ? dateRange.max.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setSelectedDateRange(prev => ({ ...prev, end: date }));
                }}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 7);
                  setSelectedDateRange({ start, end });
                }}
              >
                7d
              </button>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 30);
                  setSelectedDateRange({ start, end });
                }}
              >
                30d
              </button>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 90);
                  setSelectedDateRange({ start, end });
                }}
              >
                90d
              </button>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded"
                onClick={() => {
                  setSelectedDateRange({ 
                    start: dateRange.min, 
                    end: dateRange.max 
                  });
                }}
              >
                All
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between mb-2">
          <h3 className="text-lg font-medium">OH Go-Live Distribution</h3>
          
          {/* Go-Live Date Confirmation Toggle Switch */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Show All</span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={showOnlyConfirmed}
                onChange={() => setShowOnlyConfirmed(!showOnlyConfirmed)} 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">Confirmed Only</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded ${timeframe === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded ${timeframe === 'quarterly' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setTimeframe('quarterly')}
          >
            Quarterly
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded ${timeframe === 'yearly' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setTimeframe('yearly')}
          >
            Yearly
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded ${stackBy === 'region' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => toggleStackBy('region')}
          >
            By Region
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded ${stackBy === 'projectType' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => toggleStackBy('projectType')}
          >
            By Project Type
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded ${stackBy === 'lob' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => toggleStackBy('lob')}
          >
            By LOB
          </button>
        </div>
      </div>
      
      {/* Bar Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">
          Go-Live Distribution 
          {stackBy === 'region' ? ' (Stacked by Region)' : 
           stackBy === 'projectType' ? ' (Stacked by Project Type)' : 
           stackBy === 'lob' ? ' (Stacked by Line of Business)' : ''}
          {showOnlyConfirmed && <span className="text-sm font-normal ml-2 text-blue-500">(Confirmed Dates Only)</span>}
          {selectedDateRange.start && selectedDateRange.end && (
            <span className="text-sm font-normal ml-2 text-gray-500">
              ({selectedDateRange.start.toLocaleDateString()} - {selectedDateRange.end.toLocaleDateString()})
            </span>
          )}
        </h3>
        <div className="h-96">
          {goLiveDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={goLiveDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatLabel}
                  height={70}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value} projects`, name]}
                  labelFormatter={formatLabel}
                />
                <Legend />
                
                {stackBy ? (
                  // Stacked bars for region, project type, or LOB
                  stackKeys.map((key, index) => (
                    <Bar 
                      key={key}
                      dataKey={key} 
                      name={key} 
                      stackId="a"
                      fill={colors[index % colors.length]} 
                    />
                  ))
                ) : (
                  // Single bar for simple counts
                  <Bar 
                    dataKey="value" 
                    name="OH Go-Live Count" 
                    fill="#0088FE" 
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No OH Go-Live dates available in the filtered data
            </div>
          )}
        </div>
      </div>
      
      {/* Projects Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">
          Projects with OH Go-Live Dates
          {showOnlyConfirmed && <span className="text-sm font-normal ml-2 text-blue-500">(Confirmed Dates Only)</span>}
          {selectedDateRange.start && selectedDateRange.end && (
            <span className="text-sm font-normal ml-2 text-gray-500">
              ({selectedDateRange.start.toLocaleDateString()} - {selectedDateRange.end.toLocaleDateString()})
            </span>
          )}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOB</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kick-Off Date</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OH Go-Live Date</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Go-Live Confirmed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dateFilteredData
                .filter(project => safeDate(project['OH Go-Live Date']) !== null)
                .sort((a, b) => {
                  const dateA = safeDate(a['OH Go-Live Date']) || new Date(0);
                  const dateB = safeDate(b['OH Go-Live Date']) || new Date(0);
                  return dateB.getTime() - dateA.getTime(); // Sort by date descending
                })
                .slice(0, 20)
                .map((project, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-4 text-sm">{project['Project Short Name']}</td>
                    <td className="py-2 px-4 text-sm">{project['Facility Name']}</td>
                    <td className="py-2 px-4 text-sm">{project['Project Status']}</td>
                    <td className="py-2 px-4 text-sm">{project['Project Type']}</td>
                    <td className="py-2 px-4 text-sm">{project['OH Region']}</td>
                    <td className="py-2 px-4 text-sm">{project['LOB']}</td>
                    <td className="py-2 px-4 text-sm">{project['Kick-Off Date']}</td>
                    <td className="py-2 px-4 text-sm">{project['OH Go-Live Date']}</td>
                    <td className="py-2 px-4 text-sm">
                      {isGoLiveDateConfirmed(project) ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Tentative
                        </span>
                      )}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
          {dateFilteredData.filter(project => safeDate(project['OH Go-Live Date']) !== null).length > 20 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Showing 20 of {dateFilteredData.filter(project => safeDate(project['OH Go-Live Date']) !== null).length} projects. Use filters to narrow down results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OHGoLiveTab;