import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ProjectData, ChartDataItem } from '../../../types';
import { calculateProjectTypeDistribution, calculateLOBDistribution } from '../../../utils/dataProcessing';

interface OverviewTabProps {
  filteredData: ProjectData[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ filteredData }) => {
  // Calculate chart data
  const projectTypeDistribution = calculateProjectTypeDistribution(filteredData);
  const lobDistribution = calculateLOBDistribution(filteredData);

  return (
    <div className="space-y-6">
      {/* Project Progression */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Project Status Progression</h3>
        <div className="overflow-hidden">
          <div className="relative">
            <div className="flex items-center justify-between w-full py-6">
              {/* Status progression bar */}
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div className="relative">
                  {/* Investigation - 01 */}
                  <div className="absolute left-0 -mt-5 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">01</div>
                    <div className="text-xs mt-1 whitespace-nowrap">Investigation</div>
                    <div className="text-xs mt-1 font-bold">
                      {filteredData.filter(d => d['Project Status'] === '01 - Investigation').length}
                    </div>
                  </div>
                  
                  {/* Planning - 03 */}
                  <div className="absolute left-1/4 -mt-5 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">03</div>
                    <div className="text-xs mt-1 whitespace-nowrap">Planning</div>
                    <div className="text-xs mt-1 font-bold">
                      {filteredData.filter(d => d['Project Status'] === '03 - Planning').length}
                    </div>
                  </div>
                  
                  {/* In Progress - 04 */}
                  <div className="absolute left-2/4 -mt-5 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">04</div>
                    <div className="text-xs mt-1 whitespace-nowrap">In Progress</div>
                    <div className="text-xs mt-1 font-bold">
                      {filteredData.filter(d => d['Project Status'] === '04 - In Progress').length}
                    </div>
                  </div>
                  
                  {/* Post Go-Live - 05 */}
                  <div className="absolute left-3/4 -mt-5 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">05</div>
                    <div className="text-xs mt-1 whitespace-nowrap">Post Go-Live</div>
                    <div className="text-xs mt-1 font-bold">
                      {filteredData.filter(d => d['Project Status'] === '05 - Post Go-Live').length}
                    </div>
                  </div>
                  
                  {/* Complete - 06 */}
                  <div className="absolute right-0 -mt-5 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">06</div>
                    <div className="text-xs mt-1 whitespace-nowrap">Complete</div>
                    <div className="text-xs mt-1 font-bold">
                      {filteredData.filter(d => d['Project Status'] === '06 - Complete').length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <h4 className="text-sm font-medium mb-2">Special Statuses</h4>
            <div className="flex flex-nowrap space-x-4">
              <div className="bg-gray-100 p-4 rounded-lg flex-1">
                <div className="text-xs text-gray-700">PIT Team Planning/Scheduling</div>
                <div className="text-lg font-bold">
                  {filteredData.filter(d => d['Project Status'] === '00 - PIT Team Planning/Scheduling Activity').length}
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg flex-1">
                <div className="text-xs text-gray-700">Facility Led Project</div>
                <div className="text-lg font-bold">
                  {filteredData.filter(d => d['Project Status'] === '07 - Facility Led Project - Tracking Purpose Only').length}
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg flex-1">
                <div className="text-xs text-gray-700">On Hold</div>
                <div className="text-lg font-bold">
                  {filteredData.filter(d => d['Project Status'] === '08 - On Hold').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Types */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Project Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={projectTypeDistribution.sort((a, b) => b.value - a.value)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="Projects" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Line of Business */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Line of Business Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={lobDistribution.sort((a, b) => b.value - a.value)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="Projects" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;