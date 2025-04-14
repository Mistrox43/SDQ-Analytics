import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { safeDate } from '../../../utils/dateUtils';
import { getTimelineDetailProjects } from '../../../utils/dataProcessing';
import { calculateDailyActivityChunked } from '../../../utils/chunkedProcessing';
import { ProjectData, SelectedDateRange, DateRange, DailyActivityItem } from '../../../types';
import VirtualizedTable from '../../ui/VirtualizedTable';

interface TimelinesTabProps {
  filteredData: ProjectData[];
  selectedDateRange: SelectedDateRange;
  setSelectedDateRange: React.Dispatch<React.SetStateAction<SelectedDateRange>>;
  dateRange: DateRange;
}

const TimelinesTab: React.FC<TimelinesTabProps> = ({ 
  filteredData, 
  selectedDateRange, 
  setSelectedDateRange,
  dateRange 
}) => {
  const [selectedTimelineView, setSelectedTimelineView] = useState<string | null>(null);
  const [dailyActivity, setDailyActivity] = useState<DailyActivityItem[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationProgress, setCalculationProgress] = useState<number>(0);
  
  // Memoize date array generation based on selected date range
  const dateArray = useMemo(() => {
    if (!selectedDateRange.start || !selectedDateRange.end) {
      return [];
    }
    
    // Create an array of dates within the selected range
    const result: Date[] = [];
    const currentDate = new Date(selectedDateRange.start);
    const endDate = new Date(selectedDateRange.end);
    
    // Validate dates
    if (isNaN(currentDate.getTime()) || isNaN(endDate.getTime())) {
      return [];
    }
    
    while (currentDate <= endDate) {
      result.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result;
  }, [selectedDateRange.start, selectedDateRange.end]);
  
  // Memoize timeline detail projects to avoid recalculation
  const timelineDetailProjects = useMemo(() => 
    getTimelineDetailProjects(filteredData, selectedDateRange),
    [filteredData, selectedDateRange]
  );
  
  // Calculate daily activity data in chunks when date range or filtered data changes
  useEffect(() => {
    if (dateArray.length === 0 || filteredData.length === 0) {
      setDailyActivity([]);
      return;
    }
    
    setIsCalculating(true);
    setCalculationProgress(0);
    
    // Use chunked processing for better UI responsiveness
    calculateDailyActivityChunked(
      filteredData, 
      dateArray,
      (processed, total) => {
        setCalculationProgress(Math.floor((processed / total) * 100));
      }
    ).then(result => {
      setDailyActivity(result);
      setIsCalculating(false);
    }).catch(error => {
      console.error("Error calculating daily activity:", error);
      setIsCalculating(false);
    });
  }, [filteredData, dateArray]);
  
  // Memoize scatter chart data to avoid recalculation
  const scatterData = useMemo(() => {
    return filteredData
      .filter(d => d && safeDate(d['Testing Start']) && safeDate(d['Testing End']) && 
               safeDate(d['Kick-Off Date']) && safeDate(d['OH Go-Live Date']))
      .map(d => {
        try {
          const testingStart = safeDate(d['Testing Start']);
          const testingEnd = safeDate(d['Testing End']);
          const kickOff = safeDate(d['Kick-Off Date']);
          const goLive = safeDate(d['OH Go-Live Date']);
          
          if (!testingStart || !testingEnd || !kickOff || !goLive) {
            return null;
          }
          
          const testingDuration = Math.max(1, Math.round((testingEnd.getTime() - testingStart.getTime()) / (1000 * 60 * 60 * 24)));
          const projectDuration = Math.max(1, Math.round((goLive.getTime() - kickOff.getTime()) / (1000 * 60 * 60 * 24)));
          
          return {
            name: d['Project Short Name'] || 'Unnamed Project',
            testingDuration,
            projectDuration,
            status: d['Project Status'] || 'Unknown'
          };
        } catch (e) {
          console.error("Error processing project data:", e);
          return null;
        }
      })
      .filter(Boolean);
  }, [filteredData]);

  // Table columns configuration for virtualized table
  const tableColumns = [
    { key: 'Project Short Name', header: 'Project' },
    { key: 'Facility Name', header: 'Facility' },
    { key: 'Project Status', header: 'Status' },
    { 
      key: 'timelineStatus', 
      header: 'Timeline Status',
      render: (value: string) => (
        value === "Active Project" ? (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Active Project
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active Testing
          </span>
        )
      )
    },
    { key: 'Project Type', header: 'Type' },
    { key: 'OH Region', header: 'Region' },
    { key: 'Kick-Off Date', header: 'Kick-Off Date' },
    { key: 'Testing Start', header: 'Testing Start' },
    { key: 'Testing End', header: 'Testing End' },
    { key: 'Hospital Go-Live Date', header: 'Hospital Go-Live' },
    { key: 'OH Go-Live Date', header: 'OH Go-Live' },
  ];
  
  // Format date labels for charts
  const formatDateLabel = (tickItem: string) => {
    if (!tickItem) return '';
    const date = safeDate(tickItem);
    return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
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
      
      {selectedTimelineView === 'projectDetails' ? (
        // Detailed view of projects with virtualization
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Projects Active During Selected Date Range
            </h3>
            <button 
              onClick={() => setSelectedTimelineView(null)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              Back to Charts
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            Showing projects that are active or in testing between{' '}
            <strong>{selectedDateRange.start?.toLocaleDateString()}</strong> and{' '}
            <strong>{selectedDateRange.end?.toLocaleDateString()}</strong>
          </p>
          
          {/* Virtualized table for better performance with large datasets */}
          <VirtualizedTable 
            data={timelineDetailProjects}
            columns={tableColumns}
            visibleRows={15}
          />
        </div>
      ) : (
        // Charts view
        <>
          {/* Daily Activity Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Daily Project Activity</h3>
            <div className="h-80">
              {isCalculating ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="mb-4 text-gray-500">Calculating activity data...</div>
                  <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
                      style={{ width: `${calculationProgress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">{calculationProgress}% complete</div>
                </div>
              ) : dailyActivity && dailyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyActivity}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="dateString" 
                      tick={{ fontSize: 10 }}
                      tickFormatter={formatDateLabel}
                      // Limit number of ticks for better readability
                      interval={Math.max(1, Math.floor(dailyActivity.length / 10))}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => {
                        if (!label) return '';
                        const date = safeDate(label);
                        return date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="activeProjects" 
                      name="Active Projects" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                      // Optimize rendering by reducing data points if many
                      isAnimationActive={dailyActivity.length < 90}
                      dot={dailyActivity.length < 60}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="activeTestingProjects" 
                      name="Active Testing Projects" 
                      stroke="#00C49F" 
                      strokeWidth={2}
                      // Optimize rendering by reducing data points if many
                      isAnimationActive={dailyActivity.length < 90}
                      dot={dailyActivity.length < 60}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available for the selected date range
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Active Projects:</strong> Projects between Kick-off Date and latest Go-Live Date (Hospital or OH)</p>
              <p><strong>Active Testing Projects:</strong> Projects between Testing Start and Testing End dates</p>
              <div className="mt-4 text-right">
                <button 
                  onClick={() => setSelectedTimelineView('projectDetails')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                >
                  View Detailed Projects
                </button>
              </div>
            </div>
          </div>
          
          {/* Testing Timeline Analysis */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Testing Timeline Analysis</h3>
            <div className="h-64">
              {scatterData && scatterData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="testingDuration" 
                      name="Testing Duration (days)" 
                      label={{ value: "Testing Duration (days)", position: "bottom", offset: 0 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="projectDuration" 
                      name="Project Duration (days)" 
                      label={{ value: "Project Duration (days)", angle: -90, position: "left" }}
                    />
                    <ZAxis range={[50, 500]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter 
                      name="Projects" 
                      data={scatterData} 
                      fill="#8884d8"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available for analysis
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(TimelinesTab);