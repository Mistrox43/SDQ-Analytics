import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { safeDate } from '../../../utils/dateUtils';
import { calculateDailyActivity, getTimelineDetailProjects } from '../../../utils/dataProcessing';
import { ProjectData, SelectedDateRange, DateRange } from '../../../types';

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
  const [selectedTimelineView, setSelectedTimelineView] = React.useState<string | null>(null);
  
  // Calculate timeline data
  const dailyActivity = calculateDailyActivity(filteredData, selectedDateRange);
  const timelineDetailProjects = getTimelineDetailProjects(filteredData, selectedDateRange);

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
        // Detailed view of projects in the date range
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
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline Status</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kick-Off Date</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Testing Start</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Testing End</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital Go-Live</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OH Go-Live</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timelineDetailProjects.slice(0, 50).map((project, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-4 text-sm">{project['Project Short Name']}</td>
                    <td className="py-2 px-4 text-sm">{project['Facility Name']}</td>
                    <td className="py-2 px-4 text-sm">{project['Project Status']}</td>
                    <td className="py-2 px-4 text-sm">
                      {project.timelineStatus === "Active Project" ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Active Project
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active Testing
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-sm">{project['Project Type']}</td>
                    <td className="py-2 px-4 text-sm">{project['OH Region']}</td>
                    <td className="py-2 px-4 text-sm">{project['Kick-Off Date']}</td>
                    <td className="py-2 px-4 text-sm">{project['Testing Start']}</td>
                    <td className="py-2 px-4 text-sm">{project['Testing End']}</td>
                    <td className="py-2 px-4 text-sm">
                      {project['Hospital Go-Live Date'] || <span className="text-gray-400">Not Set</span>}
                    </td>
                    <td className="py-2 px-4 text-sm">
                      {project['OH Go-Live Date'] || <span className="text-gray-400">Not Set</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {timelineDetailProjects.length > 50 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                Showing 50 of {timelineDetailProjects.length} projects. Use filters to narrow down results.
              </div>
            )}
          </div>
        </div>
      ) : (
        // Charts view
        <>
          {/* Daily Activity Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Daily Project Activity</h3>
            <div className="h-80">
              {dailyActivity && dailyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyActivity}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="dateString" 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(tickItem) => {
                        if (!tickItem) return '';
                        const date = safeDate(tickItem);
                        return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                      }}
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
                    />
                    <Line 
                      type="monotone" 
                      dataKey="activeTestingProjects" 
                      name="Active Testing Projects" 
                      stroke="#00C49F" 
                      strokeWidth={2}
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
              {filteredData && filteredData.length > 0 ? (
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
                      data={filteredData
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
                        .filter(Boolean)
                      } 
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

export default TimelinesTab;