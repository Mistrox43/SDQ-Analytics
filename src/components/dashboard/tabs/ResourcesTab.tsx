import React from 'react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { calculateResourceAllocation, calculateProjectLeadAllocation } from '../../../utils/dataProcessing';
import { ProjectData } from '../../../types';

interface ResourcesTabProps {
  filteredData: ProjectData[];
}

const ResourcesTab: React.FC<ResourcesTabProps> = ({ filteredData }) => {
  // Calculate resource allocation data
  const resourceAllocation = calculateResourceAllocation(filteredData);
  const projectLeadAllocation = calculateProjectLeadAllocation(filteredData);

  // Format data for chart
  const resourceChartData = resourceAllocation.map(specialist => {
    // Count projects by status for this specialist
    const counts: Record<string, number> = {};
    
    filteredData.forEach(project => {
      if (project['OH Specialist(s)']) {
        const specialists = project['OH Specialist(s)'].split(';').map(s => s.trim());
        if (specialists.includes(specialist.name)) {
          const status = project['Project Status'] || 'Unknown';
          counts[status] = (counts[status] || 0) + 1;
        }
      }
    });
    
    // Map all statuses individually
    return {
      ...specialist,
      'investigation': counts['01 - Investigation'] || 0,
      'planning': counts['03 - Planning'] || 0,
      'inProgress': counts['04 - In Progress'] || 0,
      'postGoLive': counts['05 - Post Go-Live'] || 0,
      'complete': counts['06 - Complete'] || 0,
      'pitTeam': counts['00 - PIT Team Planning/Scheduling Activity'] || 0,
      'facilityLed': counts['07 - Facility Led Project - Tracking Purpose Only'] || 0,
      'onHold': counts['08 - On Hold'] || 0,
      'unknown': counts['Unknown'] || 0
    };
  });

  // Format data for project lead chart
  const leadChartData = projectLeadAllocation.map(lead => {
    // Count projects by status for this project lead
    const counts: Record<string, number> = {};
    
    filteredData.forEach(project => {
      if (project['OH Project Lead'] && project['OH Project Lead'].trim() === lead.name) {
        const status = project['Project Status'] || 'Unknown';
        counts[status] = (counts[status] || 0) + 1;
      }
    });
    
    // Map all statuses individually
    return {
      ...lead,
      'investigation': counts['01 - Investigation'] || 0,
      'planning': counts['03 - Planning'] || 0,
      'inProgress': counts['04 - In Progress'] || 0,
      'postGoLive': counts['05 - Post Go-Live'] || 0,
      'complete': counts['06 - Complete'] || 0,
      'pitTeam': counts['00 - PIT Team Planning/Scheduling Activity'] || 0,
      'facilityLed': counts['07 - Facility Led Project - Tracking Purpose Only'] || 0,
      'onHold': counts['08 - On Hold'] || 0,
      'unknown': counts['Unknown'] || 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Resource Workload by Project Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Specialist Workload by Project Status</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              layout="vertical"
              margin={{ top: 20, right: 20, bottom: 20, left: 120 }}
              data={resourceChartData}
            >
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" scale="band" width={110} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="investigation" stackId="a" name="Investigation" fill="#3498db" />
              <Bar dataKey="planning" stackId="a" name="Planning" fill="#2980b9" />
              <Bar dataKey="inProgress" stackId="a" name="In Progress" fill="#1abc9c" />
              <Bar dataKey="postGoLive" stackId="a" name="Post Go-Live" fill="#f1c40f" />
              <Bar dataKey="complete" stackId="a" name="Complete" fill="#2ecc71" />
              <Bar dataKey="pitTeam" stackId="a" name="PIT Team Planning" fill="#9b59b6" />
              <Bar dataKey="facilityLed" stackId="a" name="Facility Led" fill="#34495e" />
              <Bar dataKey="onHold" stackId="a" name="On Hold" fill="#e67e22" />
              <Bar dataKey="unknown" stackId="a" name="Unknown" fill="#95a5a6" />
              <Line dataKey="count" name="Total Projects" stroke="#e74c3c" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Project Lead Workload by Project Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">OH Project Lead Workload by Project Status</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              layout="vertical"
              margin={{ top: 20, right: 20, bottom: 20, left: 120 }}
              data={leadChartData}
            >
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" scale="band" width={110} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="investigation" stackId="a" name="Investigation" fill="#3498db" />
              <Bar dataKey="planning" stackId="a" name="Planning" fill="#2980b9" />
              <Bar dataKey="inProgress" stackId="a" name="In Progress" fill="#1abc9c" />
              <Bar dataKey="postGoLive" stackId="a" name="Post Go-Live" fill="#f1c40f" />
              <Bar dataKey="complete" stackId="a" name="Complete" fill="#2ecc71" />
              <Bar dataKey="pitTeam" stackId="a" name="PIT Team Planning" fill="#9b59b6" />
              <Bar dataKey="facilityLed" stackId="a" name="Facility Led" fill="#34495e" />
              <Bar dataKey="onHold" stackId="a" name="On Hold" fill="#e67e22" />
              <Bar dataKey="unknown" stackId="a" name="Unknown" fill="#95a5a6" />
              <Line dataKey="count" name="Total Projects" stroke="#e74c3c" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ResourcesTab;